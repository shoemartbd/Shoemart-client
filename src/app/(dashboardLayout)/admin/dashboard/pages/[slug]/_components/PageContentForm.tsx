"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleRichTextEditor } from "@/components/shared/form/RichTextEditor";
import { updatePageContent } from "@/services/pageContent.services";
import { IPageContent } from "@/types/pageContent.types";

interface Props {
  slug: string;
  pageContent: IPageContent;
}

export default function PageContentForm({ slug, pageContent }: Props) {
  const [title, setTitle] = useState(pageContent.title);
  const [content, setContent] = useState(pageContent.content);

  const { mutate: saveContent, isPending: isSaving } = useMutation({
    mutationFn: () => updatePageContent(slug, { title, content }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || "Page updated successfully");
      } else {
        toast.error(res.message || "Failed to update page");
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    saveContent();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h4 className="font-semibold">Page Content</h4>
        </div>

        <div className="space-y-2">
          <Label htmlFor="page-title">Title</Label>
          <Input
            id="page-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Page title"
            className="h-11 rounded-xl"
            required
          />
        </div>

        <SimpleRichTextEditor
          id="page-content"
          label="Content"
          value={content}
          onChange={setContent}
          placeholder="Write the page content…"
          minHeight="300px"
        />
      </div>

      <Button
        type="submit"
        disabled={isSaving}
        className="h-12 px-8 rounded-full font-bold"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          "Update Page"
        )}
      </Button>
    </form>
  );
}
