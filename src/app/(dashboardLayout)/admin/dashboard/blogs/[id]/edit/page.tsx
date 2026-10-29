import { notFound } from "next/navigation";
import { getBlogById } from "@/services/blog.services";
import BlogForm from "../../_components/BlogForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params;

  let blog = null;
  try {
    const res = await getBlogById(id);
    blog = res?.data ?? null;
  } catch {
    blog = null;
  }

  if (!blog) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Edit Blog Post</h3>
        <p className="text-muted-foreground">
          Update the article content. Changes go live immediately when
          published.
        </p>
      </div>

      <BlogForm mode="edit" blog={blog} />
    </div>
  );
}
