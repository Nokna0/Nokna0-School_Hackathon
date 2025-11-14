import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc.js";

interface Material {
  id: string;
  name: string;
  fileUrl: string;
  uploadedAt: Date;
}

// Mock materials - replace with database
const mockMaterials: Material[] = [];

export const materialsRouter = router({
  list: publicProcedure.query(async () => {
    return mockMaterials;
  }),

  upload: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        fileUrl: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const material: Material = {
        id: Math.random().toString(36).substring(7),
        name: input.name,
        fileUrl: input.fileUrl,
        uploadedAt: new Date(),
      };
      mockMaterials.push(material);
      return material;
    }),
});
