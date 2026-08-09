# Vercel deployment

Import the repository into Vercel; `vercel.json` builds the `client/` Vite app and preserves single-page application routes.

Set `VITE_API_URL` to the public Render service URL, then redeploy. The browser should be able to reach the API only after the Vercel URL is included in Render's `FRONTEND_URL` allow-list.
