# Tani Archive

This repository powers the Tani Archive webapp (frontend + FastAPI backend).

## Google OAuth setup (Quick Start)

Follow these steps to enable Google Sign-In for both local development and production.

1. Create OAuth credentials
	- Open the Google Cloud Console and create an **OAuth 2.0 Client ID** (type: Web application).
	- Add the frontend origin(s) to the **Authorized JavaScript origins** (e.g. `http://localhost:3000` and your production origin).
	- Add the frontend callback to **Authorized redirect URIs**: `<FRONTEND_ORIGIN>/auth/callback` (e.g. `http://localhost:3000/auth/callback`).
	- Note the generated **Client ID** and **Client Secret**.

2. Configure backend environment (`backend/.env`)

	Add the following variables to your backend `.env` (examples):

	GOOGLE_CLIENT_ID=your-google-client-id
	GOOGLE_CLIENT_SECRET=your-google-client-secret
	# Optional override if your frontend uses a custom callback URL
	GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

	MONGO_URL="mongodb://localhost:27017"
	DB_NAME="tani_archive"
	# In development, set ENVIRONMENT=development to keep cookies non-secure
	ENVIRONMENT=development

	# If you prefer an explicit flag instead of ENVIRONMENT, you can set:
	# COOKIE_SECURE=false

3. Configure frontend environment (`frontend/.env`)

	REACT_APP_BACKEND_URL=http://localhost:8000
	REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
	# Optional - if omitted, the app will use window.location.origin + '/auth/callback'
	REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

4. How the flow works
	- The frontend redirects users to Google's consent screen using `REACT_APP_GOOGLE_CLIENT_ID` and `redirect_uri` = `<FRONTEND_ORIGIN>/auth/callback`.
	- After the user consents, Google redirects back to the frontend at `/auth/callback` with a `code`.
	- The frontend sends that `code` to the backend `POST /api/auth/session` (server-side exchange).
	- The backend exchanges the `code` for tokens using `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, fetches userinfo, upserts the user, and creates a session token.

5. Running locally

	Backend (run from repository root):

	```bash
	python3 -m pip install -r backend/requirements.txt
	python3 -m uvicorn backend.server:app --reload --host 0.0.0.0 --port 8000
	```

	Frontend:

	```bash
	cd frontend
	yarn install
	yarn start
	```

6. Tests

	Run the backend API sanity tests:

	```bash
	cd /app
	python3 -m pytest -q backend_test.py
	```

7. Security notes
	- In production, ensure `ENVIRONMENT=production` or set `COOKIE_SECURE=true` so session cookies are only sent over HTTPS.
	- Keep `GOOGLE_CLIENT_SECRET` private and never commit it to source control. Use your deployment secrets manager.

8. Troubleshooting
	- If you see a 401 during the exchange step, confirm that the `redirect_uri` you registered in Google Cloud exactly matches the `redirect_uri` used by the frontend (including scheme and trailing slash).
	- Ensure `REACT_APP_BACKEND_URL` points to the correct backend origin and that the backend can reach Google's token/userinfo endpoints.

If you'd like, I can also add a `.env.example` file and a short checklist to the repository.

