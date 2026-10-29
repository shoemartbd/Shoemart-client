"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { getActivePopup } from "@/services/popup.services";

// Pages where a promo would get in the way of finishing a purchase or signing in
const SKIP_PATHS = [
  "/cart",
  "/checkout",
  "/order-confirmation",
  "/payment-failed",
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
];

// Remembered per popup version, so an edited popup shows again
const seenKey = (id: string, updatedAt: string) => `popup-seen:${id}:${updatedAt}`;

const hasSeen = (key: string) => {
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
};

const markSeen = (key: string) => {
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    // Storage blocked: the popup may show again, which is fine
  }
};

// Promo image managed from Dashboard → Website → Popup. Opens a few seconds
// into the visit, once per browser session.
export default function SitePopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const { data: popup } = useQuery({
    queryKey: ["popups", "active"],
    queryFn: () => getActivePopup(),
    staleTime: 10 * 60 * 1000,
  });

  const key = popup ? seenKey(popup.id, popup.updatedAt) : "";
  const skipHere = SKIP_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!popup || open || skipHere || hasSeen(key)) return;
    const timer = setTimeout(() => {
      setOpen(true);
      markSeen(key);
    }, popup.delaySeconds * 1000);
    return () => clearTimeout(timer);
  }, [popup, key, open, skipHere]);

  // Escape closes; the page behind doesn't scroll while it's open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!popup || !open) return null;

  const close = () => setOpen(false);

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={popup.image}
      alt="Special offer"
      className="h-full w-full object-cover"
    />
  );

  const isExternal = popup.link ? /^https?:\/\//i.test(popup.link) : false;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Special offer"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={close}
    >
      {/* 4:5 frame sized by whichever is tighter: screen width or height */}
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted shadow-2xl animate-in zoom-in-95 fade-in duration-300"
        style={{ width: "min(88vw, 440px, calc(85dvh * 0.8))" }}
        onClick={(e) => e.stopPropagation()}
      >
        {popup.link ? (
          isExternal ? (
            <a
              href={popup.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={close}
              className="block h-full w-full"
            >
              {image}
            </a>
          ) : (
            <Link href={popup.link} onClick={close} className="block h-full w-full">
              {image}
            </Link>
          )
        ) : (
          image
        )}

        <button
          type="button"
          onClick={close}
          aria-label="Close"
          autoFocus
          className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white shadow-md backdrop-blur transition hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
