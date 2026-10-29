"use client";

const STORAGE_KEY = "nb_checkout_session";

// Stable per-browser identifier used to upsert the same abandoned-checkout
// record as the customer fills in the form, instead of creating a new row
// on every autosave.
export function getCheckoutSessionToken(): string {
  if (typeof window === "undefined") return "";

  let token = localStorage.getItem(STORAGE_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, token);
  }
  return token;
}

export function clearCheckoutSessionToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
