# Tani Archive API Contracts

## Backend base: `${REACT_APP_BACKEND_URL}/api`

## Auth (Google OAuth)
- Frontend redirects users to Google's OAuth consent screen (`https://accounts.google.com/o/oauth2/v2/auth`) with
	`client_id`, `response_type=code`, `scope=openid email profile`, and `redirect_uri` pointing to `<origin>/auth/callback`.
- On return, the callback receives a query parameter `?code=...`.
- Frontend sends the `code` to `POST /api/auth/session` which exchanges it server-side for tokens with Google,
	fetches the user's profile (email, name, picture), upserts the user in the local DB, creates a `session_token` row,
	and sets an `HttpOnly` `session_token` cookie before returning the user JSON.
- `GET /api/auth/me` — returns current user based on cookie or `Authorization: Bearer <token>` header.
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
