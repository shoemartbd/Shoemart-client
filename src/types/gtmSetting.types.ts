export interface IGtmSetting {
  id: string;
  isEnabled: boolean;
  containerId: string | null;
  scriptDomain: string | null;
  updatedAt: string;
}

// What the storefront gets: null while tracking is off
export type IPublicGtmSetting = Pick<IGtmSetting, "containerId" | "scriptDomain"> & {
  containerId: string;
};
