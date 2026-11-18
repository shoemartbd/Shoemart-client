"use server";

import { httpClient } from "@/lib/axios/httpClient";

export type SendPhoneOtpResult =
  | { sent: true; expiresIn: number; resendIn: number }
  | { sent: false; fallback: true; token: string; message: string };

const errorMessage = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

// Is phone verification on for guest orders?
export const getPhoneOtpStatus = async () => {
  try {
    return (await httpClient.get<{ enabled: boolean }>("/phone-otp/status")).data ?? { enabled: false };
  } catch {
    return { enabled: false };
  }
};

export const sendPhoneOtp = async (
  phone: string,
): Promise<{ ok: true; data: SendPhoneOtpResult } | { ok: false; message: string }> => {
  try {
    const res = await httpClient.post<SendPhoneOtpResult>("/phone-otp/send", { phone });
    return { ok: true, data: res.data };
  } catch (error) {
    return { ok: false, message: errorMessage(error, "Couldn't send the code. Please try again.") };
  }
};

export const verifyPhoneOtp = async (
  phone: string,
  code: string,
): Promise<{ ok: true; token: string } | { ok: false; message: string }> => {
  try {
    const res = await httpClient.post<{ verified: true; token: string }>("/phone-otp/verify", {
      phone,
      code,
    });
    return { ok: true, token: res.data.token };
  } catch (error) {
    return { ok: false, message: errorMessage(error, "Couldn't check the code. Please try again.") };
  }
};
