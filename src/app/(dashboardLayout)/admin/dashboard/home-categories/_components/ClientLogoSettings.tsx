"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Loader2, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createClientLogo,
  deleteClientLogo,
  getClientLogos,
  updateClientLogo,
} from "@/services/clientLogo.services";
import { IClientLogo } from "@/types/clientLogo.types";
import { confirmAction } from "@/lib/confirmAction";

// Client logos shown on the homepage right before the testimonials
export default function ClientLogoSettings() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<IClientLogo | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["client-logos", "all"],
    queryFn: () => getClientLogos(true),
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["client-logos"] });

  const openForm = (client: IClientLogo | null) => {
    setEditing(client);
    setIsFormOpen(true);
  };

  const handleDelete = async (client: IClientLogo) => {
    const ok = await confirmAction({
      title: "Delete this client?",
      text: `"${client.name}" will be removed from the homepage`,
      confirmText: "Delete",
    });
    if (!ok) {
      return;
    }
    setDeletingId(client.id);
    try {
      await deleteClientLogo(client.id);
      toast.success("Client deleted");
      refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete client");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Our Clients</h4>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Logos shown on the homepage before the testimonials, sliding
            like the brand strip.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={() => openForm(null)}
        >
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : clients.length === 0 ? (
        <div className="flex h-32 items-center justify-center border border-dashed rounded-xl">
          <p className="text-muted-foreground">
            No clients yet. Add one to show the section.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {clients.map((client) => (
            <li
              key={client.id}
              className="flex items-center gap-3 rounded-xl border p-3"
            >
              <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-white p-1.5 ring-1 ring-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={client.logo}
                  alt={client.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-semibold">{client.name}</span>
                  {!client.isActive && (
                    <Badge variant="secondary">Hidden</Badge>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  #{client.order}
                  {client.website && ` · ${client.website}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => openForm(client)}
                  aria-label={`Edit ${client.name}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8"
                  disabled={deletingId === client.id}
                  onClick={() => handleDelete(client)}
                  aria-label={`Delete ${client.name}`}
                >
                  {deletingId === client.id ? (
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
        <ClientLogoFormModal
          key={editing?.id ?? "new"}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          client={editing}
          nextOrder={clients.length}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}

interface ClientLogoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: IClientLogo | null; // present = edit mode
  nextOrder: number;
  onSuccess: () => void;
}

function ClientLogoFormModal({
  open,
  onOpenChange,
  client,
  nextOrder,
  onSuccess,
}: ClientLogoFormModalProps) {
  const isEdit = Boolean(client);
  // Mounted fresh on every open, so state starts from `client`
  const [name, setName] = useState(client?.name ?? "");
  const [website, setWebsite] = useState(client?.website ?? "");
  const [order, setOrder] = useState(String(client?.order ?? nextOrder));
  const [isActive, setIsActive] = useState(client?.isActive ?? true);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(client?.logo ?? null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Client name is required");
      return;
    }
    if (!isEdit && !file) {
      toast.error("Client logo is required");
      return;
    }

    // Accept "example.com" as well as full URLs
    const site = website.trim();
    const normalizedWebsite =
      site && !/^https?:\/\//i.test(site) ? `https://${site}` : site;

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("website", normalizedWebsite);
      formData.append("order", order);
      formData.append("isActive", String(isActive));
      if (file) formData.append("logo", file);

      if (isEdit && client) {
        await updateClientLogo(client.id, formData);
        toast.success("Client updated");
      } else {
        await createClientLogo(formData);
        toast.success("Client added");
      }
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to save client");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Client" : "Add Client"}</DialogTitle>
          <DialogDescription>
            Square logo works best (e.g. 300 × 300 px), PNG or SVG.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <label className="upload-zone flex h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl bg-white p-4">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Logo preview"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <>
                <Upload className="size-5 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Click to upload logo *
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <div className="grid gap-1.5">
            <Label htmlFor="client-name">Client Name *</Label>
            <Input
              id="client-name"
              placeholder="e.g. H&M"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
            <div className="grid gap-1.5">
              <Label htmlFor="client-website">Website (optional)</Label>
              <Input
                id="client-website"
                placeholder="e.g. hm.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="client-order">Position</Label>
              <Input
                id="client-order"
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
              "Add Client"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
