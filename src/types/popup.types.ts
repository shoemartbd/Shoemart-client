export interface IPopup {
  id: string;
  title: string | null;
  image: string;
  link: string | null;
  delaySeconds: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// What the storefront gets from /popups/active
export type IActivePopup = Pick<
  IPopup,
  "id" | "image" | "link" | "delaySeconds" | "updatedAt"
>;
