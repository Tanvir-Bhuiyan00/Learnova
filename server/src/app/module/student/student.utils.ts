import { prisma } from "../../lib/prisma";

export const getStudentIdFromUserId = async (userId: string) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });
  return student?.id;
};
