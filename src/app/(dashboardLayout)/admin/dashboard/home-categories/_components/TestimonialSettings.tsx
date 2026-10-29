"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  MessageSquareQuote,
  Pencil,
  Plus,
  Star,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createTestimonial,
  deleteTestimonial,
  getTestimonials,
  updateTestimonial,
} from "@/services/testimonial.services";
import { ITestimonial } from "@/types/testimonial.types";
import { confirmAction } from "@/lib/confirmAction";

// Customer reviews shown on the homepage above the footer
export default function TestimonialSettings() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<ITestimonial | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["testimonials", "all"],
    queryFn: () => getTestimonials(true),
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["testimonials"] });

  const openForm = (testimonial: ITestimonial | null) => {
    setEditing(testimonial);
    setIsFormOpen(true);
  };

  const handleDelete = async (testimonial: ITestimonial) => {
    const ok = await confirmAction({
      title: "Delete this testimonial?",
      text: `From "${testimonial.name}"`,
      confirmText: "Delete",
    });
    if (!ok) {
      return;
    }
    setDeletingId(testimonial.id);
    try {
      await deleteTestimonial(testimonial.id);
      toast.success("Testimonial deleted");
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete testimonial");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Testimonials</h4>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Shown on the homepage above the footer. With more than 3 they
            slide automatically.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={() => openForm(null)}
        >
          <Plus className="h-4 w-4" />
          Add Testimonial
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : testimonials.length === 0 ? (
        <div className="flex h-32 items-center justify-center border border-dashed rounded-xl">
          <p className="text-muted-foreground">
            No testimonials yet. Add one to show the section.
          </p>
        </div>
      ) : (
        <ul className="divide-y rounded-xl border">
          {testimonials.map((t) => (
            <li key={t.id} className="flex items-start gap-4 p-4">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-muted">
                {t.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="m-auto mt-2.5 h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{t.name}</span>
                  {t.role && (
                    <span className="text-xs text-muted-foreground">
                      {t.role}
                    </span>
                  )}
                  <span className="flex items-center gap-0.5 text-xs text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    {t.rating}
                  </span>
                  {!t.isActive && <Badge variant="secondary">Hidden</Badge>}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {t.content}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => openForm(t)}
                  aria-label={`Edit ${t.name}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  disabled={deletingId === t.id}
                  onClick={() => handleDelete(t)}
                  aria-label={`Delete ${t.name}`}
                >
                  {deletingId === t.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isFormOpen && (
        <TestimonialFormModal
          key={editing?.id ?? "new"}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          testimonial={editing}
          nextOrder={testimonials.length}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}

interface TestimonialFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial: ITestimonial | null; // present = edit mode
  nextOrder: number;
  onSuccess: () => void;
}

function TestimonialFormModal({
  open,
  onOpenChange,
  testimonial,
  nextOrder,
  onSuccess,
}: TestimonialFormModalProps) {
  const isEdit = Boolean(testimonial);
  // Mounted fresh on every open, so state starts from `testimonial`
  const [name, setName] = useState(testimonial?.name ?? "");
  const [role, setRole] = useState(testimonial?.role ?? "");
  const [content, setContent] = useState(testimonial?.content ?? "");
  const [rating, setRating] = useState(testimonial?.rating ?? 5);
  const [order, setOrder] = useState(String(testimonial?.order ?? nextOrder));
  const [isActive, setIsActive] = useState(testimonial?.isActive ?? true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    testimonial?.avatar ?? null,
  );
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setRemoveAvatar(false);
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!content.trim()) {
      toast.error("Review text is required");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("role", role.trim());
      formData.append("content", content.trim());
      formData.append("rating", String(rating));
      formData.append("order", order);
      formData.append("isActive", String(isActive));
      if (file) formData.append("avatar", file);
      else if (removeAvatar) formData.append("removeAvatar", "true");

      if (isEdit && testimonial) {
        await updateTestimonial(testimonial.id, formData);
        toast.success("Testimonial updated");
      } else {
        await createTestimonial(formData);
        toast.success("Testimonial added");
      }
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save testimonial");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Testimonial" : "Add Testimonial"}
          </DialogTitle>
          <DialogDescription>
            Photo is optional: square, 200 × 200 px works best.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="flex items-center gap-4">
            <label className="upload-zone flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-full">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Photo preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Upload className="size-5 text-primary" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            <div className="space-y-1 text-sm">
              <p className="font-medium">Customer Photo</p>
              {preview && (
                <button
                  type="button"
                  className="text-xs text-destructive hover:underline"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setRemoveAvatar(true);
                  }}
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="testimonial-name">Name *</Label>
              <Input
                id="testimonial-name"
                placeholder="e.g. Rahim Uddin"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="testimonial-role">Role / Location</Label>
              <Input
                id="testimonial-role"
                placeholder="e.g. Regular Buyer, Dhaka"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="testimonial-content">Review *</Label>
            <Textarea
              id="testimonial-content"
              rows={4}
              placeholder="What the customer said..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    aria-label={`${value} star${value > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`h-6 w-6 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="testimonial-order">Position</Label>
              <Input
                id="testimonial-order"
                type="number"
                min={0}
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <Checkbox
              checked={isActive}
              onCheckedChange={(v) => setIsActive(v === true)}
            />
            Show on homepage
          </label>

          <Button className="w-full" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Add Testimonial"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
