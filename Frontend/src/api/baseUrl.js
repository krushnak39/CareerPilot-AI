// Backend API base URL.
// Set VITE_API_URL in Frontend/.env (local) or in Vercel env vars (production),
// e.g. https://careerpilot-api.onrender.com/api
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");
