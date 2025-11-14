import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc.js";

export const mathAssistRouter = router({
  questionHelp: protectedProcedure
    .input(
      z.object({
        question: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Placeholder for math assistance
      return {
        success: true,
        answer: "Math assistance coming soon",
      };
    }),
});
