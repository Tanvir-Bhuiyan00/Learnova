import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { EmbeddingService } from "./embedding.service";

export const RagSourceType = {
  COURSE: "COURSE",
  LESSON: "LESSON",
  INSTRUCTOR: "INSTRUCTOR",
  REVIEW: "REVIEW",
  PLATFORM: "PLATFORM",
} as const;

export const PLATFORM_SOURCE_ID = "learnova";

const PLATFORM_KNOWLEDGE: Array<{
  chunkKey: string;
  sourceLabel: string;
  content: string;
  metadata: Record<string, string | number>;
}> = [
  {
    chunkKey: "platform-about",
    sourceLabel: "About Learnova",
    content: [
      "About Learnova:",
      "Learnova is an online learning management system (LMS) where instructors publish courses and students learn through structured lessons, quizzes, assignments, and certificates.",
      "It supports four user roles: Student, Instructor, Admin, and Super Admin. Courses are organized into modules and lessons, and progress is tracked automatically.",
    ].join("\n"),
    metadata: { topic: "about" },
  },
  {
    chunkKey: "platform-roles",
    sourceLabel: "User roles on Learnova",
    content: [
      "User roles on Learnova:",
      "Students browse the catalog, enroll by paying, watch lessons, take quizzes, submit assignments, write reviews, join discussions, and earn certificates.",
      "Instructors create and edit courses, modules, lessons, quizzes, and assignments, grade student submissions, answer discussions, and track their performance dashboard.",
      "Admins manage categories, users, courses, enrollments, payments, and moderate reviews and discussions.",
      "Super Admins do everything Admins do, plus they manage the Admin accounts themselves.",
    ].join("\n"),
    metadata: { topic: "roles" },
  },
  {
    chunkKey: "platform-student",
    sourceLabel: "What can students do",
    content: [
      "What can a student do on Learnova?",
      "A student can create an account, verify their email, browse and search courses, add courses to the wishlist or cart, apply coupons, check out with Stripe payment, enroll, and start learning.",
      "Students watch lesson content, get progress by marking lessons complete, take timed quizzes with automatic submission, submit assignments, and read instructor feedback and grades.",
      "Students can write and edit reviews, post in course discussions, ask the AI assistant, and view their dashboard with stats, certificates, wishlist, payment history, and notifications.",
    ].join("\n"),
    metadata: { topic: "student" },
  },
  {
    chunkKey: "platform-instructor",
    sourceLabel: "What can instructors do",
    content: [
      "What can an instructor do on Learnova?",
      "An instructor can create courses and publish their details, build the curriculum with modules and lessons, create quizzes with questions, and create assignments for students.",
      "Instructors review assignment submissions, grade them with feedback, moderate their course discussions, and edit their public instructor profile.",
      "The instructor dashboard shows student counts, earnings, and course performance.",
      "Note: instructors cannot enroll in or buy courses as a student, and they cannot delete courses — course deletion is an Admin action.",
    ].join("\n"),
    metadata: { topic: "instructor" },
  },
  {
    chunkKey: "platform-admin",
    sourceLabel: "What can admins do",
    content: [
      "What can Admins and Super Admins do on Learnova?",
      "Admins manage course categories, list and manage all students and instructors, create users, view all enrollments and payments, and see a platform-wide dashboard.",
      "Admins can moderate reviews and discussions and trigger re-indexing of the AI search knowledge base.",
      "Super Admins additionally create and delete Admin accounts, change admin roles, and can block admins.",
    ].join("\n"),
    metadata: { topic: "admin" },
  },
  {
    chunkKey: "platform-pricing",
    sourceLabel: "Pricing and payments",
    content: [
      "Pricing and payments on Learnova:",
      "Course prices are listed in BDT (Bangladeshi Taka). Many courses have a discounted price shown next to the original price.",
      "Payment is processed securely with Stripe at checkout. Students can also apply coupons to their cart.",
      "After a successful payment the student is enrolled immediately and the enrollment appears in their dashboard under My Learning.",
      "Payment history is always available in the student dashboard.",
    ].join("\n"),
    metadata: { topic: "pricing" },
  },
  {
    chunkKey: "platform-certificates",
    sourceLabel: "Certificates",
    content: [
      "Certificates on Learnova:",
      "Students earn a certificate when they complete a course. Each certificate has a unique ID that anyone can verify.",
      "Earned certificates appear under My Certificates in the student dashboard and can be downloaded or shared.",
      "Certificates are only issued for paid courses with a completed enrollment.",
    ].join("\n"),
    metadata: { topic: "certificates" },
  },
  {
    chunkKey: "platform-enrollment",
    sourceLabel: "How enrollment works",
    content: [
      "How to enroll in a course:",
      "Find a course in the catalog, open its detail page, and press the Enroll or payment button.",
      "The checkout accepts a coupon, then processes payment via Stripe. A successful payment creates your enrollment.",
      "Students who are already enrolled see a 'Go to course' button instead of the Enroll button on the course detail page.",
      "Enrolled students can access lessons, quizzes, assignments, and their certificate for that course.",
    ].join("\n"),
    metadata: { topic: "enrollment" },
  },
  {
    chunkKey: "platform-quiz-assignment",
    sourceLabel: "Quizzes and assignments",
    content: [
      "Quizzes and assignments on Learnova:",
      "Quizzes are timed. When the timer expires an in-progress attempt is submitted automatically with the answers given so far.",
      "Students can retake quizzes and their best (or latest) score is recorded.",
      "Assignments are submitted as text or files and graded by the instructor with written feedback.",
    ].join("\n"),
    metadata: { topic: "quiz" },
  },
  {
    chunkKey: "platform-faq",
    sourceLabel: "Learnova FAQ",
    content: [
      "Learnova FAQ:",
      "Q: How do I recover my password? A: Use the 'Forgot password' link on the login page; a reset email is sent to your inbox.",
      "Q: Do I need to verify my email? A: Yes, accounts start with email verification before you can log into the dashboard.",
      "Q: Can instructors also buy courses? A: No, enrollment as a student is separate from the instructor account.",
      "Q: Where are my notifications? A: The bell icon in the header shows your notifications with unread counts.",
    ].join("\n"),
    metadata: { topic: "faq" },
  },
];

