import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc.js";

interface StudyRecord {
  id: string;
  userId: string;
  subject: string;
  duration: number; // in minutes
  date: Date;
  score?: number;
}

// Mock study records - replace with database
const mockStudyRecords: StudyRecord[] = [];

export const studyRecordsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return mockStudyRecords.filter((record) => record.userId === ctx.userId);
  }),

  create: protectedProcedure
    .input(
      z.object({
        subject: z.string(),
        duration: z.number(),
        score: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const record: StudyRecord = {
        id: Math.random().toString(36).substring(7),
        userId: ctx.userId || "",
        subject: input.subject,
        duration: input.duration,
        score: input.score,
        date: new Date(),
      };
      mockStudyRecords.push(record);
      return record;
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userRecords = mockStudyRecords.filter(
      (record) => record.userId === ctx.userId
    );
    const totalMinutes = userRecords.reduce((sum, r) => sum + r.duration, 0);
    const avgScore =
      userRecords.reduce((sum, r) => sum + (r.score || 0), 0) /
      (userRecords.length || 1);

    return {
      totalRecords: userRecords.length,
      totalMinutes,
      averageScore: avgScore,
    };
  }),
});
