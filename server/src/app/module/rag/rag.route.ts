import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { rateLimit } from "../../middleware/rateLimit";
import { RagController } from "./rag.controller";

const router = Router();

const ragQueryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyPrefix: "rl:rag",
  message: "Too many AI assistant queries, please wait a moment.",
});

router.get("/stats", RagController.getStats);

// Trigger full re-index of all courses, lessons, instructors, reviews
router.post(
  "/ingest",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  RagController.ingest,
);

// Ask the AI assistant a question
router.post("/query", ragQueryLimiter, RagController.queryRag);

export const RagRoutes = router;
