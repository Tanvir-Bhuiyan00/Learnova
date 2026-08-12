import { Router } from "express";
import { AdminRoutes } from "../module/admin/admin.route";
import { AssignmentRoutes } from "../module/assignment/assignment.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { CartRoutes } from "../module/cart/cart.route";
import { CategoryRoutes } from "../module/category/category.route";
import { CertificateRoutes } from "../module/certificate/certificate.route";
import { CourseRoutes } from "../module/course/course.route";
import { DiscussionRoutes } from "../module/discussion/discussion.route";
import { EnrollmentRoutes } from "../module/enrollment/enrollment.route";
import { NotificationRoutes } from "../module/notification/notification.route";
import { InstructorRoutes } from "../module/instructor/instructor.route";
import { PaymentRoutes } from "../module/payment/payment.route";
import {
  AttemptRoutes,
  CourseQuizRoutes,
  QuizRoutes,
} from "../module/quiz/quiz.route";
import { RagRoutes } from "../module/rag/rag.route";
import { ReviewRoutes } from "../module/review/review.route";
import { StatsRoutes } from "../module/stats/stats.route";
import { StudentRoutes } from "../module/student/student.route";
import { UserRoutes } from "../module/user/user.route";
import { WishlistRoutes } from "../module/wishlist/wishlist.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/admins", AdminRoutes);
router.use("/categories", CategoryRoutes);
router.use("/courses", CourseRoutes);
router.use("/courses", CourseQuizRoutes);
router.use("/quizzes", QuizRoutes);
router.use("/quiz-attempts", AttemptRoutes);
router.use("/users", UserRoutes);
router.use("/instructors", InstructorRoutes);
router.use("/carts", CartRoutes);
router.use("/enrollments", EnrollmentRoutes);
router.use("/payments", PaymentRoutes);
router.use("/reviews", ReviewRoutes);
router.use("/students", StudentRoutes);
router.use("/stats", StatsRoutes);
router.use("/wishlists", WishlistRoutes);
router.use("/discussions", DiscussionRoutes);
router.use("/assignments", AssignmentRoutes);
router.use("/certificates", CertificateRoutes);
router.use("/rag", RagRoutes);
router.use("/notifications", NotificationRoutes);

export const IndexRoutes = router;
