export interface ISmsSetting {
  id: string;
  enabled: boolean;
  apiKey?: string | null;
  senderId?: string | null;
  updatedAt: string;
}
