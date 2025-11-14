import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { Request } from "express";

export interface Context {
  req?: Request;
  userId?: string | null;
}

export function createContext(opts?: CreateExpressContextOptions): Context {
  const req = opts?.req;

  // Extract userId from request (you can customize this based on your auth method)
  const userId = req?.headers["x-user-id"] as string | undefined;

  return {
    req,
    userId: userId || null,
  };
}
