"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  IPageContent,
  IUpdatePageContentPayload,
} from "@/types/pageContent.types";

export const getPageContent = async (slug: string) => {
  try {
    return await httpClient.get<IPageContent>(`/pages/${slug}`);
  } catch (error) {
    console.error(`Error fetching page content for "${slug}":`, error);
    throw error;
  }
};

export const updatePageContent = async (
  slug: string,
  payload: IUpdatePageContentPayload,
) => {
  try {
    return await httpClient.put<IPageContent>(`/pages/${slug}`, payload);
  } catch (error) {
    console.error(`Error updating page content for "${slug}":`, error);
    throw error;
  }
};
