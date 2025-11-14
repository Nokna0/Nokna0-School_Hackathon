import express from "express";
import cors from "cors";
import morgan from "morgan";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "../routers/index.js";
import { createContext } from "./context.js";
import apiRoutes from "./routes.js";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = parseInt(process.env.PORT || "3000", 10);
const isDev = process.env.NODE_ENV === "development";

const app = express();

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(morgan("combined"));

// REST API routes
app.use("/api", apiRoutes);

// tRPC server - mount on /api/trpc path
app.use(
  "/api/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
    onError({ path, error }) {
      console.error(`Error in tRPC handler on path "${path}":`, error);
    },
  })
);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Serve static files in production or development
if (isDev) {
  // Development: Use Vite middleware
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  // Production: Serve built files
  const distPath = path.join(__dirname, "../public");
  app.use(express.static(distPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: isDev ? err.message : "Internal server error",
  });
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`Server started on port ${port}`);
  if (isDev) {
    console.log(`  http://localhost:${port}`);
    console.log(`  Health check: http://localhost:${port}/health`);
  }
});

export type { AppRouter } from "../routers/index.js";