const courseLevelLabels: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  ALL_LEVELS: "All Levels",
};

export const IndexingService = {
  async indexDocument(
    chunkKey: string,
    sourceType: string,
    sourceId: string,
    content: string,
    sourceLabel?: string,
    metadata?: Prisma.InputJsonValue,
  ) {
    const embedding = await EmbeddingService.generateEmbedding(content);

    await prisma.documentEmbedding.upsert({
      where: { chunkKey },
      create: {
        chunkKey,
        sourceType,
        sourceId,
        sourceLabel,
        content,
        metadata,
        embedding,
        isDeleted: false,
        deletedAt: null,
      },
      update: {
        sourceType,
        sourceId,
        sourceLabel,
        content,
        metadata,
        embedding,
        isDeleted: false,
        deletedAt: null,
      },
    });
  },

  async softDeleteBySource(sourceType: string, sourceId: string) {
    await prisma.documentEmbedding.updateMany({
      where: { sourceType, sourceId },
      data: { isDeleted: true, deletedAt: new Date() },
    });
  },

  async softDeleteCourse(courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          where: { isDeleted: false },
          include: { lessons: { where: { isDeleted: false } } },
        },
        reviews: { where: { isDeleted: false } },
      },
    });

    if (!course) return;

    await this.softDeleteBySource(RagSourceType.COURSE, courseId);

    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        await this.softDeleteBySource(RagSourceType.LESSON, lesson.id);
      }
    }

    for (const review of course.reviews) {
      await this.softDeleteBySource(RagSourceType.REVIEW, review.id);
    }
  },

  async indexCourseChunks(courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        category: true,
        instructor: true,
        modules: {
          where: { isDeleted: false },
          orderBy: { order: "asc" },
          include: {
            lessons: {
              where: { isDeleted: false },
              orderBy: { order: "asc" },
            },
          },
        },
        reviews: {
          where: { isDeleted: false },
          include: { student: true },
        },
      },
    });

    if (!course) return { indexedCount: 0 };

    let indexedCount = 0;
    const displayPrice =
      course.discountPrice != null && course.discountPrice < course.price
        ? course.discountPrice
        : course.price;

    const courseContent = [
      `Course Title: ${course.title}`,
      `Level: ${courseLevelLabels[course.level] ?? course.level}`,
      `Language: ${course.language}`,
      `Price: $${displayPrice.toFixed(2)}`,
      `Category: ${course.category.title}`,
      `Instructor: ${course.instructor.name}`,
      `Total Lessons: ${course.totalLessons}`,
      course.totalDuration
        ? `Duration: ${Math.max(1, Math.round(course.totalDuration / 60))} hours`
        : null,
      `Average Rating: ${course.averageRating.toFixed(1)}/5`,
      `Description: ${course.description || "No description available."}`,
    ]
      .filter(Boolean)
      .join("\n");

    await this.indexDocument(
      `course-${course.id}`,
      RagSourceType.COURSE,
      course.id,
      courseContent,
      course.title,
      {
        courseId: course.id,
        title: course.title,
        category: course.category.title,
        instructor: course.instructor.name,
        price: displayPrice,
        level: course.level,
      },
    );
    indexedCount++;

    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        const lessonContent = [
          `Course: ${course.title}`,
          `Module: ${module.title}`,
          `Lesson: ${lesson.title}`,
          lesson.description || "",
          lesson.content || "",
        ]
          .filter(Boolean)
          .join("\n");

        await this.indexDocument(
          `lesson-${lesson.id}`,
          RagSourceType.LESSON,
          lesson.id,
          lessonContent,
          `${course.title} — ${lesson.title}`,
          {
            lessonId: lesson.id,
            courseId: course.id,
            courseTitle: course.title,
            moduleTitle: module.title,
            lessonTitle: lesson.title,
          },
        );
        indexedCount++;
      }
    }

    for (const review of course.reviews) {
      const reviewContent = [
        `Course: ${course.title}`,
        `Review by ${review.student.name} (Rating: ${review.rating}/5)`,
        review.comment ? `Comment: ${review.comment}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      await this.indexDocument(
        `review-${review.id}`,
        RagSourceType.REVIEW,
        review.id,
        reviewContent,
        `${course.title} review by ${review.student.name}`,
        {
          reviewId: review.id,
          courseId: course.id,
          courseTitle: course.title,
          rating: review.rating,
          studentName: review.student.name,
        },
      );
      indexedCount++;
    }

    return { indexedCount };
  },

  async indexInstructorChunks(instructorId: string) {
    const instructor = await prisma.instructor.findUnique({
      where: { id: instructorId },
    });

    if (!instructor) return { indexedCount: 0 };

    const content = [
      `Instructor Name: ${instructor.name}`,
      instructor.designation
        ? `Designation: ${instructor.designation}`
        : null,
      instructor.qualification
        ? `Qualification: ${instructor.qualification}`
        : null,
      instructor.experience > 0
        ? `Experience: ${instructor.experience} years`
        : null,
      instructor.currentWorkingPlace
        ? `Current Working Place: ${instructor.currentWorkingPlace}`
        : null,
      `Average Rating: ${instructor.averageRating.toFixed(1)}/5`,
      instructor.bio ? `Bio: ${instructor.bio}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    await this.indexDocument(
      `instructor-${instructor.id}`,
      RagSourceType.INSTRUCTOR,
      instructor.id,
      content,
      instructor.name,
      {
        instructorId: instructor.id,
        name: instructor.name,
        designation: instructor.designation,
        averageRating: instructor.averageRating,
        experience: instructor.experience,
      },
    );

    return { indexedCount: 1 };
  },

  async indexLearnovaData() {
    const courses = await prisma.course.findMany({
      where: { isDeleted: false },
      select: { id: true },
    });

    const instructors = await prisma.instructor.findMany({
      where: { isDeleted: false },
      select: { id: true },
    });

    let indexedCount = 0;

    for (const course of courses) {
      const result = await this.indexCourseChunks(course.id);
      indexedCount += result.indexedCount;
    }

    for (const instructor of instructors) {
      const result = await this.indexInstructorChunks(instructor.id);
      indexedCount += result.indexedCount;
    }

    for (const doc of PLATFORM_KNOWLEDGE) {
      await this.indexDocument(
        doc.chunkKey,
        RagSourceType.PLATFORM,
        PLATFORM_SOURCE_ID,
        doc.content,
        doc.sourceLabel,
        doc.metadata,
      );
      indexedCount++;
    }

    return {
      success: true,
      message: `Successfully indexed ${indexedCount} documents (${courses.length} courses, ${instructors.length} instructors, ${PLATFORM_KNOWLEDGE.length} platform guides).`,
      indexedCount,
    };
  },
};
