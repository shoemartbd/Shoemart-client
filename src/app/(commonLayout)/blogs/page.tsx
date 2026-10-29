"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowRight, Calendar, Search, Tag, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublicBlogs } from "@/services/blog.services";
import { IBlog } from "@/types/blog.types";

function BlogsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("searchTerm") || "",
  );

  const page = Number(searchParams.get("page") || "1");

  const {
    data: blogResponse,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["blogs", searchParams.toString()],
    queryFn: () => {
      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
      return getPublicBlogs(params);
    },
  });

  const blogs = blogResponse?.data ?? [];
  const meta = blogResponse?.meta;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("searchTerm", searchTerm);
    router.push(`/blogs${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const goToPage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`/blogs?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Hero Header */}
      <section className="bg-slate-50 dark:bg-slate-900/50 pt-24 pb-20 border-b border-slate-100 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-5 py-2 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
              <Tag className="h-4 w-4 text-primary" />
              <span className="text-primary font-black text-xs uppercase tracking-widest">
                Shoe Mart Journal
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-tight">
              Insights into the{" "}
              <span className="text-primary">Marketplace</span>
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Explore our latest articles, guides, and stories from the world
              of e-commerce, fashion, and technology.
            </p>

            {/* Search Bar */}
            <div className="w-full max-w-xl relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search articles..."
                className="w-full h-16 pl-16 pr-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none focus:border-primary/30 outline-none transition-all font-bold text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          {isLoading || isFetching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[16/10] w-full rounded-[2.5rem]" />
                  <Skeleton className="h-6 w-3/4 rounded-lg" />
                  <Skeleton className="h-20 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <Search className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                No articles found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                We couldn&apos;t find anything matching your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {blogs.map((blog: IBlog) => (
                <article
                  key={blog.id}
                  className="group flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-primary/10 transition-all duration-300"
                >
                  <Link
                    href={`/blogs/${blog.slug}`}
                    className="relative aspect-[16/10] overflow-hidden block"
                  >
                    <Image
                      src={blog.coverImage || "/placeholder.png"}
                      alt={blog.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 mb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-primary" />{" "}
                        {format(new Date(blog.createdAt), "MMM dd, yyyy")}
                      </span>
                      {blog.author && (
                        <span className="flex items-center gap-1.5">
                          <User size={12} className="text-primary" />{" "}
                          {blog.author}
                        </span>
                      )}
                    </div>

                    <Link href={`/blogs/${blog.slug}`}>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 leading-tight group-hover:text-primary transition-colors">
                        {blog.title}
                      </h3>
                    </Link>

                    {blog.excerpt && (
                      <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8 flex-1 line-clamp-3">
                        {blog.excerpt}
                      </p>
                    )}

                    <Button
                      asChild
                      variant="ghost"
                      className="w-fit p-0 h-auto font-black text-xs uppercase tracking-widest text-primary hover:bg-transparent group/btn mt-auto"
                    >
                      <Link href={`/blogs/${blog.slug}`}>
                        Read More{" "}
                        <ArrowRight
                          size={14}
                          className="ml-2 group-hover/btn:translate-x-2 transition-transform"
                        />
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="mt-20 flex justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
                className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest border-slate-200 dark:border-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                Previous
              </Button>
              <Button
                size="lg"
                variant="outline"
                disabled={page >= meta.totalPages}
                onClick={() => goToPage(page + 1)}
                className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest border-slate-200 dark:border-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function BlogsPageWrapper() {
  const searchParams = useSearchParams();
  return <BlogsPageContent key={searchParams.toString()} />;
}

export default function BlogsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <BlogsPageWrapper />
    </Suspense>
  );
}
