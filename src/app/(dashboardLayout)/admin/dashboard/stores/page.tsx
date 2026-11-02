"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  ExternalLink,
  Loader2,
  Map as MapIcon,
  MapPin,
  Pencil,
  Plus,
  Store as StoreIcon,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteStore, getStores } from "@/services/store.services";
import { IStore } from "@/types/store.types";
import { confirmAction } from "@/lib/confirmAction";
import StoreFormDialog from "./_components/StoreFormDialog";

export default function StoresPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<IStore | null>(null);

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores", "all"],
    queryFn: () => getStores(true),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["stores"] });

  const openForm = (store: IStore | null) => {
    setEditing(store);
    setFormOpen(true);
  };

  const handleDelete = async (store: IStore) => {
    const ok = await confirmAction({
      title: `Delete "${store.name}"?`,
      text: "It will be removed from the Our Stores page.",
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await deleteStore(store.id);
      toast.success("Store deleted");
      refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold">Stores</h3>
          <p className="text-muted-foreground">
            Outlets shown on the{" "}
            <a href="/our-stores" target="_blank" className="text-primary underline-offset-4 hover:underline">
              Our Stores
            </a>{" "}
            page. The hotline comes from Site Settings → Phone.
          </p>
        </div>
        <Button className="rounded-full" onClick={() => openForm(null)}>
          <Plus className="mr-2 size-4" />
          Add Store
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : stores.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-center">
          <StoreIcon className="size-10 text-muted-foreground/50" />
          <p className="font-semibold">No stores yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first outlet with its photo, address and map.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {stores.map((store) => (
            <div key={store.id} className="flex overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="relative w-32 shrink-0 bg-muted sm:w-40">
                {store.image ? (
                  <Image src={store.image} alt="" fill sizes="160px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <StoreIcon className="size-8 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-4">
                <div className="flex items-start gap-2">
                  <p className="line-clamp-1 flex-1 font-semibold">{store.name}</p>
                  {!store.isActive && <Badge variant="secondary">Hidden</Badge>}
                </div>
                <Badge variant="outline" className="w-fit">
                  <MapPin className="mr-1 size-3" />
                  {store.city}
                </Badge>
                <p className="line-clamp-2 text-xs text-muted-foreground">{store.address}</p>
                {store.openingHours && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {store.openingHours}
                  </p>
                )}
                <div className="mt-auto flex items-center gap-2 pt-2">
                  {store.mapEmbedUrl && (
                    <span title="Map added" className="text-muted-foreground">
                      <MapIcon className="size-4" />
                    </span>
                  )}
                  {store.directionUrl && (
                    <a
                      href={store.directionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open directions link"
                      className="text-muted-foreground hover:text-primary"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                  <span className="text-xs text-muted-foreground">Order: {store.order}</span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="ml-auto size-8"
                    onClick={() => openForm(store)}
                    aria-label={`Edit ${store.name}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="size-8"
                    onClick={() => handleDelete(store)}
                    aria-label={`Delete ${store.name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <StoreFormDialog
          key={editing?.id ?? "new"}
          open={formOpen}
          onOpenChange={setFormOpen}
          store={editing}
          cities={[...new Set(stores.map((s) => s.city))]}
          onSuccess={refresh}
        />
      )}
    </div>
  );
}
