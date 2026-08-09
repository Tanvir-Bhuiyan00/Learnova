import status from "http-status";
import { Instructor, Prisma } from "../../../generated/prisma/client";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
  instructorFilterableFields,
  instructorSearchableFields,
} from "./instructor.constant";
import { IUpdateInstructorPayload } from "./instructor.interface";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { assertInstructorSelf } from "../../utils/ownership";

const getAllInstructors = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Instructor,
    Prisma.InstructorWhereInput,
    Prisma.InstructorInclude
  >(prisma.instructor, query, {
    searchableFields: instructorSearchableFields,
    filterableFields: instructorFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({
      isDeleted: false,
    })
    .include({
      user: true,
    })
    .dynamicInclude({})
    .paginate()
    .sort()
    .fields()
    .execute();

  return result;
};

const getInstructorById = async (id: string) => {
  const instructor = await prisma.instructor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      user: true,
      courses: true,
      reviews: true,
    },
  });
  return instructor;
};

const updateInstructor = async (
  id: string,
  payload: IUpdateInstructorPayload,
  user: IRequestUser,
) => {
  await assertInstructorSelf(user, id);

  const isInstructorExist = await prisma.instructor.findUnique({
    where: { id },
  });

  if (!isInstructorExist) {
    throw new AppError(status.NOT_FOUND, "Instructor not found");
  }

  const updatedInstructor = await prisma.instructor.update({
    where: { id },
    data: payload,
  });

  return updatedInstructor;
};

const deleteInstructor = async (id: string) => {
  const isInstructorExist = await prisma.instructor.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!isInstructorExist) {
    throw new AppError(status.NOT_FOUND, "Instructor not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.instructor.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: isInstructorExist.userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      },
    });

    await tx.session.deleteMany({
      where: { userId: isInstructorExist.userId },
    });
  });

  return { message: "Instructor deleted successfully" };
};

export const InstructorService = {
  getAllInstructors,
  getInstructorById,
  updateInstructor,
  deleteInstructor,
};
