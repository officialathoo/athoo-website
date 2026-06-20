// Vercel serverless compatibility wrapper.
// Keeps the old /api/* website deployment working while the source lives in services/api.
import app from "../services/api/src/app.js";

export default app;
