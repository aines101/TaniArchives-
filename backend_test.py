#!/usr/bin/env python3
"""
Tani Archive Backend API Test Suite
Tests all backend endpoints including auth and posts CRUD
"""
import requests
import json
import sys
import os
from datetime import datetime, timezone, timedelta
from pymongo import MongoClient

# Load environment variables
BACKEND_URL = "https://mising-tribe-hub.preview.emergentagent.com/api"
MONGO_URL = "mongodb://localhost:27017"
DB_NAME = "test_database"

# Test results tracking
test_results = []
test_user_id = None
test_session_token = None
test_post_id = None
second_user_id = None
second_session_token = None


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
    """Clean up test data from MongoDB"""
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
        test_1_root_endpoint()
        test_2_content_articles()
        test_3_auth_me_without_credentials()
        test_4_auth_me_with_bearer_token()
        test_5_get_posts_public()
        test_6_post_without_auth()
        test_7_post_with_auth()
        test_8_get_posts_contains_created()
        test_9_delete_own_post()
        
        if second_session_token:
            test_10_delete_other_user_post()
        else:
            print("⚠️  Skipping test 10 (cross-user authorization) - second user not created")
        
        # Print summary
        all_passed = print_summary()
        
        return all_passed
        
    finally:
        # Always clean up
        cleanup_test_data()


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
