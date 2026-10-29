"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IAttribute, IAttributeValue } from "@/types/attribute.types";

export const getAllAttributes = async () => {
  try {
    return await httpClient.get<IAttribute[]>("/attributes");
  } catch (error) {
    console.error("Error fetching attributes:", error);
    throw error;
  }
};

export const createAttribute = async (payload: { name: string }) => {
  try {
    return await httpClient.post<IAttribute>("/attributes", payload);
  } catch (error) {
    console.error("Error creating attribute:", error);
    throw error;
  }
};

export const updateAttribute = async (id: string, payload: { name: string }) => {
  try {
    return await httpClient.patch<IAttribute>(`/attributes/${id}`, payload);
  } catch (error) {
    console.error("Error updating attribute:", error);
    throw error;
  }
};

export const deleteAttribute = async (id: string) => {
  try {
    return await httpClient.delete<{ message: string }>(`/attributes/${id}`);
  } catch (error) {
    console.error("Error deleting attribute:", error);
    throw error;
  }
};

export const addAttributeValue = async (attributeId: string, payload: { value: string }) => {
  try {
    return await httpClient.post<IAttributeValue>(`/attributes/${attributeId}/values`, payload);
  } catch (error) {
    console.error("Error adding attribute value:", error);
    throw error;
  }
};

export const deleteAttributeValue = async (valueId: string) => {
  try {
    return await httpClient.delete<{ message: string }>(`/attributes/values/${valueId}`);
  } catch (error) {
    console.error("Error deleting attribute value:", error);
    throw error;
  }
};

export const getAttributeById = async (id: string) => {
  try {
    return await httpClient.get<IAttribute>(`/attributes/${id}`);
  } catch (error) {
    console.error("Error fetching attribute by id:", error);
    throw error;
  }
};

export const updateAttributeValue = async (valueId: string, payload: { value: string }) => {
  try {
    return await httpClient.patch<IAttributeValue>(`/attributes/values/${valueId}`, payload);
  } catch (error) {
    console.error("Error updating attribute value:", error);
    throw error;
  }
};
