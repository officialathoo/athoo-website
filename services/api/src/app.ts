import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

const DEFAULT_ALLOWED_ORIGINS = [
  "https://athoo.pk",
  "https://www.athoo.pk",
  "https://admin.athoo.pk",
  "https://api.athoo.pk",
  "https://thoo-api.onrender.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const envAllowedOrigins = (
  process.env.CORS_ORIGIN ||
  process.env.ALLOWED_ORIGINS ||
  ""
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const allowedOrigins = Array.from(
  new Set([...DEFAULT_ALLOWED_ORIGINS, ...envAllowedOrigins]),
);

function isAllowedOrigin(origin: string): boolean {
  const cleanOrigin = origin.replace(/\/$/, "");

  if (allowedOrigins.includes(cleanOrigin)) return true;

  try {
    const url = new URL(cleanOrigin);
    return (
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname.endsWith(".vercel.app") ||
      url.hostname.endsWith(".onrender.com")
    );
  } catch {
    return false;
  }
}

const allowedHeaders = [
  "Content-Type",
  "Authorization",
  "Accept",
  "X-Requested-With",
  "Cache-Control",
  "Pragma",
];

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    logger.warn({ origin, allowedOrigins }, "CORS origin blocked");
    callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders,
  exposedHeaders: ["Content-Type"],
  credentials: false,
  optionsSuccessStatus: 204,
};

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(cors(corsOptions));

app.use((req, res, next): void => {
  const origin = String(req.headers.origin || "").replace(/\/$/, "");

  if (!origin || isAllowedOrigin(origin)) {
    if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );
    res.setHeader("Access-Control-Allow-Headers", allowedHeaders.join(", "));
  }

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/", (_req, res): void => {
  res.json({ ok: true, service: "Athoo API" });
});

app.use("/api", router);

export default app;
