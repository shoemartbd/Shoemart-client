import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  fetchOptions: {
    credentials: "include",
  },
});

// Starts Google OAuth from the frontend origin. /api/auth and
// /api/v1/auth/google are proxied to the backend (see next.config.ts), so the
// backend URL never shows up in the address bar.
export const signInWithGoogle = async (redirectPath?: string) => {
  const safePath =
    redirectPath &&
    redirectPath.startsWith("/") &&
    !redirectPath.startsWith("//")
      ? redirectPath
      : "/dashboard";

  const { data, error } = await authClient.signIn.social({
    provider: "google",
    callbackURL: `/api/v1/auth/google/success?redirect=${encodeURIComponent(safePath)}`,
    errorCallbackURL: "/login?error=oauth_failed",
  });

  if (error || !data?.url) {
    throw new Error(error?.message || "Could not start Google sign-in");
  }
};
