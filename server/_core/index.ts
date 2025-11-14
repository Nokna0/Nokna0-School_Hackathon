import express from "express";
import cors from "cors";
import morgan from "morgan";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "../routers/index.js";
import { createContext } from "./context.js";

const port = parseInt(process.env.PORT || "3000", 10);
const isDev = process.env.NODE_ENV === "development";

const server = createHTTPServer({
  middleware: [
    cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }),
    express.json(),
    morgan("combined"),
  ],
  router: appRouter,
  createContext,
  onError({ path, error }) {
    console.error(`Error in tRPC handler on path "${path}":`, error);
  },
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Server started on port ${port}`);
  if (isDev) {
    console.log(`  http://localhost:${port}`);
  }
});

export type { AppRouter } from "../routers/index.js";
