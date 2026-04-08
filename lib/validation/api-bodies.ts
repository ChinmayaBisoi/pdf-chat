import { z } from "zod";

export const chatPostBodySchema = z.object({
  documentId: z.uuid(),
  message: z.string().min(1).max(12_000),
});

export const ingestPostBodySchema = z.object({
  fileUrl: z.url(),
  uploadThingKey: z.string().optional(),
});

export type ChatPostBody = z.infer<typeof chatPostBodySchema>;
export type IngestPostBody = z.infer<typeof ingestPostBodySchema>;
