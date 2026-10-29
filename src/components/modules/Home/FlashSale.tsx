"use client";

import { useQuery } from "@tanstack/react-query";
import { getPublicFlashSale } from "@/services/flashSale.services";
import ProductCard from "./ProductCard";
import { Clock, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import SectionTitle from "@/components/shared/SectionTitle";

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

const getTimeLeft = (endTime: string): TimeLeft => {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
};

export default function FlashSale() {
  const { data, isLoading } = useQuery({
    queryKey: ["public-flash-sale"],
    queryFn: () => getPublicFlashSale(),
    staleTime: 60 * 1000,
  });

  const flashSale = data?.data;
  const endTime = flashSale?.endTime;

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!endTime) {
      setTimeLeft(null);
      return;
    }

    setTimeLeft(getTimeLeft(endTime));

    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(endTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  if (isLoading) {
    return null;
  }

  const products = flashSale?.products ?? [];

  if (!flashSale?.isVisible || products.length === 0) {
    return null;
  }

  const timeBox =
    "min-w-11 rounded-lg bg-primary px-2.5 py-1.5 text-center text-primary-foreground shadow-sm";

  return (
    <section aria-label="Flash sale">
      <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.07] via-background to-rose-500/[0.07] p-5 md:p-8 dark:from-primary/15 dark:via-slate-950 dark:to-rose-500/10">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 fill-brand-red text-brand-red" />
              <SectionTitle title="Flash Sale" />
            </div>
            <p className="text-sm text-muted-foreground">
              Limited-time deals. Grab them before they&apos;re gone!
            </p>
          </div>

          {timeLeft && (
            <div className="flex shrink-0 items-center gap-3 self-start rounded-2xl border bg-card px-4 py-3 shadow-sm md:self-auto">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Clock className="h-4 w-4" />
                Ends in
              </span>
              <div className="flex items-center gap-1.5 font-mono text-lg font-bold md:text-xl">
                <div className={timeBox}>{String(timeLeft.hours).padStart(2, "0")}</div>
                <span className="text-muted-foreground">:</span>
                <div className={timeBox}>{String(timeLeft.minutes).padStart(2, "0")}</div>
                <span className="text-muted-foreground">:</span>
                <div className={timeBox}>{String(timeLeft.seconds).padStart(2, "0")}</div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
