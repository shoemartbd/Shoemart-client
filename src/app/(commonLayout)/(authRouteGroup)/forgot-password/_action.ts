/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  forgotPasswordZodSchema,
  IForgotPasswordPayload,
  IResetPasswordPayload,
  resetPasswordZodSchema,
} from "@/zod/auth.validation";

type ActionResult = { success: boolean; message: string };

// Emails a 6-digit reset code
export const forgotPasswordAction = async (
  payload: IForgotPasswordPayload,
): Promise<ActionResult> => {
  const parsed = forgotPasswordZodSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message || "Invalid input" };
  }

  try {
    const response = await httpClient.post<null>("/auth/forget-password", parsed.data);
    return {
      success: true,
      message: response.message || "We've sent a reset code to your email",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Couldn't send the reset code",
    };
  }
};

// Checks the code and saves the new password
export const resetPasswordAction = async (
  payload: IResetPasswordPayload,
): Promise<ActionResult> => {
  const parsed = resetPasswordZodSchema.safeParse(payload);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message || "Invalid input" };
  }

  try {
    const response = await httpClient.post<null>("/auth/reset-password", parsed.data);
    return {
      success: true,
      message: response.message || "Password reset successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Couldn't reset the password",
    };
  }
};
