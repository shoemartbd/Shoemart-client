"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef } from "react";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      <ScrollToTopOnNavigate />
      {children}
    </ReactLenis>
  );
}

// Lenis keeps its own scroll position, so Next's scroll-to-top on a link
// click gets overridden and new pages open half-way down. Jump to the top on
// every new page; back / forward keeps the browser's restored position.
function ScrollToTopOnNavigate() {
  const lenis = useLenis();
  const pathname = usePathname();
  const isHistoryNav = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      isHistoryNav.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (isHistoryNav.current) {
      isHistoryNav.current = false;
      return;
    }
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
    // Only on page change; lenis being ready later shouldn't scroll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
