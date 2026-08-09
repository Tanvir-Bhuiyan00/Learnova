"use server";

import { redirect } from "next/navigation";
import { addToCart } from "@/services/cart.services";

interface EnrollNowResult {
  success: boolean;
  error?: string;
}

export async function enrollNowAction(
  courseId: string,
): Promise<EnrollNowResult> {
  try {
    await addToCart({ courseId });
    return { success: true };
  } catch (error: unknown) {
    const err = error as { response?: { status?: number } };

    if (err?.response?.status === 401) {
      redirect(`/login?redirect=${encodeURIComponent(`/courses/${courseId}`)}`);
    }

    if (err?.response?.status === 403) {
      return {
        success: false,
        error: "You need a student account to enroll in courses.",
      };
    }

    console.error("[enrollNowAction] Error:", error);
    return {
      success: false,
      error: "Could not add this course to your cart. Please try again.",
    };
  }
}
