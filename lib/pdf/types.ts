export type IngestPhase =
  | "idle"
  | "uploading"
  | "parsing"
  | "embedding"
  | "ready"
  | "failed";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  /** Pages that appeared in retrieval context; citations outside this set are not trusted. */
  allowedCitationPages?: number[];
}

export interface Citation {
  page: number;
  excerpt?: string;
}
