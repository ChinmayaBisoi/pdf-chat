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
}

export interface Citation {
  page: number;
  excerpt?: string;
}
