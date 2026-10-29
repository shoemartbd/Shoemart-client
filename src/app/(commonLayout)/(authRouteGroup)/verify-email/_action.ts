/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ApiErrorResponse } from "@/types/api.types";
import {
  IVerifyEmailPayload,
  verifyEmailZodSchema,
} from "@/zod/auth.validation";
import { redirect } from "next/navigation";

export const verifyEmailAction = async (
  payload: IVerifyEmailPayload,
): Promise<{ success: boolean; message: string } | ApiErrorResponse> => {
  const parsedPayload = verifyEmailZodSchema.safeParse(payload);

  if (!parsedPayload.success) {
    const firstError = parsedPayload.error.issues[0].message || "Invalid input";
    return {
      success: false,
      message: firstError,
    };
  }
  try {
    const response = await httpClient.post<null>(
      "/auth/verify-email",
      parsedPayload.data,
    );

    if (response.success) {
      redirect("/login");
    }

    return {
      success: true,
      message: response.message || "Email verified successfully",
    };
  } catch (error: any) {
    console.log(error, "error");
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    return {
      success: false,
      message:
        error?.response?.data?.message ||
        `Verification failed: ${error.message}`,
    };
  }
};
