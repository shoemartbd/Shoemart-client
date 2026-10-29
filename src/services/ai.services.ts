"use server";

import { cookies } from "next/headers";

const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

const getAuthHeaders = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const sessionToken = cookieStore.get("better-auth.session_token")?.value;

  return {
    "Content-Type": "application/json",
    Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`,
  };
};

export const generateAIProductData = async (title: string) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE_API_URL}/ai/generate-product-data`, {
      method: "POST",
      headers,
      body: JSON.stringify({ title }),
    });

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Error generating AI product data:", error);
    return { success: false, message: "Failed to connect to AI service" };
  }
};

export const getAIRecommendations = async (productId: string) => {
  try {
    const res = await fetch(`${BASE_API_URL}/ai/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
      cache: "no-store",
    });

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Error fetching AI recommendations:", error);
    return { success: false, data: [] };
  }
};

export const analyzeBusiness = async () => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE_API_URL}/ai/analyze-business`, {
      method: "POST",
      headers,
      cache: "no-store",
    });

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Error analyzing business data:", error);
    return { success: false, message: "Failed to connect to AI analysis service" };
  }
};
