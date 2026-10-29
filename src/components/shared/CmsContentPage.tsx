"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, type LucideIcon } from "lucide-react";
import { getPageContent } from "@/services/pageContent.services";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const proseClassNames = cn(
  "max-w-none text-slate-600 dark:text-slate-300 text-base leading-relaxed",
  "[&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-slate-900 [&_h2]:dark:text-white [&_h2]:mt-10 [&_h2]:mb-4 [&_h2:first-child]:mt-0",
  "[&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:dark:text-white [&_h3]:mt-8 [&_h3]:mb-3",
  "[&_p]:mb-5",
  "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul]:space-y-2",
  "[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_ol]:space-y-2",
  "[&_li]:leading-relaxed",
  "[&_strong]:font-bold [&_strong]:text-slate-800 [&_strong]:dark:text-slate-100",
  "[&_em]:italic",
  "[&_a]:text-primary [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:opacity-80",
  "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/50 [&_blockquote]:pl-5 [&_blockquote]:py-1 [&_blockquote]:my-6 [&_blockquote]:italic [&_blockquote]:text-slate-500 [&_blockquote]:dark:text-slate-400",
);

interface CmsPageContentProps {
  slug: string;
  className?: string;
  showTitle?: boolean;
  titleClassName?: string;
}

export function CmsPageContent({
  slug,
  className,
  showTitle = true,
  titleClassName,
}: CmsPageContentProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["page-content", slug],
    queryFn: () => getPageContent(slug),
  });

  const page = data?.data;

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {showTitle && <Skeleton className="h-8 w-2/3 mb-4" />}
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-11/12" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
      </div>
    );
  }

  if (isError || !page) {
    return (
      <p className={cn("text-slate-500 dark:text-slate-400 font-medium", className)}>
        We couldn&apos;t load this content right now. Please try again later.
      </p>
    );
  }

  return (
    <div className={className}>
      {showTitle && (
        <h2
          className={cn(
            "text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-6",
            titleClassName,
          )}
        >
          {page.title}
        </h2>
      )}
      <div className={proseClassNames} dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}

interface CmsContentPageProps {
  slug: string;
  eyebrow?: string;
  icon?: LucideIcon;
}

export default function CmsContentPage({
  slug,
  eyebrow = "Information",
  icon: Icon = FileText,
}: CmsContentPageProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["page-content", slug],
    queryFn: () => getPageContent(slug),
  });

  const page = data?.data;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <section className="relative py-20 bg-white dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-red/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3" />

        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
            <Icon className="h-4 w-4 text-primary" />
            <span className="text-primary font-black text-xs uppercase tracking-widest">
              {eyebrow}
            </span>
          </div>

          {isLoading ? (
            <Skeleton className="h-12 md:h-16 w-2/3 mx-auto rounded-2xl" />
          ) : (
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight">
              {page?.title}
            </h1>
          )}

          {page?.updatedAt && !isLoading && (
            <div className="mt-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Last Updated:{" "}
              {new Date(page.updatedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 container mx-auto px-6">
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
          <CmsPageContent slug={slug} showTitle={false} />
        </div>
      </section>
    </div>
  );
}
