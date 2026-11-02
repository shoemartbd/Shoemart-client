export interface IStore {
  id: string;
  name: string;
  city: string;
  address: string;
  openingHours: string | null;
  image: string | null;
  mapEmbedUrl: string | null;
  directionUrl: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
