/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { NotificationType, PaymentStatus } from "../../../generated/prisma/enums";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { sendEmail } from "../../utils/email";
import { paymentFilterableFields, paymentSearchableFields } from "./payment.constant";
import { generateInvoicePdf } from "./payment.utils";

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  const existingPayment = await prisma.payment.findFirst({
    where: { stripeEventId: event.id },
  });

  if (existingPayment) {
    return { message: `Event ${event.id} already processed. Skipping` };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;

      const studentId = session.metadata?.studentId;
      const enrollmentIdsRaw = session.metadata?.enrollmentIds;

      if (!studentId || !enrollmentIdsRaw) {
        console.error("Missing metadata in webhook event");
        return { message: "Missing metadata" };
      }

      const enrollmentIds = enrollmentIdsRaw.split(",");

      const enrollments = await prisma.enrollment.findMany({
        where: { id: { in: enrollmentIds } },
        include: {
          student: true,
          course: { include: { instructor: true } },
          payment: true,
        },
      });

      if (enrollments.length === 0) {
        console.error("No enrollments found for the given IDs");
        return { message: "Enrollments not found" };
      }

      const isPaid = session.payment_status === "paid";

      await prisma.$transaction(async (tx) => {
        const updatedPayments = [];

        for (const enrollment of enrollments) {
          const updatedPayment = await tx.payment.update({
            where: { id: enrollment.payment!.id },
            data: {
              status: isPaid ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
              stripePaymentIntentId: session.payment_intent,
              paymentGatewayData: session,
              stripeEventId: event.id,
            },
          });

          updatedPayments.push(updatedPayment);
        }

        return updatedPayments;
      });

      if (isPaid) {
        for (const enrollment of enrollments) {
          try {
            const pdfBuffer = await generateInvoicePdf({
              invoiceId: enrollment.payment!.id,
              studentName: enrollment.student.name,
              studentEmail: enrollment.student.email,
              courseName: enrollment.course.title,
              instructorName: enrollment.course.instructor?.name || "N/A",
              amount: enrollment.payment?.amount || 0,
              transactionId: enrollment.payment?.id || "",
              paymentDate: new Date().toISOString(),
            });

            const cloudinaryResponse = await uploadFileToCloudinary(
              pdfBuffer,
              `learnova/invoices/invoice-${enrollment.payment!.id}-${Date.now()}.pdf`,
            );

            const invoiceUrl = cloudinaryResponse?.secure_url;

            if (invoiceUrl) {
              await prisma.payment.update({
                where: { id: enrollment.payment!.id },
                data: { invoiceUrl },
              });
            }

            await sendEmail({
              to: enrollment.student.email,
              subject: `Payment Confirmation & Invoice - ${enrollment.course.title}`,
              templateName: "invoice",
              templateData: {
                studentName: enrollment.student.name,
                invoiceId: enrollment.payment!.id,
                transactionId: enrollment.payment!.id,
                paymentDate: new Date().toLocaleDateString(),
                courseName: enrollment.course.title,
                instructorName: enrollment.course.instructor?.name || "N/A",
                amount: enrollment.payment?.amount || 0,
                invoiceUrl: invoiceUrl || "",
              },
              attachments: [
                {
                  filename: `Invoice-${enrollment.payment!.id}.pdf`,
                  content: pdfBuffer || Buffer.from(""),
                  contentType: "application/pdf",
                },
              ],
            });
          } catch (err) {
            console.error("Error processing invoice for enrollment:", enrollment.id, err);
          }

          try {
            if (enrollment.course.instructor?.userId) {
              await prisma.notification.create({
                data: {
                  userId: enrollment.course.instructor.userId,
                  title: "New enrollment",
                  message: `${enrollment.student.name} enrolled in "${enrollment.course.title}".`,
                  type: NotificationType.ENROLLMENT,
                },
              });
            }
          } catch (err) {
            console.error("Error creating enrollment notification:", err);
          }
        }
      }

      break;
    }

    case "checkout.session.expired":
    case "payment_intent.payment_failed": {
      const session = event.data.object as any;
      const enrollmentIdsRaw = session.metadata?.enrollmentIds;

      if (enrollmentIdsRaw) {
        const enrollmentIds = enrollmentIdsRaw.split(",");
        await prisma.payment.updateMany({
          where: { enrollmentId: { in: enrollmentIds } },
          data: { status: PaymentStatus.FAILED },
        });
      }

      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return { message: `Webhook Event ${event.id} processed successfully` };
};

const getMyPayments = async (user: IRequestUser, query: IQueryParams) => {
  const student = await prisma.student.findUniqueOrThrow({
    where: { userId: user.userId },
  });

  const queryBuilder = new QueryBuilder(prisma.payment, query);

  const result = await queryBuilder
    .where({ studentId: student.id, isDeleted: false } as any)
    .include({
      enrollment: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnail: true,
            },
          },
        },
      },
    } as any)
    .paginate()
    .sort()
    .execute();

  return result;
};

const getAllPayments = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.payment, query, {
    searchableFields: paymentSearchableFields,
    filterableFields: paymentFilterableFields,
  });

  const result = await queryBuilder
    .where({ isDeleted: false } as any)
    .search()
    .filter()
    .include({
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },
      enrollment: {
        select: {
          id: true,
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    } as any)
    .paginate()
    .sort()
    .fields()
    .execute();

  return result;
};

export const PaymentService = {
  handleStripeWebhookEvent,
  getMyPayments,
  getAllPayments,
};