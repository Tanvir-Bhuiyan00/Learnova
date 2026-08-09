import { RAGService } from "../app/module/rag/rag.service";

const run = async () => {
  console.log("Starting RAG indexing...");
  const result = await RAGService.ingestLearnovaData();
  console.log(result.message);
  process.exit(0);
};

run().catch((error) => {
  console.error("RAG indexing failed:", error);
  process.exit(1);
});
