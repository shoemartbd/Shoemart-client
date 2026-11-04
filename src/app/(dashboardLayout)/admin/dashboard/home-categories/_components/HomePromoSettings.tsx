"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clapperboard, Loader2, Megaphone, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getHomePromo, updateHomePromo } from "@/services/homePromo.services";
import { IHomePromo } from "@/types/homePromo.types";

// Scrolling text + promo banner shown under "Top Selling" on the homepage
export default function HomePromoSettings() {
  const { data: promo, isLoading } = useQuery({
    queryKey: ["home-promo"],
    queryFn: () => getHomePromo(),
  });

  if (isLoading || !promo) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border bg-card">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Keyed so the form starts from the saved values after each save
  return <PromoForm key={promo.updatedAt} promo={promo} />;
}

function PromoForm({ promo }: { promo: IHomePromo }) {
  const queryClient = useQueryClient();
  const [tickerText, setTickerText] = useState(promo.tickerText ?? "");
  const [tickerEnabled, setTickerEnabled] = useState(promo.tickerEnabled);
  const topBanner = useBannerState(
    promo.bannerImage,
    promo.bannerLink,
    promo.bannerEnabled,
  );
  const productsBanner = useBannerState(
    promo.productsBannerImage,
    promo.productsBannerLink,
    promo.productsBannerEnabled,
  );
  const [showcaseEnabled, setShowcaseEnabled] = useState(promo.showcaseEnabled ?? true);
  const showLeft = useMediaState(promo.showcaseLeftImage, promo.showcaseLeftLink);
  const showVideo = useMediaState(promo.showcaseVideo, promo.showcaseVideoLink);
  const showRight = useMediaState(promo.showcaseRightImage, promo.showcaseRightLink);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("tickerText", tickerText);
      formData.append("tickerEnabled", String(tickerEnabled));
      formData.append("bannerLink", topBanner.link);
      formData.append("bannerEnabled", String(topBanner.enabled));
      if (topBanner.file) formData.append("bannerImage", topBanner.file);
      else if (topBanner.removed) formData.append("removeBanner", "true");
      formData.append("productsBannerLink", productsBanner.link);
      formData.append("productsBannerEnabled", String(productsBanner.enabled));
      if (productsBanner.file)
        formData.append("productsBannerImage", productsBanner.file);
      else if (productsBanner.removed)
        formData.append("removeProductsBanner", "true");

      formData.append("showcaseEnabled", String(showcaseEnabled));
      (
        [
          ["showcaseLeftImage", "showcaseLeftLink", showLeft],
          ["showcaseVideo", "showcaseVideoLink", showVideo],
          ["showcaseRightImage", "showcaseRightLink", showRight],
        ] as const
      ).forEach(([field, linkField, media]) => {
        formData.append(linkField, media.link);
        if (media.file) formData.append(field, media.file);
        else if (media.removed) {
          formData.append(`remove${field[0].toUpperCase()}${field.slice(1)}`, "true");
        }
      });

      await updateHomePromo(formData);
      toast.success("Homepage promo saved");
      queryClient.invalidateQueries({ queryKey: ["home-promo"] });
    } catch (error: any) {
      toast.error(error.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" />
          <h4 className="font-semibold">Promo Banners & Scrolling Text</h4>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Scrolling text and the first banner show right after &quot;Top
          Selling Products&quot;; the showcase (photo, video, photo) shows
          above &quot;All Products&quot; and the second banner right under
          the product cards.
        </p>
      </div>

      {/* Scrolling text */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="ticker-text">Scrolling Text</Label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              checked={tickerEnabled}
              onCheckedChange={(v) => setTickerEnabled(v === true)}
            />
            Show
          </label>
        </div>
        <Input
          id="ticker-text"
          placeholder="e.g. Welcome to Shoe Mart! Free delivery on orders over ৳500"
          value={tickerText}
          onChange={(e) => setTickerText(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Scrolls right to left across the page. Leave empty to hide it.
        </p>
      </div>

      <BannerField
        id="top-banner"
        label="Banner Image"
        hint='Shown right above "New Arrivals". Link it to /products?highlight=NEW_ARRIVAL to open all new arrivals.'
        state={topBanner}
      />

      {/* Showcase: photo | video | photo */}
      <div className="space-y-3 rounded-xl border p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Label className="flex items-center gap-1.5">
              <Clapperboard className="size-4 text-primary" /> Showcase (photo · video · photo)
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Shown right above &quot;All Products&quot;. On phones the video sits on top
              with the two photos below. Leave any one empty to skip it.
            </p>
          </div>
          <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={showcaseEnabled}
              onCheckedChange={(v) => setShowcaseEnabled(v === true)}
            />
            Show
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-[1fr_1.25fr_1fr]">
          <MediaField id="showcase-left" label="Left Photo" hint="Portrait, e.g. 800 × 1150 px" state={showLeft} />
          <MediaField
            id="showcase-video"
            label="Middle Video"
            hint="MP4, under 30 MB, e.g. 1080 × 1260 px. Plays muted on a loop."
            state={showVideo}
            video
          />
          <MediaField id="showcase-right" label="Right Photo" hint="Portrait, e.g. 800 × 1150 px" state={showRight} />
        </div>
      </div>

      <BannerField
        id="products-banner"
        label="All Products Banner"
        hint='Shown right under the "All Products" cards.'
        state={productsBanner}
      />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="rounded-full px-6">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Promo"
          )}
        </Button>
      </div>
    </div>
  );
}

// Image + link + show toggle for one banner, with a local preview before saving
function useBannerState(
  image: string | null,
  savedLink: string | null,
  savedEnabled: boolean,
) {
  const [link, setLink] = useState(savedLink ?? "");
  const [enabled, setEnabled] = useState(savedEnabled);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(image);
  const [removed, setRemoved] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setRemoved(false);
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(selected));
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setRemoved(true);
  };

  return {
    link,
    setLink,
    enabled,
    setEnabled,
    file,
    preview,
    removed,
    handleFileChange,
    handleRemove,
  };
}

