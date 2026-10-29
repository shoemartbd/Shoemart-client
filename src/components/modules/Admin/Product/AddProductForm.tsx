/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Upload, X, Loader2, Sparkles, Plus, Trash2, Check, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { createProduct, generateProductSku } from "@/services/product.services";
import { getAllCategories } from "@/services/category.services";
import BrandSelect from "./BrandSelect";
import SizeChartSelect from "./SizeChartSelect";
import HighlightPicker from "./HighlightPicker";
import { ProductHighlight } from "@/lib/productHighlights";
import { createProductSchema } from "@/zod/product.validation";
import AppField from "@/components/shared/form/AppField";
import RichTextEditor from "@/components/shared/form/RichTextEditor";
import { generateAIProductData } from "@/services/ai.services";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAllAttributes } from "@/services/attribute.services";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

// Upload variant image via Next.js API proxy route.
// Using a proxy avoids the "secure cookie not sent over HTTP" issue in development:
// the API route runs server-side, reads the httpOnly cookies, and forwards them to the backend.
async function uploadVariantImageClient(
  productId: string,
  variantId: string,
  imageFile: File
): Promise<{ success: boolean; message?: string }> {
  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    // Call the Next.js API route (same-origin → cookies sent automatically)
    const res = await fetch(`/api/variant-image/${productId}/${variantId}`, {
      method: "PATCH",
      body: formData,
    });
    const result = await res.json();
    console.log(`[VariantImageUpload] variant ${variantId}:`, result);
    if (!res.ok) return { success: false, message: result.message };
    return { success: true };
  } catch (err) {
    console.error(`[VariantImageUpload] Error for variant ${variantId}:`, err);
    return { success: false, message: "Network error" };
  }
}


const cartesian = (...a: any[]): any[] =>
  a.reduce((a, b) => a.flatMap((d: any) => b.map((e: any) => [d, e].flat())));

