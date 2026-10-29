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

export async function getSalesSummary() {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const res = await fetch(`${BASE_API_URL}/sales-report/summary`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    return res.json();
  } catch (error) {
    console.error("Error fetching sales summary:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function getSalesReportItems(params?: {
  startDate?: string;
  endDate?: string;
}) {
  try {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, message: "Unauthorized" };

    const query = new URLSearchParams();
    if (params?.startDate) query.set("startDate", params.startDate);
    if (params?.endDate) query.set("endDate", params.endDate);
    const qs = query.toString();

    const res = await fetch(
      `${BASE_API_URL}/sales-report/items${qs ? `?${qs}` : ""}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      },
    );

    return res.json();
  } catch (error) {
    console.error("Error fetching sales report items:", error);
    return { success: false, message: "Something went wrong" };
  }
}
