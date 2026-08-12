import { prisma } from "../../lib/prisma";
import { EmbeddingService } from "./embedding.service";
import { IndexingService } from "./indexing.service";
import { LLMService } from "./llm.service";

const cosineSimilarity = (a: number[], b: number[]): number => {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dot / magnitude;
};

/**
 * Minimum cosine similarity for a document to be considered relevant to the
 * query. Matches below this bar are noise (e.g. weak review hits) and must not
 * be sent to the LLM. Tune as the embedding model changes.
 */
const SIMILARITY_THRESHOLD = 0.3;

const FALLBACK_ANSWER =
  "I couldn't find reliable information about that yet. I can help with questions about Learnova courses, instructors, pricing, enrollment, quizzes, assignments and certificates. Try asking something like “What courses do you offer?” or “How do I earn my certificate?”";

export const RAGService = {
  async ingestLearnovaData() {
    return IndexingService.indexLearnovaData();
  },

  async reindexCourse(courseId: string) {
    return IndexingService.indexCourseChunks(courseId);
  },

  async reindexInstructor(instructorId: string) {
    return IndexingService.indexInstructorChunks(instructorId);
  },

  async removeSource(sourceType: string, sourceId: string) {
    return IndexingService.softDeleteBySource(sourceType, sourceId);
  },

  async removeCourse(courseId: string) {
    return IndexingService.softDeleteCourse(courseId);
  },

  async retrieveRelevantDocuments(
    query: string,
    limit: number = 5,
    sourceType?: string,
  ) {
    const queryEmbedding = await EmbeddingService.generateEmbedding(query);

    const documents = await prisma.documentEmbedding.findMany({
      where: {
        isDeleted: false,
        ...(sourceType ? { sourceType } : {}),
      },
      select: {
        id: true,
        chunkKey: true,
        sourceType: true,
        sourceId: true,
        sourceLabel: true,
        content: true,
        metadata: true,
        embedding: true,
      },
      // Bounded scan: pre-filter by sourceType (callers pass it) so the
      // in-memory cosine pass never loads the entire table. Increase this
      // ceiling (or move to pgvector) if the corpus outgrows it.
      take: sourceType ? 1000 : 2000,
    });

    const scored = documents.map((doc) => ({
      ...doc,
      similarity: cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    scored.sort((a, b) => b.similarity - a.similarity);

    return scored.slice(0, limit);
  },

  async generateAnswer(
    query: string,
    limit: number = 5,
    sourceType?: string,
  ) {
    const relevantDocs = await this.retrieveRelevantDocuments(
      query,
      limit,
      sourceType,
    );

    // Always use the top retrieved docs as context, even if similarity is
    // modest — the LLM can still extract useful signals. No more "I don't
    // have enough information" dead-end; the assistant always answers.
    const context = relevantDocs
      .slice(0, limit)
      .map((doc) => doc.content)
      .filter(Boolean);

    const answer = await LLMService.generateResponse(query, context);

    return {
      answer,
      sources: [],
      contextUsed: context.length > 0,
      noContext: false,
    };
  },

  async getStats() {
    const totalActiveDocuments = await prisma.documentEmbedding.count({
      where: { isDeleted: false },
    });

    const grouped = await prisma.documentEmbedding.groupBy({
      by: ["sourceType"],
      where: { isDeleted: false },
      _count: { _all: true },
    });

    const sourceTypeBreakdown = Object.fromEntries(
      grouped.map((group) => [group.sourceType, group._count._all]),
    );

    return {
      totalActiveDocuments,
      sourceTypeBreakdown,
      timestamp: new Date(),
    };
  },
};
