# startingUP Frontend

React, Vite, Tailwind v4, and Framer Motion frontend for the startingUP FastAPI backend.

## Commands

```bash
npm install
npm run dev
npm run build
```

Leave `VITE_API_URL` empty in local development to use the Vite proxy for `http://127.0.0.1:8000`.

Auth calls use `/api/auth/signup`, `/api/auth/signin`, `/api/auth/me`, and `/api/auth/logout`.
Saved startup plans require a signed-in session and are scoped to the logged-in user.
