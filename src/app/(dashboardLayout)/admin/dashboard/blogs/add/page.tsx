import BlogForm from "../_components/BlogForm";

export default function AddBlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Create Blog Post</h3>
        <p className="text-muted-foreground">
          Write a new article for the Shoe Mart Journal.
        </p>
      </div>

      <BlogForm mode="create" />
    </div>
  );
}
