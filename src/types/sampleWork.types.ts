export interface ISampleWork {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileSize: number | null;
  publicId?: string | null;
  order?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface ISampleWorkPayload {
  title: string;
  description?: string | null;
  fileUrl: string;
  publicId?: string | null;
  fileSize?: number | null;
  isActive?: boolean;
}
