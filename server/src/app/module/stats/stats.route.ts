import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { StatsController } from "./stats.controller";

const router = Router();

router.get(
  "/",
  checkAuth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT),
  StatsController.getDashboardStatsData,
);

export const StatsRoutes = router;
