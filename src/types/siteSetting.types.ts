export interface ISiteSetting {
  id: string;
  siteName: string;
  tagline: string | null;
  description: string;
  logo: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  facebook: string | null;
  youtube: string | null;
  instagram: string | null;
  linkedin: string | null;
  tiktok: string | null;
  whatsapp: string | null;
  copyrightText: string;
  lowStockThreshold: number;
  guestCheckoutEnabled: boolean;
  updatedAt: string;
}

export interface SiteSettingFormValues {
  siteName: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  facebook: string;
  youtube: string;
  instagram: string;
  linkedin: string;
  tiktok: string;
  whatsapp: string;
  copyrightText: string;
  lowStockThreshold: string;
  guestCheckoutEnabled: boolean;
}
