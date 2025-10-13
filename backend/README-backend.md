# MagnetX Backend API (Express + SQLite)

This backend captures submissions from HTML forms and stores them in a SQLite database.

Endpoints:
- POST /api/forms/:formName
  - Body: application/json or application/x-www-form-urlencoded (works with regular HTML forms)
  - Response: { id, form, created_at }
- GET /api/forms
  - Response: { forms: ["apply", "contact", ...] }
- GET /api/forms/:formName/submissions?limit=50&page=1
  - Response: { page, limit, submissions: [{ id, form, data, user_agent, ip, created_at }] }
- GET /api/health
  - Response: { status: "ok" }

Setup:
1) cd backend
2) Copy environment defaults:
   cp .env.example .env
3) Install dependencies:
   npm install express cors helmet express-rate-limit dotenv better-sqlite3 pg
4) Start the server:
   npm start

By default, it listens on http://localhost:3001 and stores data to backend/data.sqlite.
If DATABASE_URL is set, it uses Postgres instead (ideal for Render Managed PostgreSQL).

CORS:
- Configure CORS_ORIGIN in .env (comma-separated). For quick local testing, you can set it to *.

Database schema:
- Generic table (captures all forms): submissions(form_name, payload, user_agent, ip, created_at)
- Typed table for the Apply form: apply_submissions(full_name, x_profile_link, region, phone, niche, skills, other_skill, category, followers, reason, user_agent, ip, created_at, payload)

Deploy to Render (PostgreSQL):
- Option A: Use the provided render.yaml at the repo root
  - Push this repo to GitHub
  - In Render, "New > Blueprint" and select your repo
  - Render will create a Managed PostgreSQL instance and a Web Service
  - DATABASE_URL will be wired automatically to the web service
- Option B: Manual
  - Create a Managed PostgreSQL in Render
  - Create a Web Service from this repo, root directory backend, start command: npm start
  - Set environment variables: PORT (Render provides), DATABASE_URL (from the DB), CORS_ORIGIN

Wire the existing Index.html form (two options):

Option A — Simple HTML form POST (no JS changes):
- Change your form tag to include action and method:
  <form id="magnetForm" action="http://localhost:3001/api/forms/apply" method="POST">
- Remove the JS that calls evt.preventDefault() so the form can submit normally.

Option B — Fetch from JavaScript (keep your UI flow):
- Keep preventDefault in your submit handler and send the data to the backend:

  const data = Object.fromEntries(new FormData(form));
  fetch("http://localhost:3001/api/forms/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(async (r) => {
    if (!r.ok) throw new Error("Request failed");
    return r.json();
  })
  .then(() => {
    // show success UI, e.g. toggle cards
  })
  .catch((err) => {
    alert("Submission failed. Please try again.");
    console.error(err);
  });

Notes:
- :formName is any string you choose to label a form (e.g., apply, contact). The backend sanitizes it to a safe ID.
- Rate limiting defaults to 60 requests/minute per IP.
- Data is stored as raw JSON payload along with IP, user-agent, and timestamp.
