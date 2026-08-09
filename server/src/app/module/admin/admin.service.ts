import status from "http-status";
import { UserRole, UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
  adminFilterableFields,
  adminSearchableFields,
} from "./admin.constant";
import {
  IChangeUserRolePayload,
  IChangeUserStatusPayload,
  IUpdateAdminPayload,
} from "./admin.interface";

const getAllAdmins = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.admin, query, {
    searchableFields: adminSearchableFields,
    filterableFields: adminFilterableFields,
  });

  const result = await queryBuilder
    .where({ isDeleted: false } as any)
    .search()
    .filter()
    .include({
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          isDeleted: true,
        },
      },
    } as any)
    .paginate()
    .sort()
    .fields()
    .execute();

  return result;
};

const getAdminById = async (id: string) => {
  const admin = await prisma.admin.findUnique({
    where: { id, isDeleted: false },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          isDeleted: true,
        },
      },
    },
  });
  return admin;
};

const updateAdmin = async (id: string, payload: IUpdateAdminPayload) => {
  const isAdminExist = await prisma.admin.findUnique({
    where: { id },
  });

  if (!isAdminExist) {
    throw new AppError(status.NOT_FOUND, "Admin not found");
  }

  const updatedAdmin = await prisma.admin.update({
    where: { id },
    data: payload,
  });

  return updatedAdmin;
};

const deleteAdmin = async (id: string, user: IRequestUser) => {
  const isAdminExist = await prisma.admin.findUnique({
    where: { id },
  });

  if (!isAdminExist) {
    throw new AppError(status.NOT_FOUND, "Admin not found");
  }

  if (isAdminExist.userId === user.userId) {
    throw new AppError(status.BAD_REQUEST, "You cannot delete yourself");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.admin.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: isAdminExist.userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      },
    });

    await tx.session.deleteMany({
      where: { userId: isAdminExist.userId },
    });

    await tx.account.deleteMany({
      where: { userId: isAdminExist.userId },
    });

    const admin = await getAdminById(id);

    return admin;
  });

  return result;
};

const changeUserStatus = async (
  user: IRequestUser,
  payload: IChangeUserStatusPayload,
) => {
  const isAdminExists = await prisma.admin.findUniqueOrThrow({
    where: {
      userId: user.userId,
    },
    include: {
      user: true,
    },
  });

  const { userId, userStatus } = payload;

  const userToChangeStatus = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const selfStatusChange = isAdminExists.userId === userId;

  if (selfStatusChange) {
    throw new AppError(status.BAD_REQUEST, "You cannot change your own status");
  }

  if (
    isAdminExists.user.role === UserRole.ADMIN &&
    userToChangeStatus.role === UserRole.SUPER_ADMIN
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot change the status of super admin. Only super admin can change the status of another super admin",
    );
  }

  if (
    isAdminExists.user.role === UserRole.ADMIN &&
    userToChangeStatus.role === UserRole.ADMIN
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot change the status of another admin. Only super admin can change the status of another admin",
    );
  }

  if (userStatus === UserStatus.DELETED) {
    throw new AppError(
      status.BAD_REQUEST,
      "You cannot set user status to deleted. To delete a user, use the role-specific delete API",
    );
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status: userStatus },
  });

  return updatedUser;
};

const changeUserRole = async (
  user: IRequestUser,
  payload: IChangeUserRolePayload,
) => {
  const isSuperAdmin = await prisma.user.findFirstOrThrow({
    where: {
      id: user.userId,
      role: UserRole.SUPER_ADMIN,
    },
  });

  const { userId, role } = payload;

  const userToChangeRole = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  if (isSuperAdmin.id === userId) {
    throw new AppError(status.BAD_REQUEST, "You cannot change your own role");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  return updatedUser;
};

export const AdminService = {
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  changeUserStatus,
  changeUserRole,
};
