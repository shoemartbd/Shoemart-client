"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { createHeroSlider } from "@/services/heroSlider.services";

export type SliderType = "SLIDE" | "BANNER";

const COPY: Record<SliderType, { button: string; title: string; hint: string }> = {
  SLIDE: {
    button: "Add Slide",
    title: "Upload New Slide",
    hint: "Image or video. Rotates in the main slider. Use 1800 × 600 px (ratio 3:1). Keep text and faces away from the edges. Videos play muted and move on when they end; keep them short (under 30s) and small (MP4).",
  },
  BANNER: {
    button: "Add Banner",
    title: "Upload Offer Banner",
    hint: "Fixed beside the slider (max 2). Use 800 × 400 px (ratio 2:1). Keep text and faces away from the edges.",
  },
};

interface CreateSliderModalProps {
  type: SliderType;
  onSuccess: () => void;
  disabled?: boolean;
}

export default function CreateSliderModal({
  type,
  onSuccess,
  disabled,
}: CreateSliderModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const isVideo = file?.type.startsWith("video/") ?? false;
  const [link, setLink] = useState("");

  const copy = COPY[type];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (type === "BANNER" && selectedFile.type.startsWith("video/")) {
        toast.error("Offer banners must be images");
        e.target.value = "";
        return;
      }
      setFile(selectedFile);
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("type", type);
      if (link.trim()) formData.append("link", link.trim());

      await createHeroSlider(formData);
      toast.success(`${type === "BANNER" ? "Banner" : "Slide"} added successfully`);
      setIsOpen(false);
      setFile(null);
      setPreview(null);
      setLink("");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full" disabled={disabled}>
          <Plus className="w-4 h-4 mr-2" />
          {copy.button}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{copy.hint}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="slider-image">
              {type === "SLIDE" ? "Image or Video" : "Image"}
            </Label>
            <Input
              id="slider-image"
              type="file"
              accept={type === "SLIDE" ? "image/*,video/*" : "image/*"}
              onChange={handleFileChange}
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="slider-link">Link (optional)</Label>
            <Input
              id="slider-link"
              placeholder="/products?categoryId=... or https://..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Where shoppers go when they click the image.
            </p>
          </div>

          {preview && (
            <div className="rounded-xl overflow-hidden border">
              {isVideo ? (
                <video
                  src={preview}
                  controls
                  muted
                  className="w-full h-auto max-h-64 bg-black"
                />
              ) : (
                <img src={preview} alt="Preview" className="w-full h-auto object-cover max-h-64" />
              )}
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
