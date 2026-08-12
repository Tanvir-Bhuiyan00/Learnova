import { prisma } from "../src/app/lib/prisma";

const backfill = async () => {
  const courses = await prisma.course.findMany({
    select: { id: true },
  });

  let updated = 0;
  for (const course of courses) {
    const agg = await prisma.lesson.aggregate({
      where: {
        module: { courseId: course.id },
        isDeleted: false,
      },
      _count: { _all: true },
      _sum: { videoDuration: true },
    });

    await prisma.course.update({
      where: { id: course.id },
      data: {
        totalLessons: agg._count._all,
        totalDuration: agg._sum.videoDuration ?? 0,
      },
    });
    updated++;
  }

  console.log(`Backfilled counters for ${updated} courses`);
};

backfill()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
