# Render deployment

Create a Render Blueprint from this repository. The `render.yaml` file provisions PostgreSQL, installs backend requirements and starts Gunicorn from `backend/`.

After the Vercel URL exists, set Render's `FRONTEND_URL` to that exact origin. Keep the generated JWT secret private and confirm `/api/health` after deployment.
