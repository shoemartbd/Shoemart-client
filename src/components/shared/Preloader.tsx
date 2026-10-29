"use client";

import { useEffect, useState } from "react";
import BrandLoader from "./BrandLoader";

const MIN_MS = 400; // long enough to not flash
const MAX_MS = 2500; // never hold the page longer than this

// Shown on the first (full) page load only. It is part of the server HTML, so
// it covers the page right away, then fades out once the page has loaded.
// Client-side navigation afterwards doesn't remount it.
export default function Preloader() {
  const [phase, setPhase] = useState<"show" | "fade" | "gone">("show");

  useEffect(() => {
    const start = performance.now();
    let done = false;

    const hide = () => {
      if (done) return;
      done = true;
      const wait = Math.max(0, MIN_MS - (performance.now() - start));
      setTimeout(() => setPhase("fade"), wait);
    };

    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide, { once: true });
    const cap = setTimeout(hide, MAX_MS);

    return () => {
      window.removeEventListener("load", hide);
      clearTimeout(cap);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      aria-hidden
      onTransitionEnd={() => phase === "fade" && setPhase("gone")}
      className={`fixed inset-0 z-[10000] flex items-center justify-center bg-background transition-opacity duration-500 ${
        phase === "fade" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <BrandLoader />
    </div>
  );
}
