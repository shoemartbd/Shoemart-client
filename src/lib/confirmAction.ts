"use client";

// Styled confirm popup (SweetAlert2) instead of the browser's confirm(),
// which shows "localhost:3000 says" / the site address as its title.
//
//   if (!(await confirmAction({ title: "Delete brand?", text: "..." }))) return;

interface ConfirmOptions {
  title: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  // danger = red confirm button (delete, block); primary = theme colour
  variant?: "danger" | "primary";
  icon?: "warning" | "question" | "info";
}

// Read the site's theme colours so the popup matches light and dark mode
const themeColor = (name: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

export async function confirmAction({
  title,
  text,
  confirmText = "Yes",
  cancelText = "Cancel",
  variant = "danger",
  icon = "warning",
}: ConfirmOptions): Promise<boolean> {
  // Loaded on first use only, keeps it out of every page's bundle
  const { default: Swal } = await import("sweetalert2");

  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    focusCancel: variant === "danger",
    confirmButtonColor: variant === "danger" ? "#dc2626" : themeColor("--primary", "#111111"),
    cancelButtonColor: themeColor("--muted-foreground", "#6b7280"),
    background: themeColor("--card", "#ffffff"),
    color: themeColor("--foreground", "#111827"),
    customClass: { popup: "rounded-2xl" },
  });

  return result.isConfirmed;
}
