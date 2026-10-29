export type SslcommerzMode = "SANDBOX" | "LIVE";
export type GatewayMode = SslcommerzMode;

// Full settings, admin only (includes gateway credentials)
export interface IPaymentSetting {
  id: string;
  codEnabled: boolean;
  sslcommerzEnabled: boolean;
  sslcommerzMode: SslcommerzMode;
  sslcommerzStoreId?: string | null;
  sslcommerzStorePassword?: string | null;
  bkashEnabled: boolean;
  bkashMode: GatewayMode;
  bkashAppKey?: string | null;
  bkashAppSecret?: string | null;
  bkashUsername?: string | null;
  bkashPassword?: string | null;
  updatedAt: string;
}

// What the storefront gets: which methods to offer, no credentials
export interface IPaymentMethods {
  codEnabled: boolean;
  sslcommerzEnabled: boolean;
  bkashEnabled: boolean;
}
