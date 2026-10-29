"use client";

import { Button } from "@/components/ui/button";

interface PriceHighlightProps {
  sellPrice: number;
  regularPrice: number;
  buttonText: string;
  onOrderClick: () => void;
  regularPriceLabel?: string | null;
  offerPriceLabel?: string | null;
}

// Visually mirrors a reference design: an animated "crossed-out" old price
// next to a pulsing, circle-highlighted offer price. The labels next to each
// price are admin-supplied free text (Bangla or English) — no hardcoded
// language string, so they're only shown when the admin has set one.
export default function PriceHighlight({
  sellPrice,
  regularPrice,
  buttonText,
  onOrderClick,
  regularPriceLabel,
  offerPriceLabel,
}: PriceHighlightProps) {
  const hasDiscount = regularPrice > sellPrice;

  return (
    <section className="relative overflow-hidden bg-card ring-1 ring-black/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] rounded-[2rem] py-12 px-6">
      <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-48 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="max-w-lg mx-auto text-center relative">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="h-px w-6 bg-primary/60" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
            Limited Offer
          </span>
          <span className="h-px w-6 bg-primary/60" />
        </div>
        {hasDiscount && (
          <p className="text-lg md:text-2xl text-muted-foreground animate-in fade-in slide-in-from-top-2 duration-700">
            {regularPriceLabel && <span className="mr-1">{regularPriceLabel}</span>}
            <span className="relative inline-block text-red-600 font-bold px-1">
              ৳{regularPrice.toFixed(0)}
              <svg
                viewBox="0 0 120 40"
                preserveAspectRatio="none"
                className="absolute -top-1 left-0 w-full h-full text-red-600 pointer-events-none"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="120"
                  y2="40"
                  pathLength={1}
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1,
                    animation: "price-draw-stroke 2.4s ease-in-out infinite",
                  }}
                />
                <line
                  x1="0"
                  y1="40"
                  x2="120"
                  y2="0"
                  pathLength={1}
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1,
                    animation: "price-draw-stroke 2.4s ease-in-out infinite",
                    animationDelay: "0.15s",
                  }}
                />
              </svg>
            </span>
          </p>
        )}

        <h2 className="text-3xl md:text-4xl font-black text-primary mt-4">
          {offerPriceLabel && (
            <span className="block text-base md:text-lg font-semibold text-foreground mb-1">
              {offerPriceLabel}
            </span>
          )}
          <span className="relative inline-block px-6 py-2">
            <span
              className="text-green-600 text-4xl md:text-6xl font-black relative z-10 inline-block"
              style={{ animation: "price-pulse-scale 1.6s ease-in-out infinite" }}
            >
              ৳{sellPrice.toFixed(0)}
            </span>

            {hasDiscount && (
              <svg
                viewBox="0 0 200 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full text-red-500 pointer-events-none"
              >
                <ellipse
                  cx="100"
                  cy="50"
                  rx="95"
                  ry="45"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  pathLength={1}
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1,
                    animation: "price-draw-stroke 3s ease-in-out infinite",
                  }}
                />
              </svg>
            )}
          </span>
        </h2>

        <div className="mt-8">
          <Button
            size="lg"
            onClick={onOrderClick}
            className="h-14 px-10 rounded-full text-lg font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </section>
  );
}
