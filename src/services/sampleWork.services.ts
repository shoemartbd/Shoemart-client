"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { UploadSignature } from "@/lib/sampleWork";
import { ISampleWork, ISampleWorkPayload } from "@/types/sampleWork.types";

const fail = (error: any, fallback: string): never => {
  throw new Error(error?.response?.data?.message || fallback);
};

// Public: active sample works for the homepage
export const getSampleWorks = async () => {
  try {
    return (await httpClient.get<ISampleWork[]>("/sample-works")).data;
  } catch (error) {
    console.error("Failed to load sample works:", error);
    return [];
  }
};

export const getAllSampleWorks = async () => {
  try {
    return (await httpClient.get<ISampleWork[]>("/sample-works/admin")).data;
  } catch (error) {
    return fail(error, "Failed to load sample works");
  }
};

export const getSampleWorkUploadSignature = async () => {
  try {
    return (await httpClient.post<UploadSignature>("/sample-works/upload-signature", {})).data;
  } catch (error) {
    return fail(error, "Could not prepare the upload");
  }
};

export const createSampleWork = async (payload: ISampleWorkPayload) => {
  try {
    return (await httpClient.post<ISampleWork>("/sample-works", payload)).data;
  } catch (error) {
    return fail(error, "Failed to save sample work");
  }
};

export const updateSampleWork = async (id: string, payload: Partial<ISampleWorkPayload>) => {
  try {
    return (await httpClient.patch<ISampleWork>(`/sample-works/${id}`, payload)).data;
  } catch (error) {
    return fail(error, "Failed to update sample work");
  }
};

export const deleteSampleWork = async (id: string) => {
  try {
    return (await httpClient.delete(`/sample-works/${id}`)).data;
  } catch (error) {
    return fail(error, "Failed to delete sample work");
  }
};
