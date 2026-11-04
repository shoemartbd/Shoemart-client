export interface IHomePromo {
  id: string;
  tickerText: string | null;
  tickerEnabled: boolean;
  bannerImage: string | null;
  bannerLink: string | null;
  bannerEnabled: boolean;
  productsBannerImage: string | null;
  productsBannerLink: string | null;
  productsBannerEnabled: boolean;
  // Showcase above "All Products": photo | video | photo
  showcaseLeftImage: string | null;
  showcaseLeftLink: string | null;
  showcaseVideo: string | null;
  showcaseVideoLink: string | null;
  showcaseRightImage: string | null;
  showcaseRightLink: string | null;
  showcaseEnabled: boolean;
  updatedAt: string;
}
