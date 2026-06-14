import express from "express";
import cors from "cors";
import pinoHttpImport from "pino-http";

const pinoHttp =
  (pinoHttpImport as any).default || pinoHttpImport;

import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: any) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: any) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

const DEFAULT_CORS_ORIGINS = [
  "https://athoo.pk",
  "https://www.athoo.pk",
  "https://admin.athoo.pk",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((x) => x.trim())
      : DEFAULT_CORS_ORIGINS,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
