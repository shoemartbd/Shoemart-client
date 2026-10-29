"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Download, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionTitle from "@/components/shared/SectionTitle";
import { getSampleWorks } from "@/services/sampleWork.services";
import {
  formatFileSize,
  pdfCoverUrl,
  sampleWorkDownloadUrl,
  sampleWorkViewUrl,
} from "@/lib/sampleWork";
import { ISampleWork } from "@/types/sampleWork.types";
import { cn } from "@/lib/utils";

function Actions({ item, className }: { item: ISampleWork; className?: string }) {
  return (
    <div className={cn("flex gap-2", className)}>
      <Button asChild variant="outline" className="flex-1 rounded-full font-semibold">
        <a href={sampleWorkViewUrl(item)} target="_blank" rel="noopener noreferrer">
          <Eye className="mr-1.5 size-4" />
          View
        </a>
      </Button>
      <Button asChild className="flex-1 rounded-full font-semibold">
        <a href={sampleWorkDownloadUrl(item)}>
          <Download className="mr-1.5 size-4" />
          Download
        </a>
      </Button>
    </div>
  );
}

function Cover({ item, sizes }: { item: ISampleWork; sizes: string }) {
  const cover = pdfCoverUrl(item.fileUrl);
  return cover ? (
    <Image
      src={cover}
      alt={item.title}
      fill
      sizes={sizes}
      className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center">
      <FileText className="size-14 text-red-500/60" />
    </div>
  );
}

const meta = (item: ISampleWork) =>
  ["PDF", formatFileSize(item.fileSize)].filter(Boolean).join(" · ");

// Catalogue / sample-work PDFs uploaded from Dashboard → Sample Works
export default function SampleWorksSection() {
  const { data: items = [] } = useQuery({
    queryKey: ["sample-works", "public"],
    queryFn: () => getSampleWorks(),
    staleTime: 10 * 60 * 1000,
  });

  if (items.length === 0) return null;

  // One PDF: a wide call-to-action card
  if (items.length === 1) {
    const item = items[0];
    return (
      <section aria-label="Sample works">
        <div className="group grid overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card shadow-sm md:grid-cols-[minmax(0,280px)_1fr]">
          <div className="relative aspect-[4/3] bg-muted md:aspect-auto md:min-h-56">
            <Cover item={item} sizes="(min-width: 768px) 280px, 100vw" />
          </div>
          <div className="flex flex-col justify-center gap-3 p-6 md:p-8">
            <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              Sample Work
            </span>
            <h2 className="text-2xl font-black tracking-tight md:text-3xl">{item.title}</h2>
            {item.description && (
              <p className="max-w-xl text-muted-foreground">{item.description}</p>
            )}
            <p className="text-xs font-medium text-muted-foreground">{meta(item)}</p>
            <Actions item={item} className="mt-2 max-w-sm" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Sample works">
      <div className="mb-6">
        <SectionTitle title="Our Sample Works" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-lg"
          >
            <a
              href={sampleWorkViewUrl(item)}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block aspect-[4/3] overflow-hidden bg-muted"
              aria-label={`View ${item.title}`}
            >
              <Cover
                item={item}
                sizes="(min-width: 1280px) 23vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
              />
              <span className="absolute left-3 top-3 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                PDF
              </span>
            </a>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h3 className="line-clamp-2 font-bold">{item.title}</h3>
              {item.description && (
                <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
              )}
              <p className="text-xs text-muted-foreground">{meta(item)}</p>
              <Actions item={item} className="mt-auto pt-2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
