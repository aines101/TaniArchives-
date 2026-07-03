#!/usr/bin/env python3
"""
Tani Archive Backend API Test Suite
Tests all backend endpoints including auth, posts CRUD, uploads, and moderation
"""
import requests
import json
import sys
import os
import io
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient

# Load environment variables
BACKEND_URL = "http://localhost:8000/api"
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "test_database"

# Test results tracking
test_results = []
test_user_id = None
test_session_token = None
test_post_id = None
second_user_id = None
second_session_token = None
uploaded_files = []  # Track uploaded files for cleanup


def log_test(test_name, passed, details=""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    result = f"{status} - {test_name}"
    if details:
        result += f"\n    Details: {details}"
    print(result)
    test_results.append({"test": test_name, "passed": passed, "details": details})


def create_test_user_in_db():
    """Create a test user and session directly in MongoDB"""
    global test_user_id, test_session_token
    
    try:
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        
        # Generate unique identifiers
        timestamp = int(datetime.now().timestamp() * 1000)
        test_user_id = f"test_user_{timestamp}"
        test_session_token = f"test_session_{timestamp}"
        test_email = f"test.user.{timestamp}@taniarchive.test"
        
        # Insert test user
        user_doc = {
            "user_id": test_user_id,
            "email": test_email,
            "name": "Test User Tani",
            "picture": "https://via.placeholder.com/150",
            "created_at": datetime.now(timezone.utc)
        }
        db.users.insert_one(user_doc)
        
        # Insert test session
        session_doc = {
            "user_id": test_user_id,
            "session_token": test_session_token,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
            "created_at": datetime.now(timezone.utc)
        }
        db.user_sessions.insert_one(session_doc)
        
        print(f"\n📝 Created test user in MongoDB:")
        print(f"   User ID: {test_user_id}")
        print(f"   Email: {test_email}")
        print(f"   Session Token: {test_session_token}\n")
        
        client.close()
        return True
    except Exception as e:
        print(f"❌ Failed to create test user in DB: {e}")
        return False


def create_second_test_user_in_db():
    """Create a second test user for authorization testing"""
    global second_user_id, second_session_token
    
    try:
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        
        # Generate unique identifiers
        timestamp = int(datetime.now().timestamp() * 1000) + 1
        second_user_id = f"test_user_{timestamp}"
        second_session_token = f"test_session_{timestamp}"
        test_email = f"test.user.{timestamp}@taniarchive.test"
        
        # Insert second test user
        user_doc = {
            "user_id": second_user_id,
            "email": test_email,
            "name": "Second Test User",
            "picture": "https://via.placeholder.com/150",
            "created_at": datetime.now(timezone.utc)
        }
        db.users.insert_one(user_doc)
        
        # Insert second test session
        session_doc = {
            "user_id": second_user_id,
            "session_token": second_session_token,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
            "created_at": datetime.now(timezone.utc)
        }
        db.user_sessions.insert_one(session_doc)
        
        print(f"📝 Created second test user in MongoDB:")
        print(f"   User ID: {second_user_id}")
        print(f"   Session Token: {second_session_token}\n")
        
        client.close()
        return True
    except Exception as e:
        print(f"❌ Failed to create second test user in DB: {e}")
        return False


def cleanup_test_data():
    """Clean up test data from MongoDB and uploaded files"""
    try:
        client = MongoClient(MONGO_URL)
        db = client[DB_NAME]
        
        # Delete test users
        if test_user_id:
            db.users.delete_many({"user_id": test_user_id})
            db.user_sessions.delete_many({"user_id": test_user_id})
        
        if second_user_id:
            db.users.delete_many({"user_id": second_user_id})
            db.user_sessions.delete_many({"user_id": second_user_id})
        
        # Delete test posts
        if test_post_id:
            db.posts.delete_many({"id": test_post_id})
        
        # Delete any posts created by test users
        if test_user_id:
            db.posts.delete_many({"author.user_id": test_user_id})
        if second_user_id:
            db.posts.delete_many({"author.user_id": second_user_id})
        
        print("\n🧹 Cleaned up test data from MongoDB")
        client.close()
        
        # Delete uploaded files
        for file_url in uploaded_files:
            try:
                # Extract filename from URL like /api/uploads/abc123.png
                filename = file_url.split('/')[-1]
                file_path = f"/app/backend/uploads/{filename}"
                if os.path.exists(file_path):
                    os.remove(file_path)
                    print(f"   Deleted uploaded file: {filename}")
            except Exception as e:
                print(f"   Warning: Failed to delete {file_url}: {e}")
        
    except Exception as e:
        print(f"⚠️  Warning: Failed to clean up test data: {e}")


def test_1_root_endpoint():
    """Test 1: GET /api/ -> 200 with hello message"""
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data:
                log_test("GET /api/ returns 200 with message", True, f"Message: {data['message']}")
            else:
                log_test("GET /api/ returns 200 with message", False, "No 'message' field in response")
        else:
            log_test("GET /api/ returns 200 with message", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("GET /api/ returns 200 with message", False, str(e))


def test_2_content_articles():
    """Test 2: GET /api/content/articles -> 200 list length >= 4"""
    try:
        response = requests.get(f"{BACKEND_URL}/content/articles", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) >= 4:
                log_test("GET /api/content/articles returns >= 4 articles", True, f"Found {len(data)} articles")
            else:
                log_test("GET /api/content/articles returns >= 4 articles", False, f"Found {len(data) if isinstance(data, list) else 0} articles")
        else:
            log_test("GET /api/content/articles returns >= 4 articles", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("GET /api/content/articles returns >= 4 articles", False, str(e))


def test_3_auth_me_without_credentials():
    """Test 3: GET /api/auth/me without credentials -> 401"""
    try:
        response = requests.get(f"{BACKEND_URL}/auth/me", timeout=10)
        
        if response.status_code == 401:
            log_test("GET /api/auth/me without credentials returns 401", True, "Correctly rejected")
        else:
            log_test("GET /api/auth/me without credentials returns 401", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("GET /api/auth/me without credentials returns 401", False, str(e))


def test_4_auth_me_with_bearer_token():
    """Test 4: GET /api/auth/me with Bearer token -> 200 with user object"""
    try:
        headers = {"Authorization": f"Bearer {test_session_token}"}
        response = requests.get(f"{BACKEND_URL}/auth/me", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["user_id", "email", "name"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if not missing_fields and data["user_id"] == test_user_id:
                log_test("GET /api/auth/me with Bearer token returns user", True, 
                        f"User: {data['name']} ({data['email']})")
            else:
                log_test("GET /api/auth/me with Bearer token returns user", False, 
                        f"Missing fields: {missing_fields}" if missing_fields else "user_id mismatch")
        else:
            log_test("GET /api/auth/me with Bearer token returns user", False, 
                    f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("GET /api/auth/me with Bearer token returns user", False, str(e))


def test_5_get_posts_public():
    """Test 5: GET /api/posts (public) -> 200 list"""
    try:
        response = requests.get(f"{BACKEND_URL}/posts", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                log_test("GET /api/posts (public) returns 200 list", True, f"Found {len(data)} posts")
            else:
                log_test("GET /api/posts (public) returns 200 list", False, "Response is not a list")
        else:
            log_test("GET /api/posts (public) returns 200 list", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("GET /api/posts (public) returns 200 list", False, str(e))


def test_6_post_without_auth():
    """Test 6: POST /api/posts without auth -> 401"""
    try:
        payload = {
            "title": "Unauthorized Test Post",
            "category": "Memory",
            "description": "This should fail"
        }
        response = requests.post(f"{BACKEND_URL}/posts", json=payload, timeout=10)
        
        if response.status_code == 401:
            log_test("POST /api/posts without auth returns 401", True, "Correctly rejected")
        else:
            log_test("POST /api/posts without auth returns 401", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("POST /api/posts without auth returns 401", False, str(e))


def test_7_post_with_auth():
    """Test 7: POST /api/posts with Bearer token -> 200 with created post"""
    global test_post_id
    
    try:
        headers = {"Authorization": f"Bearer {test_session_token}"}
        payload = {
            "title": "Test Post from Tani Archive",
            "category": "Memory",
            "description": "Hello Tani - This is a test post about our rich cultural heritage"
        }
        response = requests.post(f"{BACKEND_URL}/posts", json=payload, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["id", "title", "author"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if not missing_fields:
                test_post_id = data["id"]
                author_user_id = data.get("author", {}).get("user_id")
                
                if author_user_id == test_user_id:
                    log_test("POST /api/posts with auth creates post", True, 
                            f"Created post ID: {test_post_id}, Author matches")
                else:
                    log_test("POST /api/posts with auth creates post", False, 
                            f"Author user_id mismatch: expected {test_user_id}, got {author_user_id}")
            else:
                log_test("POST /api/posts with auth creates post", False, f"Missing fields: {missing_fields}")
        else:
            log_test("POST /api/posts with auth creates post", False, 
                    f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("POST /api/posts with auth creates post", False, str(e))


def test_8_get_posts_contains_created():
    """Test 8: GET /api/posts again -> list contains the created post"""
    try:
        response = requests.get(f"{BACKEND_URL}/posts", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                post_ids = [p.get("id") for p in data]
                if test_post_id in post_ids:
                    log_test("GET /api/posts contains created post", True, f"Post {test_post_id} found in list")
                else:
                    log_test("GET /api/posts contains created post", False, 
                            f"Post {test_post_id} not found. Available IDs: {post_ids[:5]}")
            else:
                log_test("GET /api/posts contains created post", False, "Response is not a list")
        else:
            log_test("GET /api/posts contains created post", False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("GET /api/posts contains created post", False, str(e))


def test_9_delete_own_post():
    """Test 9: DELETE /api/posts/{id} with same Bearer token -> 200"""
    try:
        headers = {"Authorization": f"Bearer {test_session_token}"}
        response = requests.delete(f"{BACKEND_URL}/posts/{test_post_id}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok"):
                log_test("DELETE /api/posts/{id} with owner token succeeds", True, "Post deleted successfully")
            else:
                log_test("DELETE /api/posts/{id} with owner token succeeds", False, "Response missing 'ok' field")
        else:
            log_test("DELETE /api/posts/{id} with owner token succeeds", False, 
                    f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("DELETE /api/posts/{id} with owner token succeeds", False, str(e))


def test_10_delete_other_user_post():
    """Test 10: Attempt DELETE /api/posts/{id} with different user's token -> 403"""
    global test_post_id
    
    try:
        # First, create a new post with the first user
        headers = {"Authorization": f"Bearer {test_session_token}"}
        payload = {
            "title": "Post to test authorization",
            "category": "Memory",
            "description": "This post will be used to test cross-user deletion"
        }
        response = requests.post(f"{BACKEND_URL}/posts", json=payload, headers=headers, timeout=10)
        
        if response.status_code != 200:
            log_test("DELETE /api/posts/{id} with different user returns 403", False, 
                    "Failed to create test post for authorization test")
            return
        
        test_post_id = response.json()["id"]
        
        # Now try to delete with second user's token
        headers2 = {"Authorization": f"Bearer {second_session_token}"}
        response = requests.delete(f"{BACKEND_URL}/posts/{test_post_id}", headers=headers2, timeout=10)
        
        if response.status_code == 403:
            log_test("DELETE /api/posts/{id} with different user returns 403", True, 
                    "Correctly rejected unauthorized deletion")
        else:
            log_test("DELETE /api/posts/{id} with different user returns 403", False, 
                    f"Status: {response.status_code}, Expected 403")
    except Exception as e:
        log_test("DELETE /api/posts/{id} with different user returns 403", False, str(e))


def create_test_png():
    """Create a minimal valid PNG file in memory (1x1 pixel)"""
    # Minimal PNG: 1x1 red pixel
    png_data = (
        b'\x89PNG\r\n\x1a\n'  # PNG signature
        b'\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
        b'\x08\x02\x00\x00\x00\x90wS\xde'  # IHDR chunk
        b'\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf\xc0\x00\x00\x00\x03\x00\x01'
        b'\x00\x00\x00\x00\x00\x00\x00\x00'  # IDAT chunk
        b'\x00\x00\x00\x00IEND\xaeB`\x82'  # IEND chunk
    )
    return io.BytesIO(png_data)


def create_test_mp3():
    """Create a minimal valid MP3 file in memory"""
    # Minimal MP3 frame header + some data
    mp3_data = (
        b'\xff\xfb\x90\x00'  # MP3 frame sync + header
        b'\x00' * 100  # Some audio data
    )
    return io.BytesIO(mp3_data)


def test_11_upload_without_auth():
    """Test 11: POST /api/uploads without auth -> 401"""
    try:
        files = {'file': ('test.png', create_test_png(), 'image/png')}
        response = requests.post(f"{BACKEND_URL}/uploads", files=files, timeout=10)
        
        if response.status_code == 401:
            log_test("POST /api/uploads without auth returns 401", True, "Correctly rejected")
        else:
            log_test("POST /api/uploads without auth returns 401", False, 
                    f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("POST /api/uploads without auth returns 401", False, str(e))


def test_12_upload_png_with_auth():
    """Test 12: POST /api/uploads with Bearer token and PNG -> 200 with url, kind, size"""
    global uploaded_files
    
    try:
        headers = {"Authorization": f"Bearer {test_session_token}"}
        files = {'file': ('test.png', create_test_png(), 'image/png')}
        response = requests.post(f"{BACKEND_URL}/uploads", files=files, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["url", "kind", "size"]
            missing_fields = [f for f in required_fields if f not in data]
            
            if not missing_fields:
                if data["kind"] == "image" and data["url"].startswith("/api/uploads/"):
                    uploaded_files.append(data["url"])
                    log_test("POST /api/uploads with PNG returns 200 with url/kind/size", True, 
                            f"URL: {data['url']}, kind: {data['kind']}, size: {data['size']} bytes")
                else:
                    log_test("POST /api/uploads with PNG returns 200 with url/kind/size", False, 
                            f"Invalid kind ({data['kind']}) or url ({data['url']})")
            else:
                log_test("POST /api/uploads with PNG returns 200 with url/kind/size", False, 
                        f"Missing fields: {missing_fields}")
        else:
            log_test("POST /api/uploads with PNG returns 200 with url/kind/size", False, 
                    f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("POST /api/uploads with PNG returns 200 with url/kind/size", False, str(e))


def test_13_get_uploaded_file():
    """Test 13: GET uploaded file URL -> 200 with non-empty body"""
    try:
        if not uploaded_files:
            log_test("GET uploaded file returns 200 with content", False, "No uploaded files to test")
            return
        
        # Get the first uploaded file
        file_url = uploaded_files[0]
        full_url = f"{BACKEND_URL.rsplit('/api', 1)[0]}{file_url}"
        
        response = requests.get(full_url, timeout=10)
        
        if response.status_code == 200:
            if len(response.content) > 0:
                log_test("GET uploaded file returns 200 with content", True, 
                        f"File size: {len(response.content)} bytes")
            else:
                log_test("GET uploaded file returns 200 with content", False, "Empty response body")
        else:
            log_test("GET uploaded file returns 200 with content", False, 
                    f"Status: {response.status_code}")
    except Exception as e:
        log_test("GET uploaded file returns 200 with content", False, str(e))


def test_14_upload_mp3_with_auth():
    """Test 14: POST /api/uploads with MP3 file -> 200 with kind=audio"""
    global uploaded_files
    
    try:
        headers = {"Authorization": f"Bearer {test_session_token}"}
        files = {'file': ('test.mp3', create_test_mp3(), 'audio/mpeg')}
        response = requests.post(f"{BACKEND_URL}/uploads", files=files, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("kind") == "audio" and data.get("url", "").startswith("/api/uploads/"):
                uploaded_files.append(data["url"])
                log_test("POST /api/uploads with MP3 returns kind=audio", True, 
                        f"URL: {data['url']}, size: {data['size']} bytes")
            else:
                log_test("POST /api/uploads with MP3 returns kind=audio", False, 
                        f"Invalid kind: {data.get('kind')} or url: {data.get('url')}")
        else:
            log_test("POST /api/uploads with MP3 returns kind=audio", False, 
                    f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("POST /api/uploads with MP3 returns kind=audio", False, str(e))


def test_15_upload_unsupported_type():
    """Test 15: POST /api/uploads with PDF content-type -> 400"""
    try:
        headers = {"Authorization": f"Bearer {test_session_token}"}
        files = {'file': ('test.pdf', io.BytesIO(b'fake pdf content'), 'application/pdf')}
        response = requests.post(f"{BACKEND_URL}/uploads", files=files, headers=headers, timeout=10)
        
        if response.status_code == 400:
            log_test("POST /api/uploads with PDF returns 400", True, 
                    f"Correctly rejected: {response.json().get('detail', '')}")
        else:
            log_test("POST /api/uploads with PDF returns 400", False, 
                    f"Status: {response.status_code}, Expected 400")
    except Exception as e:
        log_test("POST /api/uploads with PDF returns 400", False, str(e))


def test_16_post_with_audio_video_urls():
    """Test 16: POST /api/posts with audioUrl and videoUrl -> 200 with fields present"""
    global test_post_id
    
    try:
        headers = {"Authorization": f"Bearer {test_session_token}"}
        payload = {
            "title": "Oi Nitom - Traditional Mising Song",
            "category": "Song",
            "description": "Sharing an Oi Nitom recording from our village",
            "audioUrl": "/api/uploads/abc123.mp3",
            "videoUrl": "https://www.youtube.com/watch?v=abc12345678"
        }
        response = requests.post(f"{BACKEND_URL}/posts", json=payload, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "audioUrl" in data and "videoUrl" in data:
                test_post_id = data["id"]
                log_test("POST /api/posts with audioUrl+videoUrl returns 200", True, 
                        f"Post created with audioUrl: {data['audioUrl']}, videoUrl: {data['videoUrl']}")
            else:
                log_test("POST /api/posts with audioUrl+videoUrl returns 200", False, 
                        "Response missing audioUrl or videoUrl fields")
        else:
            log_test("POST /api/posts with audioUrl+videoUrl returns 200", False, 
                    f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        log_test("POST /api/posts with audioUrl+videoUrl returns 200", False, str(e))


def test_17_post_with_profanity():
    """Test 17: POST /api/posts with profanity -> 400 blocked by moderation"""
    try:
        headers = {"Authorization": f"Bearer {test_session_token}"}
        payload = {
            "title": "Test Moderation",
            "category": "Memory",
            "description": "fuck this shit"  # Explicit profanity to trigger moderation
        }
        response = requests.post(f"{BACKEND_URL}/posts", json=payload, headers=headers, timeout=10)
        
        if response.status_code == 400:
            detail = response.json().get("detail", "")
            log_test("POST /api/posts with profanity returns 400", True, 
                    f"Correctly blocked: {detail}")
        else:
            log_test("POST /api/posts with profanity returns 400", False, 
                    f"Status: {response.status_code}, Expected 400 (blocked by moderation)")
    except Exception as e:
        log_test("POST /api/posts with profanity returns 400", False, str(e))


def test_18_auth_me_sanity_check():
    """Test 18: Sanity check - GET /api/auth/me still works with token"""
    try:
        headers = {"Authorization": f"Bearer {test_session_token}"}
        response = requests.get(f"{BACKEND_URL}/auth/me", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "user_id" in data and data["user_id"] == test_user_id:
                log_test("GET /api/auth/me sanity check passes", True, 
                        f"Auth still working for user: {data['name']}")
            else:
                log_test("GET /api/auth/me sanity check passes", False, "user_id mismatch")
        else:
            log_test("GET /api/auth/me sanity check passes", False, 
                    f"Status: {response.status_code}")
    except Exception as e:
        log_test("GET /api/auth/me sanity check passes", False, str(e))


def print_summary():
    """Print test summary"""
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    
    passed = sum(1 for r in test_results if r["passed"])
    total = len(test_results)
    
    print(f"\nTotal Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    print(f"Success Rate: {(passed/total*100):.1f}%\n")
    
    if total - passed > 0:
        print("Failed Tests:")
        for r in test_results:
            if not r["passed"]:
                print(f"  ❌ {r['test']}")
                if r["details"]:
                    print(f"     {r['details']}")
    
    print("="*70 + "\n")
    
    return passed == total


def main():
    """Main test execution"""
    print("="*70)
    print("TANI ARCHIVE BACKEND API TEST SUITE")
    print("="*70)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"MongoDB: {MONGO_URL}/{DB_NAME}")
    print("="*70 + "\n")
    
    # Create test users in MongoDB
    if not create_test_user_in_db():
        print("❌ Failed to create test user. Aborting tests.")
        return False
    
    if not create_second_test_user_in_db():
        print("❌ Failed to create second test user. Some tests will be skipped.")
    
    try:
        # Run all tests
        print("\n--- Basic API Tests ---")
        test_1_root_endpoint()
        test_2_content_articles()
        
        print("\n--- Auth Tests ---")
        test_3_auth_me_without_credentials()
        test_4_auth_me_with_bearer_token()
        
        print("\n--- Posts CRUD Tests ---")
        test_5_get_posts_public()
        test_6_post_without_auth()
        test_7_post_with_auth()
        test_8_get_posts_contains_created()
        test_9_delete_own_post()
        
        if second_session_token:
            test_10_delete_other_user_post()
        else:
            print("⚠️  Skipping test 10 (cross-user authorization) - second user not created")
        
        print("\n--- Upload Tests (NEW) ---")
        test_11_upload_without_auth()
        test_12_upload_png_with_auth()
        test_13_get_uploaded_file()
        test_14_upload_mp3_with_auth()
        test_15_upload_unsupported_type()
        
        print("\n--- Posts with Media URLs (NEW) ---")
        test_16_post_with_audio_video_urls()
        
        print("\n--- Content Moderation Tests (NEW) ---")
        test_17_post_with_profanity()
        
        print("\n--- Sanity Check ---")
        test_18_auth_me_sanity_check()
        
        # Print summary
        all_passed = print_summary()
        
        return all_passed
        
    finally:
        # Always clean up
        cleanup_test_data()


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
