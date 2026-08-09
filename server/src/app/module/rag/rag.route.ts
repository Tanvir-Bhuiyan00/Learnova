import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { RagController } from "./rag.controller";

const router = Router();

router.get("/stats", RagController.getStats);

// Trigger full re-index of all courses, lessons, instructors, reviews
router.post(
  "/ingest",
  checkAuth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  RagController.ingest,
);

// Ask the AI assistant a question
router.post("/query", RagController.queryRag);

export const RagRoutes = router;
