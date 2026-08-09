import { pipeline } from "@xenova/transformers";

const EMBEDDING_MODEL = "Xenova/bge-base-en-v1.5";

type FeatureExtractor = (
  text: string,
  options?: { pooling?: "mean" | "none" | "cls"; normalize?: boolean },
) => Promise<{ data: Float32Array }>;

let extractorPromise: Promise<FeatureExtractor> | null = null;

const getExtractor = (): Promise<FeatureExtractor> => {
  if (!extractorPromise) {
    extractorPromise = pipeline(
      "feature-extraction",
      EMBEDDING_MODEL,
    ) as unknown as Promise<FeatureExtractor>;
  }
  return extractorPromise;
};

export const EmbeddingService = {
  async warmUp(): Promise<void> {
    await getExtractor();
  },

  async generateEmbedding(text: string): Promise<number[]> {
    const extractor = await getExtractor();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  },
};
