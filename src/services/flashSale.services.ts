"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  IFlashSaleConfig,
  IFlashSalePublic,
  IUpdateFlashSalePayload,
} from "@/types/flashSale.types";

export const getFlashSaleConfig = async () => {
  try {
    return await httpClient.get<IFlashSaleConfig>("/flash-sale");
  } catch (error) {
    console.error("Error fetching flash sale config:", error);
    throw error;
  }
};

export const updateFlashSale = async (payload: IUpdateFlashSalePayload) => {
  try {
    return await httpClient.put<IFlashSaleConfig>("/flash-sale", payload);
  } catch (error) {
    console.error("Error updating flash sale:", error);
    throw error;
  }
};

export const getPublicFlashSale = async () => {
  try {
    return await httpClient.get<IFlashSalePublic>("/flash-sale/public");
  } catch (error) {
    console.error("Error fetching public flash sale:", error);
    throw error;
  }
};
