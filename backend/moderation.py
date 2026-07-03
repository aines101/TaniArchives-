"""Content moderation for user posts.

- Fast keyword safety net (locally, deterministic)
- AI moderation via Emergent LLM (LiteLLM/OpenAI compatible)

Returns: (allowed: bool, reason: str)
"""
import os
import re
from typing import Tuple
import httpx

# Deliberately conservative keyword list \u2014 blocks obvious explicit / 18+ / hate terms.
# Kept small on purpose; the AI layer catches the nuance.
_BLOCK_PATTERNS = [
    r"\b(porn|pornographic|xxx|nsfw|18\+|sex\s?video|nude|naked\s+photo)\b",
    r"\b(f[u\*]ck|sh[i\*]t|b[i\*]tch|c[u\*]nt|d[i\*]ck|a[s\*]{2}hole)\b",
    r"\b(kill\s+yourself|kys|suicide\s+method)\b",
    r"\b(rape|molest|paedo|pedo)\b",
    r"\b(nigger|chink|paki|retard)\b",
]

_BLOCK_RE = re.compile("|".join(_BLOCK_PATTERNS), re.IGNORECASE)


def keyword_check(text: str) -> Tuple[bool, str]:
    if not text:
        return True, ""
    m = _BLOCK_RE.search(text)
    if m:
        return False, f"Contains disallowed language ({m.group(0)!r})."
    return True, ""


async def ai_moderate(text: str) -> Tuple[bool, str]:
    """Ask a local LLM service to classify the text.

    Prefer a locally-hosted inference endpoint (set `LOCAL_MODERATION_URL`). The
    endpoint is expected to return a text response containing either 'ALLOW' or
    'BLOCK' (case-insensitive). If the local service is unavailable we fail-open
    (allow) so the keyword safety net remains the final guard.
    """
    if not text or not text.strip():
        return True, ""

    url = os.environ.get("LOCAL_MODERATION_URL", "http://localhost:8080/v1/generate")

    system = (
        "You are a strict content moderator for a cultural preservation community. "
        "Return exactly one word: ALLOW or BLOCK. "
        "Block if the text contains sexually explicit, pornographic, 18+, gratuitous violence, "
        "self-harm instructions, hate speech targeting any ethnicity/religion, or explicit slurs. "
        "Allow ordinary cultural, personal, and everyday content — including mentions of ritual, "
        "food, drink, festivals and love songs. Reply with ONLY 'ALLOW' or 'BLOCK'."
    )

    payload = {"input": text[:4000], "system": system}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.post(url, json=payload)
        if r.status_code != 200:
            return True, ""
        data = r.json()

        def find_text(obj):
            if obj is None:
                return None
            if isinstance(obj, str):
                return obj
            if isinstance(obj, dict):
                for k in ("text", "generated_text", "output", "content"):
                    if k in obj and isinstance(obj[k], str):
                        return obj[k]
                for v in obj.values():
                    t = find_text(v)
                    if t:
                        return t
            if isinstance(obj, list):
                for item in obj:
                    t = find_text(item)
                    if t:
                        return t
            return None

        out = find_text(data) or ""
        verdict = out.strip().upper()
        if verdict.startswith("BLOCK"):
            return False, "Blocked by content policy (18+ / explicit / hate)."
        return True, ""
    except Exception:
        # Fail open — the keyword net still applies.
        return True, ""


async def moderate(text: str) -> Tuple[bool, str]:
    ok, why = keyword_check(text)
    if not ok:
        return False, why
    return await ai_moderate(text)
