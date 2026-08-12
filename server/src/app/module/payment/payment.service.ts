/* eslint-disable @typescript-eslint/no-explicit-any */
import Stripe from "stripe";
import { NotificationType, PaymentStatus } from "../../../generated/prisma/enums";
import { uploadFileToCloudinary } from "../../config/cloudinary.config";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { incrementCouponUsage } from "../../utils/coupon";
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

      const updatedPayments = await prisma.$transaction(async (tx) => {
        const updatedPayments = [];

        for (const enrollment of enrollments) {
          // A FAILED status alone isn't proof the cron rolled counters back
          // (the webhook may have failed an unpaid session itself), but a
          // soft-deleted enrollment is: the cron always soft-deletes the
          // enrollment in the same transaction that rolls back the counters.
          const wasExpiredByCron = enrollment.isDeleted;

          const updatedPayment = await tx.payment.upsert({
            where: { enrollmentId: enrollment.id },
            update: {
              status: isPaid ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
              stripePaymentIntentId: session.payment_intent,
              paymentGatewayData: session,
              stripeEventId: event.id,
            },
            create: {
              amount:
                enrollment.payment?.amount ??
                (enrollment.course.discountPrice ?? enrollment.course.price),
              status: isPaid ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED,
              studentId: enrollment.studentId,
              enrollmentId: enrollment.id,
              couponId: enrollment.payment?.couponId ?? null,
              stripePaymentIntentId: session.payment_intent,
              paymentGatewayData: session,
              stripeEventId: event.id,
            },
          });

          // The 30-min cron may have expired this payment while the customer
          // was still completing checkout. If the customer actually paid,
          // restore the enrollment and the counters the cron rolled back.
          if (isPaid && wasExpiredByCron) {
            await tx.enrollment.update({
              where: { id: enrollment.id },
              data: { isDeleted: false, deletedAt: null },
            });

            await tx.course.update({
              where: { id: enrollment.courseId },
              data: { totalStudents: { increment: 1 } },
            });

            if (updatedPayment.couponId) {
              const coupon = await tx.coupon.findUnique({
                where: { id: updatedPayment.couponId },
                select: { maxUsage: true },
              });
              try {
                await incrementCouponUsage(tx, updatedPayment.couponId, coupon?.maxUsage ?? null);
              } catch (error) {
                // The coupon was already counted at checkout time; the cron
                // rolled it back. If another student raced us to the last
                // usage slot, do NOT fail the whole webhook — a paid
                // enrollment must never be rolled back over a coupon edge
                // case (that would leave the payment unrecorded and Stripe
                // retrying forever).
                console.error(
                  "Coupon usage restore failed during webhook restore:",
                  error,
                );
              }
            }
          }

          updatedPayments.push(updatedPayment);
        }

        return updatedPayments;
      });

      if (isPaid) {
        const paymentByEnrollmentId = new Map(
          updatedPayments.map((p) => [p.enrollmentId, p]),
        );

        // Invoice generation, Cloudinary upload, and email are slow and must
        // not hold the webhook response open (Stripe expects an answer within
        // seconds). Process them in the background; each step is guarded so a
        // failure can never crash the loop or lose the paid enrollment state.
        void (async () => {
          for (const enrollment of enrollments) {
            const payment = paymentByEnrollmentId.get(enrollment.id);
            if (!payment) continue;
            try {
              const pdfBuffer = await generateInvoicePdf({
                invoiceId: payment.id,
                studentName: enrollment.student.name,
                studentEmail: enrollment.student.email,
                courseName: enrollment.course.title,
                instructorName: enrollment.course.instructor?.name || "N/A",
                amount: payment.amount,
                transactionId: payment.id,
                paymentDate: new Date().toISOString(),
              });

              const cloudinaryResponse = await uploadFileToCloudinary(
                pdfBuffer,
                `learnova/invoices/invoice-${payment.id}-${Date.now()}.pdf`,
              );

              const invoiceUrl = cloudinaryResponse?.secure_url;

              if (invoiceUrl) {
                await prisma.payment.update({
                  where: { id: payment.id },
                  data: { invoiceUrl },
                });
              }

              await sendEmail({
                to: enrollment.student.email,
                subject: `Payment Confirmation & Invoice - ${enrollment.course.title}`,
                templateName: "invoice",
                templateData: {
                  studentName: enrollment.student.name,
                  invoiceId: payment.id,
                  transactionId: payment.id,
                  paymentDate: new Date().toLocaleDateString(),
                  courseName: enrollment.course.title,
                  instructorName: enrollment.course.instructor?.name || "N/A",
                  amount: payment.amount,
                  invoiceUrl: invoiceUrl || "",
                },
                attachments: [
                  {
                    filename: `Invoice-${payment.id}.pdf`,
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
        })();
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