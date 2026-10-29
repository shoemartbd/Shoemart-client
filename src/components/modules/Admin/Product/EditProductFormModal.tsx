/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { updateProductAction } from "@/app/(dashboardLayout)/admin/dashboard/products/_action";
import AppField from "@/components/shared/form/AppField";
import AppSubmitButton from "@/components/shared/form/AppSubmitButton";
import RichTextEditor from "@/components/shared/form/RichTextEditor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getAllCategories } from "@/services/category.services";
import BrandSelect from "./BrandSelect";
import SizeChartSelect from "./SizeChartSelect";
import HighlightPicker from "./HighlightPicker";
import { PRODUCT_HIGHLIGHTS, ProductHighlight } from "@/lib/productHighlights";
import { getAllAttributes } from "@/services/attribute.services";
import { uploadVariantImage, generateProductSku } from "@/services/product.services";
import { createProductSchema } from "@/zod/product.validation";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, X, Plus, Trash2, Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { IProduct } from "./productColumns";

// cartesian product helper
const cartesian = (...a: any[]): any[] => a.reduce((a, b) => a.flatMap((d: any) => b.map((e: any) => [d, e].flat())));

interface EditProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: IProduct | null;
}

const getInitialValues = (product: IProduct | null) => {
  const p = product as any;
  return {
    name: p?.name || "",
    shortDescription: p?.shortDescription || "",
    description: p?.description || "",
    videoUrl: p?.videoUrl || "",
    sku: p?.sku || "",
    stock: p?.stock || 0,
    purchasePrice: p?.purchasePrice || 0,
    regularPrice: p?.regularPrice || 0,
    sellPrice: p?.sellPrice || 0,
    categoryId: p?.category?.id || "",
    tags: p?.tags ? p.tags.join(", ") : "",
    type: p?.type || "SIMPLE",
    vatType: p?.vatType || "INCLUDED",
    vatPercentage: p?.vatPercentage || 0,
    freeShipping: p?.freeShipping || false,
  };
};

