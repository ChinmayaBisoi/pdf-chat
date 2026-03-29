/**
 * Restrict server-side PDF fetch to UploadThing file hosts (see uploadthing UtfsHost / UfsHost defaults).
 */
export class InvalidIngestUrlError extends Error {
  constructor() {
    super("Invalid file URL");
    this.name = "InvalidIngestUrlError";
  }
}

export function assertUploadThingFileUrlForIngest(urlString: string): void {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new InvalidIngestUrlError();
  }
  if (url.protocol !== "https:") {
    throw new InvalidIngestUrlError();
  }
  const host = url.hostname.toLowerCase();
  const allowed =
    host === "utfs.io" ||
    host.endsWith(".utfs.io") ||
    host === "ufs.sh" ||
    host.endsWith(".ufs.sh");
  if (!allowed) {
    throw new InvalidIngestUrlError();
  }
}
