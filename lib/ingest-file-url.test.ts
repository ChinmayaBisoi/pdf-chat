import { describe, expect, it } from "vitest";
import {
  assertUploadThingFileUrlForIngest,
  InvalidIngestUrlError,
} from "@/lib/ingest-file-url";

describe("assertUploadThingFileUrlForIngest", () => {
  it("accepts https utfs.io URLs", () => {
    expect(() =>
      assertUploadThingFileUrlForIngest("https://utfs.io/f/abc"),
    ).not.toThrow();
  });

  it("accepts https subdomains of utfs.io", () => {
    expect(() =>
      assertUploadThingFileUrlForIngest("https://something.utfs.io/f/x"),
    ).not.toThrow();
  });

  it("accepts ufs.sh hosts", () => {
    expect(() =>
      assertUploadThingFileUrlForIngest("https://ufs.sh/f/x"),
    ).not.toThrow();
  });

  it("accepts subdomains of ufs.sh", () => {
    expect(() =>
      assertUploadThingFileUrlForIngest("https://cdn.ufs.sh/f/x"),
    ).not.toThrow();
  });

  it("rejects http", () => {
    expect(() =>
      assertUploadThingFileUrlForIngest("http://utfs.io/f/x"),
    ).toThrow(InvalidIngestUrlError);
  });

  it("rejects non-UploadThing hosts", () => {
    expect(() =>
      assertUploadThingFileUrlForIngest("https://evil.com/utfs.io"),
    ).toThrow(InvalidIngestUrlError);
  });

  it("rejects malformed URLs", () => {
    expect(() => assertUploadThingFileUrlForIngest("not a url")).toThrow(
      InvalidIngestUrlError,
    );
  });
});
