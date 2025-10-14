# MagnetX Backend API (Express + Prisma + Supabase)

Endpoints:
- POST /api/forms/:formName
  - Body: application/json or application/x-www-form-urlencoded (works with HTML forms)
  - Response: { id, form, created_at }
- GET /api/forms
- GET /api/forms/:formName/submissions?limit=50&page=1
- GET /api/health
- GET /api/community | /api/skill | /api/category (static dropdowns)

Setup:
1) cd backend
2) Copy environment defaults:
   cp .env.example .env
3) Set DATABASE_URL to your Supabase pooled URL (port 6543) with pgbouncer=true, connection_limit=1, sslmode=require
4) Set DIRECT_DATABASE_URL to your non-pooled Supabase URL (port 5432) with sslmode=require
5) Install deps and generate Prisma client:
   npm install
   npm run prisma:generate
6) Apply schema to production DB (requires DIRECT_DATABASE_URL):
   npm run prisma:migrate:deploy

Local run (optional):
- npm run dev

Deployment on Vercel:
- vercel.json routes /api/* -> /api/index.js (serverless handler using Express app)
- Ensure environment variables are set in Vercel Project Settings:
  - DATABASE_URL (pooled)
  - DIRECT_DATABASE_URL (for migrations only; not required at runtime)
  - CORS_ORIGIN (comma-separated production origins)
  - TWITTER_BEARER_TOKEN (optional)
