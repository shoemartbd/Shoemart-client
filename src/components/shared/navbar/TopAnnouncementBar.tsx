import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

interface TopAnnouncementBarProps {
  phone?: string | null;
}

// Thin black strip above the header, on every screen size. It sits outside
// the sticky header, so it scrolls away.
export default function TopAnnouncementBar({ phone }: TopAnnouncementBarProps) {
  const items = [
    ...(phone ? [{ icon: Phone, text: `Hotline: ${phone}` }] : []),
    { icon: MapPin, text: "Find our store" },
  ];
  // Enough repeats to fill wide screens; the track holds the set twice
  const set = Array.from({ length: 6 }, () => items).flat();

  return (
    <Link
      href="/our-stores"
      aria-label="Find our stores"
      className="group block h-8 overflow-hidden bg-black text-white"
    >
      <div
        className="flex h-full w-max animate-[brand-marquee_linear_infinite] items-center group-hover:[animation-play-state:paused] motion-reduce:animate-none"
        style={{ animationDuration: "40s" }}
      >
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 items-center"
          >
            {set.map(({ icon: Icon, text }, i) => (
              <li
                key={i}
                className="flex items-center gap-1.5 px-10 text-xs font-medium uppercase tracking-wide"
              >
                <Icon className="size-3.5" />
                {text}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </Link>
  );
}
