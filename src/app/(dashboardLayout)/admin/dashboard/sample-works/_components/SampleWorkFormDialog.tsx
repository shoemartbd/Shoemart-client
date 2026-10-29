"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileText, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createSampleWork,
  getSampleWorkUploadSignature,
  updateSampleWork,
} from "@/services/sampleWork.services";
import { formatFileSize, uploadToCloudinary } from "@/lib/sampleWork";
import { ISampleWork } from "@/types/sampleWork.types";

const MAX_MB = 50;

interface SampleWorkFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sampleWork: ISampleWork | null; // present = edit mode
  onSuccess: () => void;
}

export default function SampleWorkFormDialog({
  open,
  onOpenChange,
  sampleWork,
  onSuccess,
}: SampleWorkFormDialogProps) {
  const isEdit = Boolean(sampleWork);
  const [title, setTitle] = useState(sampleWork?.title ?? "");
  const [description, setDescription] = useState(sampleWork?.description ?? "");
  const [isActive, setIsActive] = useState(sampleWork?.isActive ?? true);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      toast.error("Please choose a PDF file");
      return;
    }
    if (selected.size > MAX_MB * 1024 * 1024) {
      toast.error(`PDF must be under ${MAX_MB} MB`);
      return;
    }
    setFile(selected);
    if (!title.trim()) setTitle(selected.name.replace(/\.pdf$/i, ""));
  };

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Title is required");
    if (!isEdit && !file) return toast.error("Choose a PDF to upload");

    setIsSaving(true);
    try {
      let upload: { fileUrl: string; publicId: string; fileSize: number } | null = null;
      if (file) {
        setProgress(0);
        const signature = await getSampleWorkUploadSignature();
        const result = await uploadToCloudinary(file, signature, setProgress);
        upload = {
          fileUrl: result.secure_url,
          publicId: result.public_id,
          fileSize: result.bytes,
        };
      }

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        isActive,
        ...upload,
      };

      if (sampleWork) {
        await updateSampleWork(sampleWork.id, payload);
        toast.success("Sample work updated");
      } else {
        await createSampleWork({ ...payload, fileUrl: upload!.fileUrl });
        toast.success("Sample work added");
      }
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    } finally {
      setIsSaving(false);
      setProgress(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !isSaving && onOpenChange(next)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Sample Work" : "Add Sample Work"}</DialogTitle>
          <DialogDescription>
            Upload a PDF (catalogue, portfolio, price list). Customers can view
            and download it from the homepage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <label className="upload-zone flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl p-4 text-center">
            {file ? (
              <>
                <FileText className="size-8 text-red-500" />
                <span className="text-sm font-semibold">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)} · click to change
                </span>
              </>
            ) : (
              <>
                <span className="upload-icon">
                  <Upload className="size-5" />
                </span>
                <span className="text-sm font-semibold text-primary">
                  {isEdit ? "Replace PDF (optional)" : "Choose PDF *"}
                </span>
                <span className="text-xs text-muted-foreground">Up to {MAX_MB} MB</span>
              </>
            )}
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              disabled={isSaving}
              onChange={handleFile}
            />
          </label>

          {progress !== null && (
            <div className="space-y-1">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-right text-xs text-muted-foreground">
                Uploading… {progress}%
              </p>
            </div>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="sw-title">Title *</Label>
            <Input
              id="sw-title"
              placeholder="e.g. Product Catalogue 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="sw-description">Short description</Label>
            <Textarea
              id="sw-description"
              rows={2}
              placeholder="What's inside (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <Checkbox checked={isActive} onCheckedChange={(v) => setIsActive(v === true)} />
            Show on homepage
          </label>

          <Button className="w-full" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {progress !== null && progress < 100 ? "Uploading..." : "Saving..."}
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Upload & Save"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
