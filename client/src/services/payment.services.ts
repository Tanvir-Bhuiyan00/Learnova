"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IPayment } from "@/types/payment.types";

export const getMyPayments = async () => {
  try {
    const payments = await httpClient.get<IPayment[]>("/payments/my-payments");
    return payments;
  } catch (error) {
    console.log("Error fetching my payments:", error);
    throw error;
  }
};

export const getAllPayments = async (queryString?: string) => {
  try {
    const payments = await httpClient.get<IPayment[]>(
      `/payments${queryString ? `?${queryString}` : ""}`,
    );
    return payments;
  } catch (error) {
    console.log("Error fetching payments:", error);
    throw error;
  }
};
