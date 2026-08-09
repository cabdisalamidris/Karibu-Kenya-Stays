# Karibu Stays — Kenya Hotel Booking Management System

Karibu Stays is a full-stack, Kenya-first hotel booking project. It helps tourists choose stays by the part of Kenya they are visiting instead of presenting an unstructured global hotel list.

## What makes the project presentation-ready

- A responsive home page with destination exploration for Nairobi, Nakuru, Naivasha, Mombasa and Eldoret.
- A curated catalogue of **25 Kenya properties**: five stays in every destination.
- Naivasha properties are explicitly selected for Safari Rally, Lake Naivasha and wildlife travellers; Mombasa includes ocean-view and beachfront options.
- Secure JWT registration and sign-in, protected bookings, and a traveller **My trips** area with future-stay cancellation.
- Protected admin control room: traveller progress, recent booking activity, live booking totals, most-booked hotels, add hotel, remove hotel, and editable hotel rating on add/update.
- API-driven React interface with an offline presentation fallback rather than random international hotels.

The catalogue uses established Kenyan hotel names and destination context drawn from hotel/operator information. It intentionally uses demonstration pricing, availability and image inventory; direct supplier booking APIs normally require commercial accounts and API keys. The project backend is the live REST API used by the frontend, so it can be demonstrated locally and deployed without exposing third-party credentials.

## Technology stack

| Area | Technology |
| --- | --- |
| Frontend | React, Vite, JavaScript (ES6+), JSX, HTML5, CSS3 |
| Backend | Python, Flask, SQLAlchemy, Flask-Migrate, Marshmallow |
| Security | Flask-JWT-Extended, Flask-Bcrypt, CORS allow-list |
| Database | PostgreSQL in production; SQLite for local development |
| Data exchange | REST API with JSON |
| Deployment | Vercel (frontend) and Render (Flask API + PostgreSQL) |

## Local setup

### Backend

```bash
cd backend
pipenv install
pipenv run flask --app run.py run --debug
```

The first start creates a local SQLite database and seeds the 25-property Kenya catalogue. To seed manually:

```bash
pipenv run flask --app run.py seed
```

### Frontend

```bash
cd client
npm install
npm run dev
```

For local development, Vite sends `/api` requests to the Flask service. For a separate deployed backend, set:

```bash
VITE_API_URL=https://your-render-service.onrender.com
```

## Deployment: Render + Vercel

1. Push this repository to GitHub.
2. Create a Render **Blueprint** deployment. `render.yaml` creates the PostgreSQL database and API service.
3. On Render, set `FRONTEND_URL` to your final Vercel URL, for example `https://karibu-stays.vercel.app`. For previews, use a comma-separated allow-list of exact origins.
4. Import the repository into Vercel. The provided `vercel.json` builds `client/` and handles SPA routes.
5. In Vercel environment variables set `VITE_API_URL` to the Render API URL, then redeploy.
6. Verify `https://your-render-service.onrender.com/api/health`, register a traveller, make a booking, and sign in as the admin.

This explicit two-way configuration prevents the common Vercel/Render failure where the frontend calls its own domain instead of the Flask API or Render blocks the browser request with CORS.

## Admin demo account

For local presentation only:

- Email: `admin@karibustays.co.ke`
- Password: `KaribuAdmin2026!`

Change this password and set a strong `JWT_SECRET_KEY` in Render before public deployment. Do not commit real credentials.

## Key API routes

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/hotels?city=Nairobi` and `GET /api/hotels/:id`
- `POST /api/bookings`, `GET /api/bookings`, `DELETE /api/bookings/:id`
- `GET /api/admin/dashboard`
- `GET|POST /api/admin/hotels`, `PATCH|DELETE /api/admin/hotels/:id`

## Presentation narrative

Start at the home page and select a destination. Explain that the system solves choice overload for Kenya visitors by grouping five purposeful hotels in each travel hub. Open Naivasha to demonstrate Safari Rally and wildlife relevance, then make a booking after registering. Finish by signing in as the admin to show live traveller progress, booking activity, popularity ranking and hotel management.
