"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link2, Loader2, Trash2 } from "lucide-react";
import { getHeroSliders, deleteHeroSlider } from "@/services/heroSlider.services";
import CreateSliderModal, { SliderType } from "./_components/CreateSliderModal";
import { confirmAction } from "@/lib/confirmAction";

export default function HeroSlidersPage() {
  const [sliders, setSliders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSliders = async () => {
    setIsLoading(true);
    try {
      const res = await getHeroSliders();
      setSliders(res || []);
    } catch (error) {
      toast.error("Failed to load sliders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const handleDelete = async (id: string) => {
    const ok = await confirmAction({ title: "Delete this image?", confirmText: "Delete" });
    if (!ok) return;

    try {
      await deleteHeroSlider(id);
      toast.success("Deleted successfully");
      fetchSliders();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  const slides = sliders.filter((s) => s.type !== "BANNER");

  const renderGrid = (items: any[], type: SliderType) =>
    items.length === 0 ? (
      <div className="flex h-40 items-center justify-center border border-dashed rounded-xl">
        <p className="text-muted-foreground text-sm">
          {type === "BANNER"
            ? "No banners yet. The slider will take the full width."
            : "No slides yet. Add one to get started."}
        </p>
      </div>
    ) : (
      <div
        className={`grid gap-6 ${
          type === "BANNER"
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        }`}
      >
        {items.map((slider) => (
          <div key={slider.id} className="space-y-2">
            <div className="relative group rounded-xl overflow-hidden border shadow-sm">
              {slider.mediaType === "VIDEO" ? (
                // #t=0.1 makes the browser show a frame as the thumbnail
                <video
                  src={`${slider.image}#t=0.1`}
                  muted
                  playsInline
                  preload="metadata"
                  className="w-full aspect-2/1 object-cover bg-black"
                />
              ) : (
                <img
                  src={slider.image}
                  alt={type === "BANNER" ? "Banner" : "Slide"}
                  className="w-full aspect-2/1 object-cover transition-transform group-hover:scale-105"
                />
              )}
              {slider.mediaType === "VIDEO" && (
                <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Video
                </span>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(slider.id)}
                  className="rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {slider.link && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                <Link2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{slider.link}</span>
              </p>
            )}
          </div>
        ))}
      </div>
    );

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-2xl font-bold">Hero Sliders</h3>
        <p className="text-muted-foreground">
          Manage the slider displayed at the top of the homepage.
        </p>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="text-lg font-semibold">Slides</h4>
                <p className="text-sm text-muted-foreground">
                  Images or videos. Rotate automatically across the full width.
                </p>
                <p className="text-sm font-medium text-primary">
                  Size: 1800 × 600 px · Ratio 3:1
                </p>
              </div>
              <CreateSliderModal type="SLIDE" onSuccess={fetchSliders} />
            </div>
            {renderGrid(slides, "SLIDE")}
          </section>

        </>
      )}
    </div>
  );
}
