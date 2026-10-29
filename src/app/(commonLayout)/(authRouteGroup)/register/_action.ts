/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import {
  getDefaultDashboardRoute,
  isValidRedirectForRole,
  UserRole,
} from "@/lib/authUtils";
import { httpClient } from "@/lib/axios/httpClient";
import { setTokenInCookies } from "@/lib/tokenUtils";
import { ApiErrorResponse } from "@/types/api.types";
import { IRegisterResponse } from "@/types/auth.types";
import { IRegisterPayload, registerZodSchema } from "@/zod/auth.validation";
import { redirect } from "next/navigation";

export const registerAction = async (
  payload: IRegisterPayload,
  redirectPath?: string,
): Promise<IRegisterResponse | ApiErrorResponse> => {
  const parsedPayload = registerZodSchema.safeParse(payload);

  if (!parsedPayload.success) {
    const firstError = parsedPayload.error.issues[0].message || "Invalid input";
    return {
      success: false,
      message: firstError,
    };
  }
  try {
    const response = await httpClient.post<IRegisterResponse>(
      "/auth/register",
      parsedPayload.data,
    );

    const { accessToken, refreshToken, token, user } = response.data;

    // Better-auth might not send token directly in register if session isn't automatically created, but if it does:
    if (accessToken) await setTokenInCookies("accessToken", accessToken);
    if (refreshToken) await setTokenInCookies("refreshToken", refreshToken);
    if (token)
      await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60);

    const role = user?.role;
    const email = user?.email;
    const needPasswordChange = user?.needPasswordChange;

    if (needPasswordChange) {
      redirect(`/reset-password?email=${email}`);
    } else {
      const targetPath =
        redirectPath && isValidRedirectForRole(redirectPath, role as UserRole)
          ? redirectPath
          : getDefaultDashboardRoute(role as UserRole);

      redirect(targetPath);
    }
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

    if (
      error &&
      error.response &&
      error.response.data.message === "Email not verified"
    ) {
      redirect(`/verify-email?email=${payload.email}`);
    }
    return {
      success: false,
      message: `Registration failed: ${error.message}`,
    };
  }
};
