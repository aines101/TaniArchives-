# Tani Archive API Contracts

## Backend base: `${REACT_APP_BACKEND_URL}/api`

## Auth (Emergent Google OAuth)
- Frontend redirects to `https://auth.emergentagent.com/?redirect=<origin>/community`
- On return, URL has `#session_id=...`
- Frontend detects fragment and POSTs to `POST /api/auth/session` with `{ session_id }`
- Backend calls Emergent `/auth/v1/env/oauth/session-data` server-side, upserts user, creates session_token, sets `session_token` httpOnly cookie, returns user JSON.
- `GET /api/auth/me` — returns current user based on cookie or Authorization header.
- `POST /api/auth/logout` — clears session in DB & cookie.

## Community Posts
- `GET /api/posts` (public) — returns list newest-first.
- `POST /api/posts` (auth required) — body: `{title, category, imageUrl?, description}` → creates post with author = current user.
- `DELETE /api/posts/{id}` (auth, author-only)

## Content Endpoints (public, mock-backed for now)
- `GET /api/content/articles` — returns hero + featured + latest
- `GET /api/content/manuscripts`
- `GET /api/content/folktales`
- `GET /api/content/videos`
These are seeded from mock data on backend startup so backend is source of truth even before richer content pipeline.

## Frontend integration changes
- `AuthContext` will call `/api/auth/me` on mount (skipping if `#session_id` present), `loginWithGoogle()` redirects to Emergent, `logout()` calls backend.
- `PostsContext` will fetch posts from `/api/posts`, add via `POST /api/posts` (credentials:include), delete via API.
- `Login.jsx` will call `signInWithGoogle` → emergent auth URL.
- Mock data in `mock.js` for content sections continues to power home page but Community + Auth are real.

## Mocked → real
- `AuthContext`: mocked localStorage user → real cookie-based session via Emergent auth.
- `PostsContext`: mocked localStorage posts → MongoDB `posts` collection.
