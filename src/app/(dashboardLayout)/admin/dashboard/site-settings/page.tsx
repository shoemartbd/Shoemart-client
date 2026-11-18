"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck,
  Loader2,
  Save,
  Upload,
  Store,
  Share2,
  PackageX,
  ShoppingBag,
} from "lucide-react";
import {
  getSiteSettings,
  updateSiteSettings,
} from "@/services/siteSetting.services";
import { SiteSettingFormValues } from "@/types/siteSetting.types";
import { getSmsBalance } from "@/services/smsSetting.services";

const initialFormValues: SiteSettingFormValues = {
  siteName: "",
  tagline: "",
  description: "",
  phone: "",
  email: "",
  address: "",
  facebook: "",
  youtube: "",
  instagram: "",
  linkedin: "",
  tiktok: "",
  whatsapp: "",
  copyrightText: "",
  lowStockThreshold: "5",
  guestCheckoutEnabled: true,
  phoneOtpEnabled: false,
};

// Warn when the SMS balance drops under this (taka); each OTP is one SMS
const LOW_SMS_BALANCE = 100;

export default function SiteSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();
  const [formValues, setFormValues] =
    useState<SiteSettingFormValues>(initialFormValues);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  // SMS balance, for the phone OTP switch
  const [smsBalance, setSmsBalance] = useState<
    { ok: true; balance: number } | { ok: false; message: string } | null
  >(null);
  useEffect(() => {
    getSmsBalance()
      .then(setSmsBalance)
      .catch(() => setSmsBalance({ ok: false, message: "Could not read the SMS balance" }));
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await getSiteSettings();
        if (res.data) {
          const {
            siteName,
            tagline,
            description,
            phone,
            email,
            address,
            facebook,
            youtube,
            instagram,
            linkedin,
            tiktok,
            whatsapp,
            copyrightText,
            lowStockThreshold,
            guestCheckoutEnabled,
            phoneOtpEnabled,
            logo,
          } = res.data;
          setFormValues({
            siteName: siteName || "",
            tagline: tagline || "",
            description: description || "",
            phone: phone || "",
            email: email || "",
            address: address || "",
            facebook: facebook || "",
            youtube: youtube || "",
            instagram: instagram || "",
            linkedin: linkedin || "",
            tiktok: tiktok || "",
            whatsapp: whatsapp || "",
            copyrightText: copyrightText || "",
            lowStockThreshold: String(lowStockThreshold ?? 5),
            guestCheckoutEnabled: guestCheckoutEnabled ?? true,
            phoneOtpEnabled: phoneOtpEnabled ?? false,
          });
          setLogoPreview(logo || null);
        }
      } catch (error) {
        toast.error("Failed to load site settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setLogoFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(formValues));
      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const res = await updateSiteSettings(formData);
      if (res.success) {
        toast.success("Site settings updated successfully");
        // Storefront pages in this browser pick up the new OTP / checkout setting
        queryClient.invalidateQueries({ queryKey: ["phone-otp-status"] });
        queryClient.invalidateQueries({ queryKey: ["site-settings"] });
        setLogoFile(null);
      } else {
        toast.error(res.message || "Failed to update site settings");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">Site Settings</h3>
        <p className="text-muted-foreground">
          Manage your store&apos;s branding, description and contact details
          shown across the site (navbar, footer, etc).
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 max-w-3xl mx-auto">
        {/* Branding */}
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Branding</h4>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative size-20 rounded-2xl overflow-hidden border-2 border-primary/20 bg-muted shrink-0">
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt="Logo"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Store className="size-8 opacity-40" />
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <Upload className="size-6 text-white" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              </label>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Store Logo</p>
              <p className="text-xs text-muted-foreground">
                Click the logo to upload a new image. Square images work
                best.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="siteName">Store Name</Label>
              <Input
                id="siteName"
                name="siteName"
                value={formValues.siteName}
                onChange={handleChange}
                placeholder="Shoe Mart"
                className="h-12 rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                name="tagline"
                value={formValues.tagline}
                onChange={handleChange}
                placeholder="E-commerce"
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formValues.description}
              onChange={handleChange}
              placeholder="Your ultimate online shopping destination..."
              rows={3}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="copyrightText">Footer Copyright Text</Label>
            <Input
              id="copyrightText"
              name="copyrightText"
              value={formValues.copyrightText}
              onChange={handleChange}
              placeholder="All rights reserved."
              className="h-12 rounded-xl"
            />
          </div>
        </div>

        {/* Contact */}
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
          <h4 className="font-semibold">Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formValues.phone}
                onChange={handleChange}
                placeholder="+880 1700-000000"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formValues.email}
                onChange={handleChange}
                placeholder="contact@example.com"
                className="h-12 rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formValues.address}
              onChange={handleChange}
              placeholder="Dhaka, Bangladesh"
              className="h-12 rounded-xl"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Social Links</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook URL</Label>
              <Input
                id="facebook"
                name="facebook"
                value={formValues.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/yourpage"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram URL</Label>
              <Input
                id="instagram"
                name="instagram"
                value={formValues.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/yourpage"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube URL</Label>
              <Input
                id="youtube"
                name="youtube"
                value={formValues.youtube}
                onChange={handleChange}
                placeholder="https://youtube.com/@yourchannel"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn URL</Label>
              <Input
                id="linkedin"
                name="linkedin"
                value={formValues.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/yourpage"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok URL</Label>
              <Input
                id="tiktok"
                name="tiktok"
                value={formValues.tiktok}
                onChange={handleChange}
                placeholder="https://tiktok.com/@yourpage"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                value={formValues.whatsapp}
                onChange={handleChange}
                placeholder="+8801700000000"
                className="h-12 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <PackageX className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Inventory</h4>
          </div>
          <div className="space-y-2 max-w-sm">
            <Label htmlFor="lowStockThreshold">Low stock alert at</Label>
            <Input
              id="lowStockThreshold"
              name="lowStockThreshold"
              type="number"
              min={0}
              value={formValues.lowStockThreshold}
              onChange={handleChange}
              placeholder="5"
              className="h-12 rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              A product (or a single size/color) with this many or fewer left
              shows on the Low Stock page and the dashboard.
            </p>
          </div>
        </div>

        {/* Checkout */}
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Checkout</h4>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="guestCheckoutEnabled">Guest checkout</Label>
              <p className="text-xs text-muted-foreground">
                When on, customers can order without logging in, from the
                product page (Buy Now), cart checkout and landing pages. When
                off, they are sent to the login page before ordering.
              </p>
            </div>
            <button
              id="guestCheckoutEnabled"
              type="button"
              role="switch"
              aria-checked={formValues.guestCheckoutEnabled}
              onClick={() =>
                setFormValues((prev) => ({
                  ...prev,
                  guestCheckoutEnabled: !prev.guestCheckoutEnabled,
                }))
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                formValues.guestCheckoutEnabled ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formValues.guestCheckoutEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Phone OTP for guest orders */}
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Label htmlFor="phoneOtpEnabled" className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Verify phone number by SMS code (OTP)
              </Label>
              <p className="text-xs text-muted-foreground">
                Guests (not logged in) must confirm their phone number with a
                6-digit SMS code before placing an order, on checkout and
                landing pages. A confirmed number is remembered on that browser
                for 30 days. If the SMS can&apos;t be sent (no balance, provider
                down), the order still goes through and is marked
                &quot;Phone not verified&quot; in Orders so you can call first.
              </p>
            </div>
            <button
              id="phoneOtpEnabled"
              type="button"
              role="switch"
              aria-checked={formValues.phoneOtpEnabled}
              onClick={() =>
                setFormValues((prev) => ({
                  ...prev,
                  phoneOtpEnabled: !prev.phoneOtpEnabled,
                }))
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                formValues.phoneOtpEnabled ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formValues.phoneOtpEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div
            className={`flex flex-wrap items-center gap-2 rounded-lg px-3 py-2 text-xs ${
              smsBalance === null
                ? "bg-muted text-muted-foreground"
                : smsBalance.ok && smsBalance.balance >= LOW_SMS_BALANCE
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-800 dark:text-amber-300"
            }`}
          >
            {smsBalance === null ? (
              "Checking SMS balance..."
            ) : smsBalance.ok ? (
              <>
                SMS balance: <b>৳{smsBalance.balance.toLocaleString("en-US")}</b>
                {smsBalance.balance < LOW_SMS_BALANCE &&
                  " · Low balance: recharge soon or codes will stop going out"}
              </>
            ) : (
              <>
                SMS not ready: {smsBalance.message}. Set it up in{" "}
                <a href="/admin/dashboard/sms-settings" className="font-semibold underline">
                  SMS Settings
                </a>{" "}
                before turning this on.
              </>
            )}
          </div>
        </div>

        <Separator />

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
              Save Changes
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
