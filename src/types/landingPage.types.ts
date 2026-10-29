import { IProduct } from "@/components/modules/Admin/Product/productColumns";
import { LandingPageSectionKey } from "@/lib/landingPageSections";

export interface ILandingPage {
  id: string;
  slug: string;
  isActive: boolean;

  productId: string;
  product: IProduct;
  shopId: string;

  campaignTitle: string;
  campaignShortDescription: string | null;
  bannerImage: string | null;

  regularPriceLabel: string | null;
  offerPriceLabel: string | null;

  galleryHeading: string | null;
  galleryDescription: string | null;
  galleryImages: string[];

  aboutHeading: string | null;
  aboutDescription: string | null;
  videoUrl: string | null;

  descriptionTitle: string | null;
  description: string | null;

  reviewHeading: string | null;
  reviewImages: string[];

  orderFormHeading: string;
  orderButtonText: string;

  themeColor: string;
  showGallerySection: boolean;
  showAboutSection: boolean;
  showDescriptionSection: boolean;
  showReviewsSection: boolean;
  sectionOrder: LandingPageSectionKey[];

  views: number;

  createdAt: string;
  updatedAt: string;
}

export interface LandingPageFormValues {
  productId: string;
  campaignTitle: string;
  campaignShortDescription: string;
  regularPriceLabel: string;
  offerPriceLabel: string;
  galleryHeading: string;
  galleryDescription: string;
  aboutHeading: string;
  aboutDescription: string;
  videoUrl: string;
  descriptionTitle: string;
  description: string;
  reviewHeading: string;
  orderFormHeading: string;
  orderButtonText: string;
  isActive: boolean;

  themeColor: string;
  showGallerySection: boolean;
  showAboutSection: boolean;
  showDescriptionSection: boolean;
  showReviewsSection: boolean;
  sectionOrder: LandingPageSectionKey[];
}