export default function AddProductForm() {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingSku, setIsGeneratingSku] = useState(false);
  const [generatingVariantSkuIndex, setGeneratingVariantSkuIndex] = useState<number | null>(null);

  // Category State
  const [parentCategoryId, setParentCategoryId] = useState<string>("");
  const [brandId, setBrandId] = useState<string>("");
  const [sizeChartId, setSizeChartId] = useState<string>("");
  const [highlights, setHighlights] = useState<ProductHighlight[]>([]);

  // Variant States
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
  const [generatedVariants, setGeneratedVariants] = useState<any[]>([]);

  const { data: categoryResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getAllCategories(),
  });
  const allCategories = categoryResponse?.data || [];
  const parentCategories = allCategories.filter((c: any) => !c.parentId);
  const childCategories = parentCategoryId
    ? allCategories.filter((c: any) => c.parentId === parentCategoryId)
    : [];

  const { data: attrResponse } = useQuery({
    queryKey: ["attributes"],
    queryFn: () => getAllAttributes(),
  });
  const dbAttributes = attrResponse?.data || [];

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createProduct,
  });

  const form = useForm({
    defaultValues: {
      name: "",
      shortDescription: "",
      description: "",
      videoUrl: "",
      sku: "",
      stock: 0,
      purchasePrice: 0,
      regularPrice: 0,
      sellPrice: 0,
      categoryId: "",
      tags: "",
      type: "SIMPLE",
      vatType: "INCLUDED",
      vatPercentage: 0,
      freeShipping: false,
    },
    validators: {
      onChange: createProductSchema as any,
    },
    onSubmit: async ({ value }) => {
      if (images.length === 0) {
        toast.error("Please upload at least one product image.");
        return;
      }

      if (!value.categoryId && !parentCategoryId) {
         toast.error("Category is required");
         return;
      }

      const formData = new FormData();

      const tagsArray = value.tags
        ? value.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];

      let payloadData: any = {
        ...value,
        tags: tagsArray,
        videoUrl: value.videoUrl?.trim() || undefined,
        categoryId: value.categoryId || parentCategoryId, 
        ...(brandId && { brandId }),
        ...(sizeChartId && { sizeChartId }),
        highlights,
        vatPercentage: Number(value.vatPercentage),
      };

      if (value.type === "VARIABLE") {
        if (generatedVariants.length === 0) {
          toast.error("Please generate at least one variant.");
          return;
        }
        payloadData.stock = generatedVariants.reduce((sum, v) => sum + Number(v.quantity), 0);
        payloadData.purchasePrice = Number(generatedVariants[0].purchasePrice);
        payloadData.regularPrice = Number(generatedVariants[0].regularPrice);
        payloadData.sellPrice = Number(generatedVariants[0].sellPrice);

        payloadData.attributes = Object.entries(selectedAttributes).map(([name, values]) => ({
          name,
          values
        }));

        // SKU lives per-variant for variable products
        payloadData.sku = undefined;
        payloadData.variants = generatedVariants.map(v => ({
          combination: v.combination,
          sku: v.sku ? v.sku.trim() : undefined,
          quantity: Number(v.quantity),
          purchasePrice: Number(v.purchasePrice),
          regularPrice: Number(v.regularPrice),
          sellPrice: Number(v.sellPrice),
        }));
      } else {
        payloadData.stock = Number(value.stock);
        payloadData.purchasePrice = Number(value.purchasePrice);
        payloadData.regularPrice = Number(value.regularPrice);
        payloadData.sellPrice = Number(value.sellPrice);
        payloadData.sku = value.sku ? value.sku.trim() : undefined;
      }

      formData.append("data", JSON.stringify(payloadData));
      images.forEach((file) => formData.append("images", file));

      // Note: Variant images are skipped here as backend expects separate upload 
      // per variant via uploadVariantImage. We could queue those up if needed.

      const result = await mutateAsync(formData);

      if (!result.success) {
        toast.error(result.message || "Failed to create product");
        return;
      }

      // Upload variant images if present
      if (value.type === "VARIABLE" && result.data && result.data.variants) {
        const createdVariants = result.data.variants;
        console.log("[AddProductForm] Created variants:", createdVariants);
        console.log("[AddProductForm] Local variants with images:", generatedVariants.map((v: any) => ({ combination: v.combination, hasImage: !!v.image })));

        const uploadPromises = generatedVariants.map(async (v: any) => {
          if (v.image && v.image instanceof File) {
            const matchedVariant = createdVariants.find(
              (cv: any) => cv.combination.toLowerCase().trim() === v.combination.toLowerCase().trim()
            );
            if (matchedVariant) {
              console.log(`[AddProductForm] Uploading image for variant: ${v.combination} (id: ${matchedVariant.id})`);
              const uploadResult = await uploadVariantImageClient(result.data.id, matchedVariant.id, v.image);
              if (!uploadResult.success) {
                console.error(`[AddProductForm] Failed to upload image for ${v.combination}:`, uploadResult.message);
              }
              return uploadResult;
            } else {
              console.warn(`[AddProductForm] No matching created variant found for: ${v.combination}`);
            }
          }
        });
        const uploadResults = await Promise.all(uploadPromises);
        const failedCount = uploadResults.filter((r: any) => r && !r.success).length;
        if (failedCount > 0) {
          toast.warning(`${failedCount} variant image(s) failed to upload. Product saved.`);
        }
      }

      toast.success("Product created successfully!");
      router.push("/admin/dashboard/products");
      router.refresh();
    },
  });

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      if (images.length + files.length > 5) {
        toast.error("You can upload a maximum of 5 images.");
        return;
      }

      setImages((prev) => [...prev, ...files]);

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    },
    [images],
  );

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]);
      return updated;
    });
  };

  const handleAIGenerate = async () => {
    const title = form.getFieldValue("name");
    if (!title) {
      toast.error("Please enter a product name first");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generateAIProductData(title);
      if (res.success) {
        form.setFieldValue("description", res.data.description);
        form.setFieldValue("shortDescription", res.data.shortDescription);
        form.setFieldValue("tags", res.data.tags.join(", "));
        toast.success("AI Content generated successfully!");
      } else {
        toast.error(res.message || "Failed to generate AI content");
      }
    } catch (error) {
      toast.error("An unexpected error occurred during AI generation");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSku = async () => {
    setIsGeneratingSku(true);
    try {
      const res = await generateProductSku();
      if (res.success) {
        form.setFieldValue("sku", res.data.sku);
      } else {
        toast.error(res.message || "Failed to generate SKU");
      }
    } finally {
      setIsGeneratingSku(false);
    }
  };

  const handleGenerateVariantSku = async (index: number) => {
    setGeneratingVariantSkuIndex(index);
    try {
      const res = await generateProductSku();
      if (res.success) {
        updateVariant(index, "sku", res.data.sku);
      } else {
        toast.error(res.message || "Failed to generate SKU");
      }
    } finally {
      setGeneratingVariantSkuIndex(null);
    }
  };

  const toggleAttributeValue = (attrName: string, value: string) => {
    setSelectedAttributes(prev => {
      const current = prev[attrName] || [];
      if (current.includes(value)) {
        const next = current.filter(v => v !== value);
        if (next.length === 0) {
          const copy = { ...prev };
          delete copy[attrName];
          return copy;
        }
        return { ...prev, [attrName]: next };
      } else {
        return { ...prev, [attrName]: [...current, value] };
      }
    });
  };

  const generateVariants = () => {
    const keys = Object.keys(selectedAttributes);
    if (keys.length === 0) {
      toast.error("Please select at least one attribute value to generate variations.");
      return;
    }

    const attrArrays = keys.map(k => selectedAttributes[k]);
    const combos = attrArrays.length === 1 ? attrArrays[0].map(v => [v]) : cartesian(...attrArrays);
    
    const newVariants = combos.map((combo: any) => ({
      combination: Array.isArray(combo) ? combo.join('-') : combo,
      sku: "",
      quantity: 0,
      purchasePrice: form.getFieldValue("purchasePrice") || 0,
      regularPrice: form.getFieldValue("regularPrice") || 0,
      sellPrice: form.getFieldValue("sellPrice") || 0,
    }));

    setGeneratedVariants(newVariants);
    toast.success(`Generated ${newVariants.length} variations!`);
  };

  const updateVariant = (index: number, key: string, value: any) => {
    const updated = [...generatedVariants];
    updated[index][key] = value;
    setGeneratedVariants(updated);
  };

  const applyBasePricesToAll = () => {
    const pPrice = form.getFieldValue("purchasePrice");
    const rPrice = form.getFieldValue("regularPrice");
    const sPrice = form.getFieldValue("sellPrice");

    if (generatedVariants.length === 0) return;

    setGeneratedVariants(prev => prev.map(v => ({
      ...v,
      purchasePrice: pPrice,
      regularPrice: rPrice,
      sellPrice: sPrice,
    })));
    toast.success("Applied base prices to all variations!");
  };

  return (
    <Card className="max-w-6xl mx-auto border-none shadow-xl bg-card/50 backdrop-blur-sm mb-10">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Add New Product</CardTitle>
        <CardDescription>
          Fill in the details below to add a new product to the store.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Product Name *</Label>
                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1 h-6 rounded-full text-[9px] uppercase tracking-tight font-black bg-gradient-to-r from-[#111111] via-[#404040] to-[#d7141f] text-white hover:opacity-90 transition-all shadow-[0_0_12px_rgba(215,119,9,0.35)] overflow-hidden relative disabled:opacity-70"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shine_3s_infinite]" />
                  {isGenerating ? (
                    <Loader2 className="size-2.5 animate-spin" />
                  ) : (
                    <Sparkles className="size-2.5 fill-current" />
                  )}
                  {isGenerating ? "Generating..." : "Generate With AI"}
                </button>
              </div>
              <form.Field name="name">
                {(field) => (
                  <AppField field={field} label="" placeholder="Enter product name" />
                )}
              </form.Field>
            </div>

            {/* Category, Sub Category and Brand on one row */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Parent Category */}
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={parentCategoryId} onValueChange={setParentCategoryId}>
                  <SelectTrigger className="w-full bg-background/50 focus-visible:ring-primary/20">
                    <SelectValue placeholder="Select Parent Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentCategories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Child Category */}
              <form.Field name="categoryId">
                {(field) => (
                  <div className="space-y-2">
                    <Label>Sub Category {childCategories.length > 0 ? "*" : "(Optional)"}</Label>
                    <Select
                      value={field.state.value}
                      onValueChange={field.handleChange}
                      disabled={childCategories.length === 0}
                    >
                      <SelectTrigger className="w-full bg-background/50 focus-visible:ring-primary/20">
                        <SelectValue placeholder={childCategories.length > 0 ? "Select Sub Category" : "No Sub Categories"} />
                      </SelectTrigger>
                      <SelectContent>
                        {childCategories.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {field.state.meta.errors && field.state.meta.isTouched && (
                      <p className="text-sm text-destructive mt-1">
                        {field.state.meta.errors.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              {/* Brand */}
              <BrandSelect value={brandId} onChange={setBrandId} />
            </div>

            <div className="md:col-span-2">
              <form.Field name="shortDescription">
                {(field) => (
                  <RichTextEditor
                    field={field}
                    label="Short Description *"
                    placeholder="Brief summary of the product"
                    minHeight="90px"
                  />
                )}
              </form.Field>
            </div>

            <div className="md:col-span-2">
              <form.Field name="description">
                {(field) => (
                  <RichTextEditor
                    field={field}
                    label="Full Description *"
                    placeholder="Detailed description of your product..."
                    minHeight="180px"
                  />
                )}
              </form.Field>
            </div>

            <div className="md:col-span-2">
              <form.Field name="videoUrl">
                {(field) => (
                  <AppField
                    field={field}
                    label="Product Video Link (Optional)"
                    placeholder="YouTube or Facebook video link, e.g. https://youtu.be/xxxx"
                  />
                )}
              </form.Field>
            </div>

            <div className="md:col-span-2">
              <form.Field name="tags">
                {(field) => (
                  <AppField field={field} label="Tags (Optional)" placeholder="Comma separated tags e.g. electronics, laptop, new" />
                )}
              </form.Field>
            </div>

            {/* Product Data Section */}
            <div className="md:col-span-2 border rounded-md bg-card">
              <form.Field name="type">
                {(field) => (
                  <div className="border-b px-4 py-3 flex items-center gap-2 bg-muted/20">
                    <Label className="text-base font-semibold whitespace-nowrap">Product data —</Label>
                    <Select value={field.state.value} onValueChange={field.handleChange}>
                      <SelectTrigger className="w-[180px] h-8 bg-background">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SIMPLE">Simple product</SelectItem>
                        <SelectItem value="VARIABLE">Variable product</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </form.Field>

              <div className="p-4 space-y-6">
                {/* Pricing Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <form.Field name="purchasePrice">
                    {(field) => <AppField field={field} type="number" label="Purchase price (BDT)" placeholder="0.00" />}
                  </form.Field>
                  <form.Field name="regularPrice">
                    {(field) => <AppField field={field} type="number" label="Regular price (BDT)" placeholder="0.00" />}
                  </form.Field>
                  <form.Field name="sellPrice">
                    {(field) => <AppField field={field} type="number" label="Sale price (BDT)" placeholder="0.00" />}
                  </form.Field>
                </div>

                {/* Extras Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  <SizeChartSelect value={sizeChartId} onChange={setSizeChartId} />
                  
                  <div className="space-y-2 flex flex-col justify-end">
                    <Label>Vat (%)</Label>
                    <div className="flex">
                      <form.Field name="vatType">
                        {(field) => (
                          <Select value={field.state.value} onValueChange={field.handleChange}>
                            <SelectTrigger className="bg-background rounded-r-none w-28">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="INCLUDED">Included</SelectItem>
                              <SelectItem value="EXCLUDED">Excluded</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </form.Field>
                      <form.Field name="vatPercentage">
                        {(field) => (
                          <Input
                            type="number"
                            className="rounded-l-none border-l-0"
                            placeholder="0"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(Number(e.target.value))}
                          />
                        )}
                      </form.Field>
                    </div>
                  </div>

                  <form.Field name="freeShipping">
                    {(field) => (
                      <div className="space-y-2">
                        <Label>Free Shipping</Label>
                        <Select value={field.state.value ? "enabled" : "disabled"} onValueChange={(v) => field.handleChange(v === "enabled")}>
                          <SelectTrigger className="bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="disabled">Disabled</SelectItem>
                            <SelectItem value="enabled">Enabled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.Field>
                </div>

                {/* Homepage highlights */}
                <HighlightPicker value={highlights} onChange={setHighlights} />

                <form.Subscribe selector={(state) => state.values.type}>
                  {(type) => type === "SIMPLE" ? (
                    /* Simple Product - Quantity & SKU/Barcode */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-xl">
                      <form.Field name="stock">
                        {(field) => <AppField field={field} type="number" label="Quantity" placeholder="0" />}
                      </form.Field>
                      <form.Field name="sku">
                        {(field) => (
                          <div className="space-y-1.5">
                            <Label htmlFor={field.name}>SKU / Barcode</Label>
                            <div className="flex gap-2">
                              <Input
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                placeholder="Type manually or generate"
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="shrink-0"
                                disabled={isGeneratingSku}
                                onClick={handleGenerateSku}
                              >
                                {isGeneratingSku ? (
                                  <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                  <RefreshCw className="size-3.5" />
                                )}
                                Generate
                              </Button>
                            </div>
                          </div>
                        )}
                      </form.Field>
                    </div>
                  ) : (
                    /* Variable Product - Attributes & Variations */
                    <div className="mt-8 border rounded bg-background">
                      <div className="px-4 py-2 bg-muted/50 font-semibold border-b text-sm">
                        Attributes & Variations
                      </div>
                      
                      <div className="p-4 space-y-6">
                        <div className="space-y-4">
                          <Label className="text-muted-foreground text-sm">Select Attributes:</Label>
                          {dbAttributes.map((attr: any) => (
                            <div key={attr.id} className="grid grid-cols-[100px_1fr] items-start gap-4">
                              <span className="text-sm font-semibold pt-1">{attr.name}</span>
                              <div className="flex flex-wrap gap-2">
                                {attr.values.map((val: any) => {
                                  const isSelected = selectedAttributes[attr.name]?.includes(val.value);
                                  return (
                                    <Badge
                                      key={val.id}
                                      variant={isSelected ? "default" : "outline"}
                                      className="cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white border-0 transition-colors"
                                      onClick={() => toggleAttributeValue(attr.name, val.value)}
                                    >
                                      {val.value}
                                      {isSelected && <X className="size-3 ml-1" />}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="bg-[#17a2b8] text-white p-3 rounded-sm text-sm font-medium">
                          Preview: {
                             Object.values(selectedAttributes).length > 0 
                               ? Object.values(selectedAttributes).reduce((acc: number, curr) => acc * curr.length, 1)
                               : 0
                          } variations will be generated
                        </div>

                        <Button type="button" onClick={generateVariants} className="bg-emerald-500 hover:bg-emerald-600">
                          Generate Variations
                        </Button>
                      </div>

                      {generatedVariants.length > 0 && (
                        <div className="p-4 border-t space-y-4 bg-muted/10">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Manage Variations:</span>
                            <Button type="button" variant="secondary" size="sm" onClick={applyBasePricesToAll} className="text-xs bg-slate-600 text-white hover:bg-slate-700">
                              Apply Base Prices to All
                            </Button>
                          </div>

                          <div className="border rounded-sm bg-background overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-muted/50 border-b">
                                <tr>
                                  <th className="text-left p-2 font-medium">Variation</th>
                                  <th className="text-left p-2 font-medium w-36">SKU / Barcode</th>
                                  <th className="text-left p-2 font-medium w-24">Quantity</th>
                                  <th className="text-left p-2 font-medium w-32">Purchase Price</th>
                                  <th className="text-left p-2 font-medium w-32">Regular Price</th>
                                  <th className="text-left p-2 font-medium w-32">Sale Price</th>
                                  <th className="text-left p-2 font-medium">Image</th>
                                  <th className="text-left p-2 font-medium w-20">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {generatedVariants.map((variant, index) => (
                                  <tr key={index} className="group hover:bg-muted/30">
                                    <td className="p-2 font-medium">{variant.combination}</td>
                                    <td className="p-2">
                                      <div className="flex items-center gap-1">
                                        <Input
                                          className="h-8"
                                          placeholder="Manual or generate"
                                          value={variant.sku || ""}
                                          onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                        />
                                        <Button
                                          type="button"
                                          size="icon"
                                          variant="secondary"
                                          className="h-8 w-8 shrink-0"
                                          disabled={generatingVariantSkuIndex === index}
                                          onClick={() => handleGenerateVariantSku(index)}
                                        >
                                          {generatingVariantSkuIndex === index ? (
                                            <Loader2 className="size-3 animate-spin" />
                                          ) : (
                                            <RefreshCw className="size-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </td>
                                    <td className="p-2">
                                      <Input type="number" className="h-8" value={variant.quantity} onChange={(e) => updateVariant(index, 'quantity', e.target.value)} />
                                    </td>
                                    <td className="p-2">
                                      <Input type="number" className="h-8" value={variant.purchasePrice} onChange={(e) => updateVariant(index, 'purchasePrice', e.target.value)} />
                                    </td>
                                    <td className="p-2">
                                      <Input type="number" className="h-8" value={variant.regularPrice} onChange={(e) => updateVariant(index, 'regularPrice', e.target.value)} />
                                    </td>
                                    <td className="p-2">
                                      <Input type="number" className="h-8" value={variant.sellPrice} onChange={(e) => updateVariant(index, 'sellPrice', e.target.value)} />
                                    </td>
                                    <td className="p-2">
                                      <div className="flex items-center border rounded h-8 overflow-hidden bg-background">
                                        <label className="upload-btn px-2 py-1 h-full flex items-center cursor-pointer text-xs whitespace-nowrap">
                                          Choose File
                                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) updateVariant(index, 'image', file);
                                          }} />
                                        </label>
                                        <span className="px-2 text-xs text-muted-foreground truncate w-24">
                                          {variant.image 
                                            ? (variant.image instanceof File ? variant.image.name : "Existing Image") 
                                            : "No file chosen"}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="p-2">
                                      <Button 
                                        type="button" 
                                        variant="destructive" 
                                        size="sm" 
                                        className="h-8 w-full bg-red-500 hover:bg-red-600 text-white"
                                        onClick={() => {
                                          const copy = [...generatedVariants];
                                          copy.splice(index, 1);
                                          setGeneratedVariants(copy);
                                        }}
                                      >
                                        Remove
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </form.Subscribe>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4 pt-4 border-t">
              <div>
                <Label className="text-base font-semibold">Product Images *</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Select multiple images at once. The first selected image will automatically act as the primary thumbnail.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden border bg-muted group">
                    <Image src={preview} alt={`Preview ${index + 1}`} fill className="object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-1 top-1 size-6 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="size-3" />
                    </Button>
                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-[10px] py-1 px-2 text-center font-bold tracking-wider uppercase">
                        Primary Thumbnail
                      </div>
                    )}
                  </div>
                ))}

                {images.length < 5 && (
                  <label className="relative aspect-square rounded-xl upload-zone flex flex-col items-center justify-center gap-2 cursor-pointer group">
                    <div className="upload-icon p-3">
                      <Upload className="h-6 w-6" />
                    </div>
                    <span className="text-xs font-semibold text-primary">Select Images</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
              Cancel
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isPending || isSubmitting} className="min-w-[120px]">
                  {isPending || isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving</>
                  ) : "Publish Product"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
