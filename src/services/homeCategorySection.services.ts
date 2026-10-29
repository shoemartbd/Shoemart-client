"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  IHomeCategorySection,
  IHomepageCategorySection,
  IUpdateHomeCategorySectionsPayload,
} from "@/types/homeCategorySection.types";

export const getHomeCategorySections = async () => {
  try {
    return await httpClient.get<IHomeCategorySection[]>(
      "/home-category-sections",
    );
  } catch (error) {
    console.error("Error fetching home category sections:", error);
    throw error;
  }
};

export const getHomepageCategorySections = async (limit?: number) => {
  try {
    return await httpClient.get<IHomepageCategorySection[]>(
      "/home-category-sections/homepage",
      {
        params: limit ? { limit } : undefined,
      },
    );
  } catch (error) {
    console.error("Error fetching homepage category sections:", error);
    throw error;
  }
};

export const updateHomeCategorySections = async (
  payload: IUpdateHomeCategorySectionsPayload,
) => {
  try {
    return await httpClient.put<IHomeCategorySection[]>(
      "/home-category-sections",
      payload,
    );
  } catch (error) {
    console.error("Error updating home category sections:", error);
    throw error;
  }
};
