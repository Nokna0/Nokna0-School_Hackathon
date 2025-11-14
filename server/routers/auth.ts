import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc.js";

interface User {
  id: string;
  email: string;
  name: string;
}

// Mock user data - replace with database
const mockUser: User = {
  id: "1",
  email: "user@example.com",
  name: "Test User",
};

export const authRouter = router({
  me: publicProcedure.query(({ ctx }) => {
    if (!ctx.userId) {
      return null;
    }
    return mockUser;
  }),

  logout: protectedProcedure.mutation(({ ctx }) => {
    // Clear session/token here
    return { success: true };
  }),
});
