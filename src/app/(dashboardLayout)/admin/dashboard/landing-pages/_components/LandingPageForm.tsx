"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SimpleRichTextEditor } from "@/components/shared/form/RichTextEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Save,
  Upload,
  X,
  Rocket,
  Images,
  Video,
  FileText,
  Star,
  ShoppingBag,
  Palette,
  GripVertical,
  Lock,
} from "lucide-react";
import { getAllProducts } from "@/services/product.services";
import {
  createLandingPage,
  updateLandingPage,
} from "@/services/landingPage.services";
import { ILandingPage, LandingPageFormValues } from "@/types/landingPage.types";
import {
  DEFAULT_LANDING_PAGE_THEME,
  LANDING_PAGE_THEMES,
  LandingPageThemeKey,
} from "@/lib/landingPageThemes";
import {
  LANDING_PAGE_SECTION_LABELS,
  LandingPageSectionKey,
  resolveSectionOrder,
} from "@/lib/landingPageSections";

// "price" has no show/hide field — it's always visible, only reorderable.
const SECTION_VISIBILITY_FIELD: Partial<Record<LandingPageSectionKey, keyof LandingPageFormValues>> = {
  gallery: "showGallerySection",
  about: "showAboutSection",
  description: "showDescriptionSection",
  reviews: "showReviewsSection",
};

