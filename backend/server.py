from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel, Field
import httpx

from moderation import moderate

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
db_name = os.environ.get("DB_NAME", "tani_archive")
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI()
api_router = APIRouter(prefix="/api")

EMERGENT_SESSION_DATA_URL = (
    "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
)
SESSION_TTL_DAYS = 7

# Allowed media
ALLOWED_AUDIO = {"audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm", "audio/mp4"}
ALLOWED_VIDEO = {"video/mp4", "video/webm", "video/ogg", "video/quicktime"}
ALLOWED_IMAGE = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_UPLOAD_MB = 25


# ------------ Models ------------
class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None


class SessionRequest(BaseModel):
    session_id: str


class PostCreate(BaseModel):
    title: str
    category: str
    description: str
    imageUrl: Optional[str] = None
    audioUrl: Optional[str] = None
    videoUrl: Optional[str] = None


class Post(BaseModel):
    id: str
    title: str
    category: str
    description: str
    imageUrl: Optional[str] = None
    audioUrl: Optional[str] = None
    videoUrl: Optional[str] = None
    author: dict
    createdAt: str


# ------------ Auth helpers ------------
async def get_current_user(request: Request) -> User:
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.lower().startswith("bearer "):
            token = auth.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")

    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")

    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user_doc)


# ------------ Auth Routes ------------
@api_router.post("/auth/session")
async def create_session(payload: SessionRequest, response: Response):
    async with httpx.AsyncClient(timeout=15.0) as http:
        r = await http.get(
            EMERGENT_SESSION_DATA_URL,
            headers={"X-Session-ID": payload.session_id},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session_id")
    data = r.json()

    email = data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Missing email in auth data")

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": data.get("name", existing.get("name")),
                       "picture": data.get("picture", existing.get("picture"))}},
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one(
            {
                "user_id": user_id,
                "email": email,
                "name": data.get("name", ""),
                "picture": data.get("picture", ""),
                "created_at": datetime.now(timezone.utc),
            }
        )

    session_token = data.get("session_token") or uuid.uuid4().hex
    expires_at = datetime.now(timezone.utc) + timedelta(days=SESSION_TTL_DAYS)
    await db.user_sessions.insert_one(
        {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at,
            "created_at": datetime.now(timezone.utc),
        }
    )

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=SESSION_TTL_DAYS * 24 * 60 * 60,
        path="/",
    )

    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return {"user": User(**user_doc), "session_token": session_token}


@api_router.get("/auth/me")
async def get_me(user: User = Depends(get_current_user)):
    return user


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_many({"session_token": token})
    response.delete_cookie("session_token", path="/", samesite="none", secure=True)
    return {"ok": True}


# ------------ Upload ------------
@api_router.post("/uploads")
async def upload_file(file: UploadFile = File(...), user: User = Depends(get_current_user)):
    """Accept image/audio/video, store on disk, return public URL under /api/uploads/<file>."""
    ct = (file.content_type or "").lower()
    if ct in ALLOWED_IMAGE:
        kind = "image"
    elif ct in ALLOWED_AUDIO:
        kind = "audio"
    elif ct in ALLOWED_VIDEO:
        kind = "video"
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported content-type: {ct}")

    data = await file.read()
    size_mb = len(data) / (1024 * 1024)
    if size_mb > MAX_UPLOAD_MB:
        raise HTTPException(status_code=413, detail=f"File too large ({size_mb:.1f} MB > {MAX_UPLOAD_MB} MB)")

    ext = os.path.splitext(file.filename or "")[1].lower() or ""
    if not ext:
        ext = {"image": ".jpg", "audio": ".mp3", "video": ".mp4"}[kind]
    name = f"{uuid.uuid4().hex}{ext}"
    (UPLOAD_DIR / name).write_bytes(data)
    return {"url": f"/api/uploads/{name}", "kind": kind, "size": len(data)}


@api_router.get("/uploads/{path:path}")
async def serve_upload(path: str):
    # Prevent path traversal
    safe = os.path.normpath(path).lstrip("/")
    if ".." in safe.split("/"):
        raise HTTPException(status_code=400, detail="Invalid path")
    fp = UPLOAD_DIR / safe
    if not fp.exists() or not fp.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(str(fp))


# ------------ Posts Routes ------------
@api_router.get("/posts")
async def list_posts():
    docs = await db.posts.find({}, {"_id": 0}).sort("createdAt", -1).to_list(500)
    return docs


@api_router.post("/posts")
async def create_post(payload: PostCreate, user: User = Depends(get_current_user)):
    if not payload.title.strip() or not payload.description.strip():
        raise HTTPException(status_code=400, detail="Title and description are required")

    combined = f"{payload.title}\n{payload.description}"
    allowed, reason = await moderate(combined)
    if not allowed:
        raise HTTPException(status_code=400, detail=reason or "Content blocked by moderation")

    post = {
        "id": f"p_{uuid.uuid4().hex[:12]}",
        "title": payload.title.strip(),
        "category": payload.category,
        "description": payload.description.strip(),
        "imageUrl": payload.imageUrl,
        "audioUrl": payload.audioUrl,
        "videoUrl": payload.videoUrl,
        "author": {
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email,
            "picture": user.picture,
        },
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    await db.posts.insert_one(post)
    return {k: v for k, v in post.items() if k != "_id"}


@api_router.delete("/posts/{post_id}")
async def delete_post(post_id: str, user: User = Depends(get_current_user)):
    doc = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Post not found")
    if doc["author"].get("user_id") != user.user_id and doc["author"].get("email") != user.email:
        raise HTTPException(status_code=403, detail="You can only delete your own post")
    await db.posts.delete_one({"id": post_id})
    return {"ok": True}


# ------------ Content routes ------------
SEED_ARTICLES = [
    {
        "id": "ali-ai-ligang",
        "category": "Festival",
        "title": "Ali\u2013Ai\u2013L\u00edgang: The Spring Sowing Festival of the Mising",
        "excerpt": "An introduction to the Mising spring festival that marks the beginning of the sowing season with G\u00fcmr\u00e1g Som\u00e1n dance in Ege\u2013Gasor attire.",
        "image": "/api/uploads/generated/hero_ali_ai_ligang_1.png",
        "featured": True,
    },
    {
        "id": "mising-script",
        "category": "Language",
        "title": "Reading Mising: The Roman-Mising Script",
        "excerpt": "Exploring the Tani linguistic roots and how Mising is written today using an adapted Roman orthography.",
        "image": None,
    },
    {
        "id": "tani-clan-names",
        "category": "Language",
        "title": "Historical Tani Clan Names",
        "excerpt": "Meaning of some historical Tani clan names \u2014 Pegu, Do:ley, Kutum, Pait, Taid \u2014 and their oral genealogies.",
        "image": None,
    },
    {
        "id": "kebang-system",
        "category": "History",
        "title": "Kebang: The Traditional Village Council",
        "excerpt": "A primer on the Kebang system of self-governance practised by the Tani communities long before modern administration.",
        "image": None,
    },
]


@api_router.get("/content/articles")
async def get_articles():
    return SEED_ARTICLES


@api_router.get("/")
async def root():
    return {"message": "Tani Archive API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
