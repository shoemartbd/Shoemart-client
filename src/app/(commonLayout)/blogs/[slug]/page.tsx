import { Metadata } from "next";
import Image from "next/image";
import { format } from "date-fns";
import { Calendar, User } from "lucide-react";
import { getBlogBySlug } from "@/services/blog.services";
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

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const response = await getBlogBySlug(slug);
    const blog = response?.data;

    if (!blog) {
      return { title: "Article Not Found" };
    }

    return {
      title: `${blog.title} | Shoe Mart Journal`,
      description: blog.excerpt || undefined,
    };
  } catch {
    return { title: "Article | Shoe Mart Journal" };
  }
}

export default async function BlogDetailsPage({ params }: Props) {
  const { slug } = await params;

  let blog = null;
  let hasError = false;

  try {
    const response = await getBlogBySlug(slug);
    blog = response?.data;
  } catch {
    hasError = true;
  }

  if (hasError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-destructive">Error</h1>
          <p className="text-muted-foreground">
            Failed to load this article. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Article Not Found
          </h1>
          <p className="text-muted-foreground">
            The article you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <section className="bg-slate-50 dark:bg-slate-900/50 pt-24 pb-16 border-b border-slate-100 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="container mx-auto px-6 relative z-10 max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight mb-6">
            {blog.title}
          </h1>
          <div className="flex items-center gap-6 text-xs font-black text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-primary" />
              {format(new Date(blog.createdAt), "MMMM dd, yyyy")}
            </span>
            {blog.author && (
              <span className="flex items-center gap-1.5">
                <User size={14} className="text-primary" /> {blog.author}
              </span>
            )}
          </div>
        </div>
      </section>

      {blog.coverImage && (
        <div className="container mx-auto px-6 -mt-10 relative z-10 max-w-4xl">
          <div className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl">
            <Image
              src={blog.coverImage}
              alt={blog.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      <section className="py-16 container mx-auto px-6">
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
          <div
            className={proseClassNames}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </section>
    </div>
  );
}
