import express from "express";
import cors from "cors";
import morgan from "morgan";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "../routers/index.js";
import { createContext } from "./context.js";
import apiRoutes from "./routes.js";

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

// tRPC server
const trpcServer = createHTTPServer({
  middleware: [],
  router: appRouter,
  createContext,
  onError({ path, error }) {
    console.error(`Error in tRPC handler on path "${path}":`, error);
  },
});

// Mount tRPC on /trpc path
app.use("/trpc", trpcServer.middleware);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

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
