/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { setTokenInCookies } from "@/lib/tokenUtils";
import { cookies } from "next/headers";
import { cache } from "react";

const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

if (!BASE_API_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

export async function getNewTokensWithRefreshToken(
  refreshToken: string,
): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    const res = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken}; better-auth.session_token=${sessionToken}`,
      },
    });

    if (!res.ok) {
      return false;
    }

    const { data } = await res.json();

    const { accessToken, refreshToken: newRefreshToken, token } = data;

    if (accessToken) {
      await setTokenInCookies("accessToken", accessToken);
    }

    if (newRefreshToken) {
      await setTokenInCookies("refreshToken", newRefreshToken);
    }

    if (token) {
      await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60); // 1 day in seconds
    }

    return true;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error as any).digest === "DYNAMIC_SERVER_USAGE"
    ) {
      throw error;
    }
    console.error("Error refreshing token:", error);
    return false;
  }
}

export const getUserInfo = cache(async () => {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!accessToken) {
      return null;
    }

    const res = await fetch(`${BASE_API_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status !== 401 && res.status !== 404) {
        console.error("Failed to fetch user info:", res.status, res.statusText);
      }
      return null;
    }

    const { data } = await res.json();

    return data;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error as any).digest === "DYNAMIC_SERVER_USAGE"
    ) {
      throw error;
    }
    console.error("Error fetching user info:", error);
    return null;
  }
});

export async function logoutUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("better-auth.session_token")?.value;

  if (sessionToken) {
    try {
      await fetch(`${BASE_API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `better-auth.session_token=${sessionToken}`,
        },
      });
    } catch (error) {
      console.error("Error logging out from server:", error);
    }
  }

  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("better-auth.session_token");
}

export async function updateProfile(payload: any) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!accessToken) {
      return { success: false, message: "Unauthorized" };
    }

    const isFormData = payload instanceof FormData;

    const res = await fetch(`${BASE_API_URL}/auth/update-profile`, {
      method: "PATCH",
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`,
      },
      body: isFormData ? payload : JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: result.message || "Failed to update profile",
      };
    }

    return { success: true, data: result.data, message: result.message };
  } catch (error: unknown) {
    console.error("Error updating profile:", error);
    return { success: false, message: "Something went wrong" };
  }
}
