import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";

const model = openai.embedding("text-embedding-3-small");

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const batchSize = 64;
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += batchSize) {
    const slice = texts.slice(i, i + batchSize);
    const { embeddings } = await embedMany({
      model,
      values: slice,
    });
    out.push(...embeddings);
  }
  return out;
}

export async function embedQuery(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model,
    value: text,
  });
  return embedding;
}
