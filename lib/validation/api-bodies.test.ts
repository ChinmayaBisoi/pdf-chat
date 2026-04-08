import { describe, expect, it } from "vitest";
import {
  chatPostBodySchema,
  ingestPostBodySchema,
} from "@/lib/validation/api-bodies";

describe("chatPostBodySchema", () => {
  it("accepts a valid UUID document id and message", () => {
    const parsed = chatPostBodySchema.safeParse({
      documentId: "550e8400-e29b-41d4-a716-446655440000",
      message: "What is this about?",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects empty message", () => {
    const parsed = chatPostBodySchema.safeParse({
      documentId: "550e8400-e29b-41d4-a716-446655440000",
      message: "",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects non-UUID document id", () => {
    const parsed = chatPostBodySchema.safeParse({
      documentId: "not-a-uuid",
      message: "hi",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects message over max length", () => {
    const parsed = chatPostBodySchema.safeParse({
      documentId: "550e8400-e29b-41d4-a716-446655440000",
      message: "x".repeat(12_001),
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts message at exactly max length", () => {
    const parsed = chatPostBodySchema.safeParse({
      documentId: "550e8400-e29b-41d4-a716-446655440000",
      message: "x".repeat(12_000),
    });
    expect(parsed.success).toBe(true);
  });
});

describe("ingestPostBodySchema", () => {
  it("accepts https URL and optional key", () => {
    expect(
      ingestPostBodySchema.safeParse({
        fileUrl: "https://utfs.io/f/abc",
        uploadThingKey: "k",
      }).success,
    ).toBe(true);
  });

  it("accepts URL without uploadThingKey", () => {
    const parsed = ingestPostBodySchema.safeParse({
      fileUrl: "https://utfs.io/f/abc",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.uploadThingKey).toBeUndefined();
  });

  it("rejects non-URL fileUrl", () => {
    expect(
      ingestPostBodySchema.safeParse({ fileUrl: "not a url" }).success,
    ).toBe(false);
  });
});
