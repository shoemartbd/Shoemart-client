"use server";

import { cookies } from "next/headers";

const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

const getAuthHeaders = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const sessionToken = cookieStore.get("better-auth.session_token")?.value;

  if (!accessToken) return null;

  return {
    "Content-Type": "application/json",
    Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`,
  };
};

export async function getMyNotifications(limit = 10) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(
      `${BASE_API_URL}/notifications?limit=${limit}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    );

    return res.json();
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function markNotificationRead(id: string) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers,
    });

    return res.json();
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function markAllNotificationsRead() {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/notifications/read-all`, {
      method: "PATCH",
      headers,
    });

    return res.json();
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, message: "Something went wrong" };
  }
}
