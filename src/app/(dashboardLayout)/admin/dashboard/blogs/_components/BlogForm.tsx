"use client";

import { createBlogAction, updateBlogAction } from "../_action";
import { SimpleRichTextEditor } from "@/components/shared/form/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IBlog, IBlogFormValues } from "@/types/blog.types";
import { Loader2, Save, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const getInitialValues = (blog?: IBlog | null): IBlogFormValues => ({
  title: blog?.title || "",
  excerpt: blog?.excerpt || "",
  content: blog?.content || "",
  author: blog?.author || "",
  isPublished: blog?.isPublished ?? false,
});

interface BlogFormProps {
  mode: "create" | "edit";
  blog?: IBlog | null;
}

export default function BlogForm({ mode, blog }: BlogFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<IBlogFormValues>(getInitialValues(blog));
  const [isSaving, setIsSaving] = useState(false);

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    blog?.coverImage || null,
  );
  const [removeCoverImage, setRemoveCoverImage] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setCoverImageFile(selectedFile);
        setRemoveCoverImage(false);
        const reader = new FileReader();
        reader.onloadend = () => setCoverImagePreview(reader.result as string);
        reader.readAsDataURL(selectedFile);
      }
    },
    [],
  );

  const handleRemoveCoverImage = () => {
    setCoverImageFile(null);
    setCoverImagePreview(null);
    setRemoveCoverImage(true);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!values.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!values.content.trim()) {
      toast.error("Please write some content");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          title: values.title,
          excerpt: values.excerpt,
          content: values.content,
          author: values.author,
          isPublished: values.isPublished,
          ...(mode === "edit" && { removeCoverImage }),
        }),
      );
      if (coverImageFile) formData.append("coverImage", coverImageFile);

      const result =
        mode === "create"
          ? await createBlogAction(formData)
          : await updateBlogAction(blog!.id, formData);

      if (!result.success) {
        toast.error(result.message || "Failed to save blog post");
        return;
      }

      toast.success(
        mode === "create"
          ? "Blog post created successfully"
          : "Blog post updated successfully",
      );
      router.push("/admin/dashboard/blogs");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-4xl">
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={values.title}
              onChange={handleChange}
              placeholder="e.g. 10 Summer Fashion Trends"
              className="h-12 rounded-xl"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              name="author"
              value={values.author}
              onChange={handleChange}
              placeholder="e.g. Shoe Mart Team"
              className="h-12 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            name="excerpt"
            value={values.excerpt}
            onChange={handleChange}
            placeholder="A short summary shown on the blog listing card"
            rows={3}
          />
        </div>

        <SimpleRichTextEditor
          id="content"
          label="Content"
          value={values.content}
          onChange={(html) => setValues((prev) => ({ ...prev, content: html }))}
          placeholder="Write the blog post content..."
          minHeight="280px"
        />

        <div className="space-y-2">
          <Label>Cover Image</Label>
          {!coverImagePreview ? (
            <label className="flex h-40 w-full max-w-sm cursor-pointer flex-col items-center justify-center rounded-xl upload-zone">
              <span className="upload-icon mb-2"><Upload className="size-5" /></span>
              <span className="text-xs font-semibold text-primary text-center px-4">
                Upload Cover Image
              </span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <div className="relative h-40 w-full max-w-sm overflow-hidden rounded-xl border">
              <Image
                src={coverImagePreview}
                alt="Cover preview"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 size-7 rounded-full"
                onClick={handleRemoveCoverImage}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="isPublished"
            checked={values.isPublished}
            onCheckedChange={(checked) =>
              setValues((prev) => ({ ...prev, isPublished: checked === true }))
            }
          />
          <Label htmlFor="isPublished" className="cursor-pointer">
            Publish immediately
          </Label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSaving}
          className="h-12 px-8 rounded-full font-bold"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {mode === "create" ? "Create Blog Post" : "Save Changes"}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 px-8 rounded-full font-bold"
          onClick={() => router.push("/admin/dashboard/blogs")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
