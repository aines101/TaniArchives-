# Auth-Gated App Testing Playbook

## Step 1: Create Test User & Session
```
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Test Backend API
```
curl -X GET "$BACKEND_URL/api/auth/me" -H "Authorization: Bearer $SESSION_TOKEN"
curl -X GET "$BACKEND_URL/api/posts"
curl -X POST "$BACKEND_URL/api/posts" -H "Content-Type: application/json" -H "Authorization: Bearer $SESSION_TOKEN" -d '{"title":"Test","category":"Memory","description":"desc"}'
```

## Step 3: Browser testing
Set cookie session_token then navigate to /community. Verify /api/auth/me returns user, and creating a post works.

## Checklist
- users doc uses user_id (not _id) as identifier
- session.user_id matches user.user_id
- All queries use projection {_id:0}
- Backend session verification checks cookie first, then Authorization header
- Timezone-aware datetimes
