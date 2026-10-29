"use server";

import { cookies } from "next/headers";

const BASE_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export interface IRagQueryPayload {
  query: string;
  limit?: number;
}

export interface IRagSource {
  id: string;
  content: string;
  similarity: number;
  metadata?: {
    name?: string;
    description?: string;
    [key: string]: unknown;
  };
}

export interface IRagQueryData {
  answer: string;
  sources: IRagSource[];
  contextUsed: boolean;
}

export interface IIngestData {
  success: boolean;
  message: string;
  data?: {
    success: boolean;
    message: string;
  };
}

const getAuthHeaders = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const sessionToken = cookieStore.get("better-auth.session_token")?.value;

  return {
    "Content-Type": "application/json",
    Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`,
  };
};

export const queryRagService = async (payload: IRagQueryPayload) => {
  try {
    const res = await fetch(`${BASE_API_URL}/rag/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Error querying RAG:", error);
    return { success: false, message: "Failed to connect to AI assistant" };
  }
};

export const ingestDataService = async () => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BASE_API_URL}/rag/ingest`, {
      method: "POST",
      headers,
    });

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("Error ingesting data:", error);
    return { success: false, message: "Failed to sync data" };
  }
};