export default function EditProductFormModal({
  open,
  onOpenChange,
  product,
}: EditProductFormModalProps) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Category State
  const [parentCategoryId, setParentCategoryId] = useState<string>("");
  const [brandId, setBrandId] = useState<string>("");
  const [sizeChartId, setSizeChartId] = useState<string>("");
  const [highlights, setHighlights] = useState<ProductHighlight[]>([]);

  // Variant States
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
  const [generatedVariants, setGeneratedVariants] = useState<any[]>([]);

  // SKU generation states
  const [isGeneratingSku, setIsGeneratingSku] = useState(false);
  const [generatingVariantSkuIndex, setGeneratingVariantSkuIndex] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const router = useRouter();

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
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateProductAction(id, formData),
  });

  const form = useForm({
    defaultValues: getInitialValues(product),
    validators: {
      onChange: createProductSchema as any,
    },
    onSubmit: async ({ value }) => {
      if (!product) return;
      if (existingImages.length === 0 && images.length === 0) {
        toast.error("Please provide at least one product image.");
        return;
      }

      const formData = new FormData();

      const tagsArray = value.tags
        ? value.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean)
        : [];

      let payloadData: any = {
        ...value,
        tags: tagsArray,
        videoUrl: value.videoUrl?.trim() || "", // "" clears the video
        categoryId: value.categoryId || parentCategoryId,
        brandId: brandId || null, // null clears the brand
        sizeChartId: sizeChartId || null,
        highlights,
        vatPercentage: Number(value.vatPercentage),
        existingImages,
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

      images.forEach((file) => {
        formData.append("images", file);
      });

      const result = await mutateAsync({ id: product.id, formData });

      if (!result.success) {
        toast.error(result.message || "Failed to update product");
        return;
      }

      // Upload variant images if present
      const resData = (result as any).data;
      if (value.type === "VARIABLE" && resData && resData.variants) {
        const updatedVariants = resData.variants;
        const uploadPromises = generatedVariants.map(async (v) => {
          if (v.image && v.image instanceof File) {
            const matchedVariant = updatedVariants.find((cv: any) => cv.combination === v.combination);
            if (matchedVariant) {
              const varFormData = new FormData();
              varFormData.append("image", v.image);
              return uploadVariantImage(resData.id, matchedVariant.id, varFormData);
            }
          }
        });
        await Promise.all(uploadPromises);
      }

      toast.success(result.message || "Product updated successfully");
      onOpenChange(false);

      void queryClient.invalidateQueries({ queryKey: ["products"] });
      router.refresh();
    },
  });

  useEffect(() => {
    if (open && product) {
      const p = product as any;
      form.reset(getInitialValues(product));
      
      const pCatId = p.category?.parentId || p.category?.id || "";
      setBrandId(p.brandId || p.brand?.id || "");
      setSizeChartId(p.sizeChartId || p.sizeChart?.id || "");
      // Keep only labels the picker still offers
      const known = PRODUCT_HIGHLIGHTS.map((h) => h.value) as string[];
      setHighlights(
        Array.isArray(p.highlights)
          ? p.highlights.filter((h: string) => known.includes(h))
          : [],
      );
      setParentCategoryId(pCatId);
      if (p.category?.parentId) {
        form.setFieldValue("categoryId", p.category.id);
      } else {
        form.setFieldValue("categoryId", "");
      }

      if (p.type === "VARIABLE" && p.attributes && p.variants) {
         const initialAttrs = p.attributes.reduce((acc: any, attr: any) => {
            acc[attr.name] = attr.values;
            return acc;
         }, {});
         setSelectedAttributes(initialAttrs);

         const initialVars = p.variants.map((v: any) => ({
            ...v,
            quantity: v.quantity || v.stock || 0
         }));
         setGeneratedVariants(initialVars);
      } else {
         setSelectedAttributes({});
         setGeneratedVariants([]);
      }

      const timeoutId = setTimeout(() => {
        setExistingImages(product.images || []);
        setPreviews([]);
        setImages([]);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [open, product, form]);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      const totalImages = existingImages.length + images.length + files.length;
      if (totalImages > 5) {
        toast.error("You can have a maximum of 5 images.");
        return;
      }

      setImages((prev) => [...prev, ...files]);

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    },
    [existingImages, images],
  );

  const removeNewImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]);
      return updated;
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
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
    
    const newVariants = combos.map((combo: any) => {
      const comboName = Array.isArray(combo) ? combo.join('-') : combo;
      const existing = generatedVariants.find(v => v.combination === comboName);
      if (existing) return existing;
      
      return {
        combination: comboName,
        sku: "",
        quantity: 0,
        purchasePrice: form.getFieldValue("purchasePrice") || 0,
        regularPrice: form.getFieldValue("regularPrice") || 0,
        sellPrice: form.getFieldValue("sellPrice") || 0,
      };
    });

    setGeneratedVariants(newVariants);
    toast.success(`Generated ${newVariants.length} variants!`);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[95vh] w-[calc(100vw-1.5rem)] sm:max-w-6xl gap-0 overflow-hidden p-0"
        data-lenis-prevent
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader className="border-b px-6 py-5 pr-14">
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update your product details and images.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(95vh-5.5rem)]">
          <div className="px-6 py-5">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <form.Field name="name">
                    {(field) => (
                      <AppField field={field} label="Product Name *" placeholder="Enter product name" />
                    )}
                  </form.Field>
                </div>

                {/* Category, Sub Category and Brand on one row */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <Select value={field.state.value} onValueChange={field.handleChange} disabled>
                          <SelectTrigger className="w-[180px] h-8 bg-background opacity-70">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SIMPLE">Simple product</SelectItem>
                            <SelectItem value="VARIABLE">Variable product</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground ml-2">(Cannot be changed)</p>
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
                      Select multiple images at once. The first image will automatically act as the primary thumbnail.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {/* Existing Images */}
                    {existingImages.map((url, index) => (
                      <div key={`existing-${index}`} className="relative aspect-square rounded-xl overflow-hidden border bg-muted group">
                        <Image src={url} alt={`Existing ${index + 1}`} fill sizes="(max-width: 768px) 50vw, 20vw" className="object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute right-1 top-1 size-6 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeExistingImage(index)}
                        >
                          <X className="size-3" />
                        </Button>
                        {index === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-primary-foreground text-[10px] py-0.5 px-2 text-center font-medium backdrop-blur-md">
                            Thumbnail
                          </div>
                        )}
                      </div>
                    ))}

                    {/* New Images */}
                    {previews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative aspect-square rounded-xl overflow-hidden border bg-muted group">
                        <Image src={preview} alt={`Preview ${index + 1}`} fill sizes="(max-width: 768px) 50vw, 20vw" className="object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute right-1 top-1 size-6 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeNewImage(index)}
                        >
                          <X className="size-3" />
                        </Button>
                        {existingImages.length === 0 && index === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-primary-foreground text-[10px] py-0.5 px-2 text-center font-medium backdrop-blur-md">
                            Thumbnail
                          </div>
                        )}
                      </div>
                    ))}

                    {existingImages.length + images.length < 5 && (
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

              <DialogFooter className="border-t pt-5 mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isPending}>
                    Cancel
                  </Button>
                </DialogClose>
                <AppSubmitButton isPending={isPending} pendingLabel="Saving..." className="w-auto">
                  Save Changes
                </AppSubmitButton>
              </DialogFooter>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
