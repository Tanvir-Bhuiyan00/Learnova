import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateInstructorPayload } from "./user.interface";
import { UserRole } from "../../../generated/prisma/client";

const createInstructor = async (payload: ICreateInstructorPayload) => {
    const userExists = await prisma.user.findUnique({
        where: {
            email: payload.instructor.email,
        },
    });

    if (userExists) {
        throw new AppError(status.CONFLICT, "User with this email already exists");
    }

    const userData = await auth.api.signUpEmail({
        body: {
            email: payload.instructor.email,
            password: payload.password,
            role: UserRole.INSTRUCTOR,
            name: payload.instructor.name,
            needPasswordChange: true,
        },
    });

    try {
        const result = await prisma.$transaction(async (tx) => {
            const instructor = await tx.instructor.create({
                data: {
                    userId: userData.user.id,
                    ...payload.instructor,
                },
            });

            return instructor;
        });

        return result;
    } catch (error) {
        console.log("Transaction error : ", error);
        await prisma.user.delete({
            where: {
                id: userData.user.id,
            },
        });
        throw error;
    }
};

export const UserService = {
    createInstructor,
};