function SortableSectionRow({
  id,
  visible,
  onToggleVisible,
}: {
  id: LandingPageSectionKey;
  visible: boolean | null;
  onToggleVisible: (value: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-xl border bg-background px-4 py-3 ${
        isDragging ? "opacity-60 shadow-lg" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="flex-1 text-sm font-medium">{LANDING_PAGE_SECTION_LABELS[id]}</span>
      {visible === null ? (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground w-28 justify-end pr-1">
          <Lock className="h-3.5 w-3.5" /> Always on
        </span>
      ) : (
        <Select value={visible ? "true" : "false"} onValueChange={(val) => onToggleVisible(val === "true")}>
          <SelectTrigger className="h-9 w-28 rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Show</SelectItem>
            <SelectItem value="false">Hide</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

const getInitialValues = (landingPage?: ILandingPage | null): LandingPageFormValues => ({
  productId: landingPage?.productId || "",
  campaignTitle: landingPage?.campaignTitle || "",
  campaignShortDescription: landingPage?.campaignShortDescription || "",
  regularPriceLabel: landingPage?.regularPriceLabel || "",
  offerPriceLabel: landingPage?.offerPriceLabel || "",
  galleryHeading: landingPage?.galleryHeading || "",
  galleryDescription: landingPage?.galleryDescription || "",
  aboutHeading: landingPage?.aboutHeading || "",
  aboutDescription: landingPage?.aboutDescription || "",
  videoUrl: landingPage?.videoUrl || "",
  descriptionTitle: landingPage?.descriptionTitle || "",
  description: landingPage?.description || "",
  reviewHeading: landingPage?.reviewHeading || "",
  orderFormHeading: landingPage?.orderFormHeading || "Order Now",
  orderButtonText: landingPage?.orderButtonText || "অর্ডার করুন",
  isActive: landingPage?.isActive ?? true,
  themeColor: landingPage?.themeColor || DEFAULT_LANDING_PAGE_THEME,
  showGallerySection: landingPage?.showGallerySection ?? true,
  showAboutSection: landingPage?.showAboutSection ?? true,
  showDescriptionSection: landingPage?.showDescriptionSection ?? true,
  showReviewsSection: landingPage?.showReviewsSection ?? true,
  sectionOrder: resolveSectionOrder(landingPage?.sectionOrder),
});

interface LandingPageFormProps {
  mode: "create" | "edit";
  landingPage?: ILandingPage | null;
}

export default function LandingPageForm({ mode, landingPage }: LandingPageFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<LandingPageFormValues>(
    getInitialValues(landingPage),
  );
  const [isSaving, setIsSaving] = useState(false);

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    landingPage?.bannerImage || null,
  );

  const [galleryExisting, setGalleryExisting] = useState<string[]>(
    landingPage?.galleryImages || [],
  );
  const [galleryNewFiles, setGalleryNewFiles] = useState<File[]>([]);

  const [reviewExisting, setReviewExisting] = useState<string[]>(
    landingPage?.reviewImages || [],
  );
  const [reviewNewFiles, setReviewNewFiles] = useState<File[]>([]);

  const { data: productResponse, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["productsForLandingPage"],
    queryFn: () => getAllProducts({ limit: "200" }),
  });
  const products = productResponse?.data ?? [];

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setValues((prev) => {
      const oldIndex = prev.sectionOrder.indexOf(active.id as LandingPageSectionKey);
      const newIndex = prev.sectionOrder.indexOf(over.id as LandingPageSectionKey);
      return { ...prev, sectionOrder: arrayMove(prev.sectionOrder, oldIndex, newIndex) };
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) setGalleryNewFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const handleReviewAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) setReviewNewFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!values.productId) {
      toast.error("Please select a product");
      return;
    }
    if (!bannerFile && !bannerPreview) {
      toast.error("Please upload a banner image");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      const data = {
        ...values,
        galleryImages: galleryExisting,
        reviewImages: reviewExisting,
      };
      formData.append("data", JSON.stringify(data));
      if (bannerFile) formData.append("bannerImage", bannerFile);
      galleryNewFiles.forEach((file) => formData.append("galleryImages", file));
      reviewNewFiles.forEach((file) => formData.append("reviewImages", file));

      const result =
        mode === "create"
          ? await createLandingPage(formData)
          : await updateLandingPage(landingPage!.id, formData);

      if (!result.success) {
        toast.error(result.message || "Failed to save landing page");
        return;
      }

      toast.success(
        mode === "create"
          ? "Landing page created successfully"
          : "Landing page updated successfully",
      );
      router.push("/admin/dashboard/landing-pages");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-4xl">
      {/* Design */}
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <h4 className="font-semibold">Design</h4>
        </div>

        <div className="space-y-2">
          <Label>Theme Color</Label>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(LANDING_PAGE_THEMES) as LandingPageThemeKey[]).map((key) => {
              const themeOption = LANDING_PAGE_THEMES[key];
              const isSelected = values.themeColor === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setValues((prev) => ({ ...prev, themeColor: key }))}
                  title={themeOption.label}
                  className={`h-10 w-10 rounded-full border-2 transition-all ${
                    isSelected
                      ? "border-foreground scale-110 shadow-md"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: themeOption.primary }}
                >
                  <span className="sr-only">{themeOption.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Section Order</Label>
          <p className="text-xs text-muted-foreground">
            Drag to reorder. These sections appear between the banner and the order form.
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleSectionDragEnd}
          >
            <SortableContext items={values.sectionOrder} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {values.sectionOrder.map((key) => {
                  const visibilityField = SECTION_VISIBILITY_FIELD[key];
                  return (
                    <SortableSectionRow
                      key={key}
                      id={key}
                      visible={visibilityField ? (values[visibilityField] as boolean) : null}
                      onToggleVisible={(value) =>
                        visibilityField &&
                        setValues((prev) => ({ ...prev, [visibilityField]: value }))
                      }
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* Product + Campaign */}
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          <h4 className="font-semibold">Campaign</h4>
        </div>

        <div className="space-y-2">
          <Label>Product</Label>
          <Select
            value={values.productId}
            onValueChange={(val) => setValues((prev) => ({ ...prev, productId: val }))}
          >
            <SelectTrigger className="h-12 rounded-xl">
              <SelectValue
                placeholder={
                  isLoadingProducts ? "Loading products..." : "Select a product"
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {products.map((product: any) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
              {!isLoadingProducts && products.length === 0 && (
                <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                  No products found. Add a product first.
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="campaignTitle">Campaign Title</Label>
            <Input
              id="campaignTitle"
              name="campaignTitle"
              value={values.campaignTitle}
              onChange={handleChange}
              placeholder="Limited Time Offer!"
              className="h-12 rounded-xl"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={values.isActive ? "true" : "false"}
              onValueChange={(val) =>
                setValues((prev) => ({ ...prev, isActive: val === "true" }))
              }
            >
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active (publicly visible)</SelectItem>
                <SelectItem value="false">Inactive (hidden)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SimpleRichTextEditor
          id="campaignShortDescription"
          label="Short Description"
          value={values.campaignShortDescription}
          onChange={(html) =>
            setValues((prev) => ({ ...prev, campaignShortDescription: html }))
          }
          placeholder="A short hook shown right under the campaign title"
          minHeight="60px"
        />

        <div className="space-y-2">
          <Label>Price Highlight Labels (Optional)</Label>
          <p className="text-xs text-muted-foreground">
            Shown next to the prices in the offer section — leave blank to show just the price.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              name="regularPriceLabel"
              value={values.regularPriceLabel}
              onChange={handleChange}
              placeholder="যেমন: পূর্বের মূল্য / Regular Price"
              className="h-12 rounded-xl"
            />
            <Input
              name="offerPriceLabel"
              value={values.offerPriceLabel}
              onChange={handleChange}
              placeholder="যেমন: অফার মূল্য / Offer Price"
              className="h-12 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Banner Image</Label>
          <div className="flex items-center gap-4">
            <div className="relative h-28 w-full max-w-sm overflow-hidden rounded-xl border bg-muted">
              {bannerPreview ? (
                bannerFile ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bannerPreview}
                    alt="Banner"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={bannerPreview}
                    alt="Banner"
                    fill
                    className="object-cover"
                  />
                )
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <ShoppingBag className="size-8 opacity-40" />
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <Upload className="size-6 text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleBannerChange}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Images className="h-5 w-5 text-primary" />
          <h4 className="font-semibold">Gallery (Optional)</h4>
        </div>
        <div className="space-y-2">
          <Label htmlFor="galleryHeading">Gallery Heading</Label>
          <Input
            id="galleryHeading"
            name="galleryHeading"
            value={values.galleryHeading}
            onChange={handleChange}
            className="h-12 rounded-xl"
          />
        </div>
        <SimpleRichTextEditor
          id="galleryDescription"
          label="Gallery Description"
          value={values.galleryDescription}
          onChange={(html) => setValues((prev) => ({ ...prev, galleryDescription: html }))}
          minHeight="60px"
        />

        <ImageBucket
          existing={galleryExisting}
          newFiles={galleryNewFiles}
          onRemoveExisting={(url) =>
            setGalleryExisting((prev) => prev.filter((u) => u !== url))
          }
          onRemoveNew={(idx) =>
            setGalleryNewFiles((prev) => prev.filter((_, i) => i !== idx))
          }
          onAdd={handleGalleryAdd}
          inputId="gallery-images"
        />
      </div>

      {/* About + Video */}
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          <h4 className="font-semibold">About & Video (Optional)</h4>
        </div>
        <div className="space-y-2">
          <Label htmlFor="aboutHeading">About Heading</Label>
          <Input
            id="aboutHeading"
            name="aboutHeading"
            value={values.aboutHeading}
            onChange={handleChange}
            className="h-12 rounded-xl"
          />
        </div>
        <SimpleRichTextEditor
          id="aboutDescription"
          label="About Description"
          value={values.aboutDescription}
          onChange={(html) => setValues((prev) => ({ ...prev, aboutDescription: html }))}
          minHeight="100px"
        />
        <div className="space-y-2">
          <Label htmlFor="videoUrl">Video URL (YouTube or Facebook)</Label>
          <Input
            id="videoUrl"
            name="videoUrl"
            value={values.videoUrl}
            onChange={handleChange}
            placeholder="https://www.youtube.com/watch?v=..."
            className="h-12 rounded-xl"
          />
        </div>
      </div>

      {/* Long description */}
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h4 className="font-semibold">Description Block (Optional)</h4>
        </div>
        <div className="space-y-2">
          <Label htmlFor="descriptionTitle">Description Title</Label>
          <Input
            id="descriptionTitle"
            name="descriptionTitle"
            value={values.descriptionTitle}
            onChange={handleChange}
            className="h-12 rounded-xl"
          />
        </div>
        <SimpleRichTextEditor
          id="description"
          label="Description"
          value={values.description}
          onChange={(html) => setValues((prev) => ({ ...prev, description: html }))}
          minHeight="140px"
        />
      </div>

      {/* Reviews */}
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          <h4 className="font-semibold">Customer Reviews (Optional)</h4>
        </div>
        <div className="space-y-2">
          <Label htmlFor="reviewHeading">Review Section Heading</Label>
          <Input
            id="reviewHeading"
            name="reviewHeading"
            value={values.reviewHeading}
            onChange={handleChange}
            className="h-12 rounded-xl"
          />
        </div>

        <ImageBucket
          existing={reviewExisting}
          newFiles={reviewNewFiles}
          onRemoveExisting={(url) =>
            setReviewExisting((prev) => prev.filter((u) => u !== url))
          }
          onRemoveNew={(idx) =>
            setReviewNewFiles((prev) => prev.filter((_, i) => i !== idx))
          }
          onAdd={handleReviewAdd}
          inputId="review-images"
        />
      </div>

      {/* Order form */}
      <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
        <h4 className="font-semibold">Order Form</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="orderFormHeading">Order Form Heading</Label>
            <Input
              id="orderFormHeading"
              name="orderFormHeading"
              value={values.orderFormHeading}
              onChange={handleChange}
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orderButtonText">Order Button Text</Label>
            <Input
              id="orderButtonText"
              name="orderButtonText"
              value={values.orderButtonText}
              onChange={handleChange}
              className="h-12 rounded-xl"
            />
          </div>
        </div>
      </div>

      <Separator />

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
              {mode === "create" ? "Create Landing Page" : "Save Changes"}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 px-8 rounded-full font-bold"
          onClick={() => router.push("/admin/dashboard/landing-pages")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ImageBucket({
  existing,
  newFiles,
  onRemoveExisting,
  onRemoveNew,
  onAdd,
  inputId,
}: {
  existing: string[];
  newFiles: File[];
  onRemoveExisting: (url: string) => void;
  onRemoveNew: (index: number) => void;
  onAdd: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputId: string;
}) {
  return (
    <div className="space-y-3">
      <label
        htmlFor={inputId}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm upload-btn rounded-xl shadow w-fit"
      >
        <Upload className="size-4" /> Add Images
      </label>
      <input
        id={inputId}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={onAdd}
      />

      {(existing.length > 0 || newFiles.length > 0) && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {existing.map((url) => (
            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
              <Image src={url} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => onRemoveExisting(url)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
          {newFiles.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => onRemoveNew(idx)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
