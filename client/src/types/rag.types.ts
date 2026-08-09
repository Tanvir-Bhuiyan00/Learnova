export interface IRagSource {
  id: string;
  chunkKey: string;
  sourceType: string;
  sourceId: string;
  sourceLabel?: string | null;
  content: string;
  similarity: number;
  metadata?: Record<string, unknown> | null;
}

export interface IRagQueryData {
  answer: string;
  sources: IRagSource[];
  contextUsed: boolean;
}