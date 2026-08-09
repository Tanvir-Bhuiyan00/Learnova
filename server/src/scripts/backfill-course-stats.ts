import { prisma } from "../app/lib/prisma";

const backfillCourseStats = async () => {
  console.log("Backfilling course stats...");

  const courses = await prisma.course.findMany({
    select: { id: true },
  });

  let updatedCourses = 0;
  let updatedInstructors = 0;

  for (const course of courses) {
    const [ratingAgg, studentCount] = await Promise.all([
      prisma.review.aggregate({
        where: { courseId: course.id },
        _avg: { rating: true },
      }),
      prisma.enrollment.count({
        where: { courseId: course.id, isDeleted: false },
      }),
    ]);

    await prisma.course.update({
      where: { id: course.id },
      data: {
        averageRating: ratingAgg._avg.rating ?? 0,
        totalStudents: studentCount,
      },
    });

    updatedCourses += 1;
  }

  const instructors = await prisma.instructor.findMany({
    select: { id: true },
  });

  for (const instructor of instructors) {
    const ratingAgg = await prisma.review.aggregate({
      where: { instructorId: instructor.id },
      _avg: { rating: true },
    });

    await prisma.instructor.update({
      where: { id: instructor.id },
      data: { averageRating: ratingAgg._avg.rating ?? 0 },
    });

    updatedInstructors += 1;
  }

  console.log(
    `Backfill complete: ${updatedCourses} courses, ${updatedInstructors} instructors updated.`,
  );
};

backfillCourseStats()
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
