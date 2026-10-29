"use client";

import { useEffect, useRef, useState } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per character while typing
  deleteSpeed?: number; // ms per character while erasing
  holdMs?: number; // how long the full text stays before erasing
}

// Types the text, holds, erases and types it again, for as long as it is on
// screen (it rests while scrolled away). The full text is laid out invisibly
// underneath so the heading never changes size, and screen readers get it whole.
export default function TypewriterText({
  text,
  speed = 90,
  deleteSpeed = 45,
  holdMs = 2200,
}: TypewriterTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.6 },
    );
    observer.observe(el);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReduceMotion(media.matches);
    syncMotion();
    media.addEventListener("change", syncMotion);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", syncMotion);
    };
  }, []);

  useEffect(() => {
    if (!visible || reduceMotion) return;

    let i = 0;
    let deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      setCount(i);
      if (!deleting) {
        if (i < text.length) {
          i += 1;
          timer = setTimeout(tick, speed);
        } else {
          deleting = true;
          timer = setTimeout(tick, holdMs);
        }
      } else if (i > 0) {
        i -= 1;
        timer = setTimeout(tick, deleteSpeed);
      } else {
        deleting = false;
        timer = setTimeout(tick, 400);
      }
    };
    tick();
    return () => clearTimeout(timer);
  }, [visible, reduceMotion, text, speed, deleteSpeed, holdMs]);

  const shown = reduceMotion ? text : text.slice(0, count);

  return (
    <span ref={ref} className="relative inline-block" aria-label={text}>
      <span className="invisible" aria-hidden>
        {text}
      </span>
      <span className="absolute inset-0" aria-hidden>
        {shown}
      </span>
    </span>
  );
}
