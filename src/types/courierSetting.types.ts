export interface ICourierSetting {
  id: string;
  pathaoEnabled: boolean;
  pathaoBaseUrl?: string | null;
  pathaoClientId?: string | null;
  pathaoClientSecret?: string | null;
  pathaoUsername?: string | null;
  pathaoPassword?: string | null;
  pathaoStoreId?: string | null;
  steadfastEnabled: boolean;
  steadfastApiKey?: string | null;
  steadfastSecretKey?: string | null;
  steadfastWebhookAuthToken?: string | null;
  redxEnabled?: boolean;
  redxMode?: "SANDBOX" | "LIVE";
  redxAccessToken?: string | null;
  redxPickupStoreId?: string | null;
  redxWebhookToken?: string | null;
  updatedAt: string;
}
