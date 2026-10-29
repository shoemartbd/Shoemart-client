// One row per simple product or per variant of a variable product
export interface ILowStockRow {
  key: string;
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  image: string | null;
  sku: string | null;
  combination: string | null;
  category: string | null;
  stock: number;
}

export interface ILowStockData {
  rows: ILowStockRow[];
  counts: { all: number; low: number; out: number };
  threshold: number;
}
