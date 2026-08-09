# Architecture

The Vite/React single-page application lives in `client/`. It calls Flask routes below `/api`; local Vite development proxies those routes to port 5000.

The Flask application in `backend/` uses SQLAlchemy models for users, hotels, stays, car services and car bookings. Render hosts the API and PostgreSQL; Vercel hosts the client.