function BannerField({
  id,
  label,
  hint,
  state,
}: {
  id: string;
  label: string;
  hint: string;
  state: ReturnType<typeof useBannerState>;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <Label>{label}</Label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox
            checked={state.enabled}
            onCheckedChange={(v) => state.setEnabled(v === true)}
          />
          Show
        </label>
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
      <p className="text-sm font-medium text-primary">
        Size: 1920 × 330 px (wide strip, about 6:1)
      </p>

      {state.preview ? (
        <div className="relative overflow-hidden rounded-xl border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={state.preview}
            alt="Banner preview"
            className="aspect-[1920/330] w-full object-cover"
          />
          <div className="absolute right-2 top-2 flex gap-2">
            <label className="upload-btn inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs shadow">
              <Upload className="h-3.5 w-3.5" />
              Change
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={state.handleFileChange}
              />
            </label>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="h-8 rounded-full"
              onClick={state.handleRemove}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <label className="upload-zone flex aspect-[1920/330] min-h-24 w-full cursor-pointer flex-col items-center justify-center rounded-xl">
          <span className="upload-icon mb-1">
            <Upload className="size-5" />
          </span>
          <span className="text-xs font-semibold text-primary">
            Upload Banner
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={state.handleFileChange}
          />
        </label>
      )}

      <div className="grid gap-1.5 pt-2">
        <Label htmlFor={`${id}-link`}>Banner Link (optional)</Label>
        <Input
          id={`${id}-link`}
          placeholder="/products?categoryId=... or https://..."
          value={state.link}
          onChange={(e) => state.setLink(e.target.value)}
        />
      </div>
    </div>
  );
}

const MAX_IMAGE = 5 * 1024 * 1024;
const MAX_VIDEO = 30 * 1024 * 1024;

// One showcase slot: a photo or video + optional link, previewed before saving
function useMediaState(saved: string | null, savedLink: string | null) {
  const [link, setLink] = useState(savedLink ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(saved);
  const [removed, setRemoved] = useState(false);

  const pick = (selected: File, video: boolean) => {
    if (video ? !selected.type.startsWith("video/") : !selected.type.startsWith("image/")) {
      toast.error(video ? "Please choose a video (MP4)" : "Please choose an image");
      return;
    }
    if (selected.size > (video ? MAX_VIDEO : MAX_IMAGE)) {
      toast.error(video ? "Video must be under 30 MB" : "Image must be under 5 MB");
      return;
    }
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    setFile(selected);
    setRemoved(false);
    setPreview(URL.createObjectURL(selected));
  };

  const remove = () => {
    setFile(null);
    setPreview(null);
    setRemoved(true);
  };

  return { link, setLink, file, preview, removed, pick, remove };
}

function MediaField({
  id,
  label,
  hint,
  state,
  video = false,
}: {
  id: string;
  label: string;
  hint: string;
  state: ReturnType<typeof useMediaState>;
  video?: boolean;
}) {
  const input = (
    <input
      type="file"
      accept={video ? "video/mp4,video/webm" : "image/*"}
      className="hidden"
      onChange={(e) => {
        const selected = e.target.files?.[0];
        e.target.value = "";
        if (selected) state.pick(selected, video);
      }}
    />
  );

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <p className="text-xs text-muted-foreground">{hint}</p>
      {state.preview ? (
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl border bg-black">
          {video ? (
            <video src={state.preview} muted loop autoPlay playsInline className="h-full w-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={state.preview} alt="" className="h-full w-full object-cover" />
          )}
          <div className="absolute right-2 top-2 flex gap-2">
            <label className="upload-btn inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs shadow">
              <Upload className="h-3.5 w-3.5" />
              Change
              {input}
            </label>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              className="h-8 rounded-full"
              onClick={state.remove}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <label className="upload-zone flex aspect-[4/5] w-full cursor-pointer flex-col items-center justify-center rounded-xl">
          <span className="upload-icon mb-1">
            <Upload className="size-5" />
          </span>
          <span className="text-xs font-semibold text-primary">
            {video ? "Upload Video" : "Upload Photo"}
          </span>
          {input}
        </label>
      )}
      <Input
        id={`${id}-link`}
        placeholder="Link (optional)"
        value={state.link}
        onChange={(e) => state.setLink(e.target.value)}
        aria-label={`${label} link`}
      />
    </div>
  );
}
