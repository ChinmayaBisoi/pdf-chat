import { z } from "zod";

/** Route param for `/api/projects/[projectId]` and similar. */
export const projectIdParamSchema = z.uuid();

export const chatPostBodySchema = z.object({
  documentId: z.uuid(),
  message: z.string().min(1).max(12_000),
});

export const ingestPostBodySchema = z.object({
  fileUrl: z.url(),
  uploadThingKey: z.string().optional(),
  title: z.string().trim().min(1).max(256).optional(),
});

export type ChatPostBody = z.infer<typeof chatPostBodySchema>;
export type IngestPostBody = z.infer<typeof ingestPostBodySchema>;
