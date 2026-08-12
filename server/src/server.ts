import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seed";
import { EmbeddingService } from "./app/module/rag/embedding.service";

const bootstrap = async () => {
  // Try to seed the super admin, but never block the API from starting if
  // the database is temporarily unreachable.
  try {
    await seedSuperAdmin();
  } catch (error) {
    console.error("Failed to seed super admin:", error);
  }

  // Pre-load the RAG embedding model so the first query doesn't pay the
  // model-load cost on the request path. Never blocks startup on failure.
  try {
    await EmbeddingService.warmUp();
    console.log("RAG embedding model loaded");
  } catch (error) {
    console.error("Failed to warm up RAG embedding model:", error);
  }

  app.listen(envVars.PORT, () => {
    console.log(`Server is running on http://localhost:${envVars.PORT}`);
  });
};

bootstrap();
