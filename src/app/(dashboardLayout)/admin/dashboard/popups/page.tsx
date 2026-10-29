"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createPopup,
  deletePopup,
  getPopups,
  updatePopup,
} from "@/services/popup.services";
import { IPopup } from "@/types/popup.types";
import { confirmAction } from "@/lib/confirmAction";
import { cn } from "@/lib/utils";

const MAX_DELAY_SECONDS = 60;

export default function PopupsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<IPopup | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: popups = [], isLoading } = useQuery({
    queryKey: ["popups", "all"],
    queryFn: () => getPopups(),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["popups"] });

  const openForm = (popup: IPopup | null) => {
    setEditing(popup);
    setIsFormOpen(true);
  };

  const handleToggle = async (popup: IPopup) => {
    setBusyId(popup.id);
    try {
      const formData = new FormData();
      formData.append("isActive", String(!popup.isActive));
      await updatePopup(popup.id, formData);
      toast.success(popup.isActive ? "Popup turned off" : "Popup is now live");
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update popup");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (popup: IPopup) => {
    const ok = await confirmAction({
      title: "Delete this popup?",
      text: popup.isActive ? "It is live right now and will stop showing." : undefined,
      confirmText: "Delete",
    });
    if (!ok) return;
    setBusyId(popup.id);
    try {
      await deletePopup(popup.id);
      toast.success("Popup deleted");
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete popup");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold">Popup</h3>
          <p className="text-muted-foreground">
            An image that pops up a few seconds after a visitor opens the
            site, once per visit. Only one popup is live at a time.
          </p>
        </div>
        <Button className="rounded-xl" onClick={() => openForm(null)}>
          <Plus className="h-4 w-4" />
          Add Popup
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : popups.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
          <p className="text-muted-foreground">No popups yet.</p>
          <p className="text-sm text-muted-foreground">
            Add a 4:5 portrait image (800 × 1000 px) to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {popups.map((popup) => (
            <div
              key={popup.id}
              className={cn(
                "overflow-hidden rounded-xl border bg-card shadow-sm",
                popup.isActive && "ring-2 ring-primary",
              )}
            >
              <div className="relative aspect-[4/5] bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={popup.image}
                  alt={popup.title || "Popup"}
                  className="h-full w-full object-cover"
                />
                <Badge
                  className="absolute left-3 top-3"
                  variant={popup.isActive ? "default" : "secondary"}
                >
                  {popup.isActive ? "Live" : "Off"}
                </Badge>
              </div>

              <div className="space-y-3 p-4">
                <div className="space-y-1">
                  <p className="truncate font-semibold">
                    {popup.title || "Untitled popup"}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Shows after {popup.delaySeconds}s
                  </p>
                  {popup.link && (
                    <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                      <Link2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{popup.link}</span>
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={popup.isActive ? "outline" : "default"}
                    className="flex-1"
                    disabled={busyId === popup.id}
                    onClick={() => handleToggle(popup)}
                  >
                    {busyId === popup.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : popup.isActive ? (
                      "Turn Off"
                    ) : (
                      "Make Live"
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => openForm(popup)}
                    aria-label="Edit popup"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    disabled={busyId === popup.id}
                    onClick={() => handleDelete(popup)}
                    aria-label="Delete popup"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <PopupFormModal
          key={editing?.id ?? "new"}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          popup={editing}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}

interface PopupFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  popup: IPopup | null; // present = edit mode
  onSuccess: () => void;
}

function PopupFormModal({ open, onOpenChange, popup, onSuccess }: PopupFormModalProps) {
  const isEdit = Boolean(popup);
  // Mounted fresh on every open, so state starts from `popup`
  const [title, setTitle] = useState(popup?.title ?? "");
  const [link, setLink] = useState(popup?.link ?? "");
  const [delay, setDelay] = useState(String(popup?.delaySeconds ?? 3));
  const [isActive, setIsActive] = useState(popup?.isActive ?? true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(popup?.image ?? null);
  const [ratioWarning, setRatioWarning] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(selected);
    setPreview(url);

    // Warn (not block) when the image isn't close to 4:5; it gets cropped
    const img = new Image();
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      setRatioWarning(
        Math.abs(ratio - 0.8) > 0.05
          ? `This image is ${img.naturalWidth} × ${img.naturalHeight} px. It will be cropped to 4:5; use 800 × 1000 px for the best fit.`
          : img.naturalWidth < 600
            ? "This image is small and may look blurry. 800 × 1000 px works best."
            : "",
      );
    };
    img.src = url;
  };

  const handleSave = async () => {
    if (!isEdit && !file) {
      toast.error("Please upload a popup image");
      return;
    }
    const delaySeconds = Number(delay);
    if (!Number.isInteger(delaySeconds) || delaySeconds < 0 || delaySeconds > MAX_DELAY_SECONDS) {
      toast.error(`Delay must be between 0 and ${MAX_DELAY_SECONDS} seconds`);
      return;
    }
    const trimmedLink = link.trim();
    if (trimmedLink && !/^(https?:\/\/|\/)/i.test(trimmedLink)) {
      toast.error("Link must start with http://, https:// or /");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("link", trimmedLink);
      formData.append("delaySeconds", String(delaySeconds));
      formData.append("isActive", String(isActive));
      if (file) formData.append("image", file);

      if (isEdit && popup) {
        await updatePopup(popup.id, formData);
        toast.success("Popup updated");
      } else {
        await createPopup(formData);
        toast.success("Popup added");
      }
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save popup");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Popup" : "Add Popup"}</DialogTitle>
          <DialogDescription>
            Portrait image, 4:5 ratio (800 × 1000 px). It shows the same way
            on phones and computers.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-2 sm:grid-cols-[220px_1fr]">
          {/* Preview in the exact 4:5 frame visitors will see */}
          <div className="space-y-2">
            <label className="upload-zone flex aspect-[4/5] w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="Popup preview" className="h-full w-full object-cover" />
              ) : (
                <>
                  <Upload className="size-6 text-primary" />
                  <span className="px-4 text-center text-sm text-muted-foreground">
                    Click to upload
                    <br />
                    800 × 1000 px
                  </span>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            {preview && (
              <p className="text-center text-xs text-muted-foreground">
                Click the image to change it
              </p>
            )}
          </div>

          <div className="space-y-4">
            {ratioWarning && (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
                {ratioWarning}
              </p>
            )}

            <div className="grid gap-1.5">
              <Label htmlFor="popup-title">Title (only you see this)</Label>
              <Input
                id="popup-title"
                placeholder="e.g. Eid Offer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="popup-link">Link (optional)</Label>
              <Input
                id="popup-link"
                placeholder="/products or https://..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Where visitors go when they tap the image.
              </p>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="popup-delay">Show after (seconds)</Label>
              <Input
                id="popup-delay"
                type="number"
                min={0}
                max={MAX_DELAY_SECONDS}
                value={delay}
                onChange={(e) => setDelay(e.target.value)}
              />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <Checkbox checked={isActive} onCheckedChange={(v) => setIsActive(v === true)} />
              Make this popup live
            </label>
            {isActive && (
              <p className="-mt-2 text-xs text-muted-foreground">
                Any other live popup will be turned off.
              </p>
            )}

            <Button className="w-full" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Add Popup"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
