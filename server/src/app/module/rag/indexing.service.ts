import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { EmbeddingService } from "./embedding.service";

export const RagSourceType = {
  COURSE: "COURSE",
  LESSON: "LESSON",
  INSTRUCTOR: "INSTRUCTOR",
  REVIEW: "REVIEW",
} as const;

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

    return {
      success: true,
      message: `Successfully indexed ${indexedCount} documents (${courses.length} courses, ${instructors.length} instructors).`,
      indexedCount,
    };
  },
};
