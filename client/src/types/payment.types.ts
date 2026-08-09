export interface IPayment {
  id: string;
  amount: number;
  currency: string;
  stripePaymentIntentId?: string | null;
  stripeEventId?: string | null;
  paymentGatewayData?: unknown;
  invoiceUrl?: string | null;
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  enrollmentId: string;
  couponId?: string | null;
}

export interface IPaymentFilter {
  studentId?: string;
  status?: string;
  isDeleted?: boolean;
}
