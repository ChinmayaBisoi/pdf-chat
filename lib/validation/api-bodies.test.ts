import { describe, expect, it } from "vitest";
import {
  chatPostBodySchema,
  ingestPostBodySchema,
  projectIdParamSchema,
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

describe("projectIdParamSchema", () => {
  it("accepts a valid UUID", () => {
    expect(
      projectIdParamSchema.safeParse("550e8400-e29b-41d4-a716-446655440000")
        .success,
    ).toBe(true);
  });

  it("rejects non-UUID strings", () => {
    expect(projectIdParamSchema.safeParse("not-a-uuid").success).toBe(false);
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

  it("accepts optional title", () => {
    const parsed = ingestPostBodySchema.safeParse({
      fileUrl: "https://utfs.io/f/abc",
      title: "My document.pdf",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.title).toBe("My document.pdf");
  });

  it("rejects empty title string", () => {
    expect(
      ingestPostBodySchema.safeParse({
        fileUrl: "https://utfs.io/f/abc",
        title: "   ",
      }).success,
    ).toBe(false);
  });

  it("accepts title at exactly 256 characters", () => {
    const parsed = ingestPostBodySchema.safeParse({
      fileUrl: "https://utfs.io/f/abc",
      title: "x".repeat(256),
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects title over 256 characters", () => {
    expect(
      ingestPostBodySchema.safeParse({
        fileUrl: "https://utfs.io/f/abc",
        title: "x".repeat(257),
      }).success,
    ).toBe(false);
  });
});
