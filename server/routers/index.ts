import { router } from "../_core/trpc.js";
import { authRouter } from "./auth.js";
import { materialsRouter } from "./materials.js";
import { mathAssistRouter } from "./mathAssist.js";
import { studyRecordsRouter } from "./studyRecords.js";

export const appRouter = router({
  auth: authRouter,
  materials: materialsRouter,
  mathAssist: mathAssistRouter,
  studyRecords: studyRecordsRouter,
});

export type AppRouter = typeof appRouter;
