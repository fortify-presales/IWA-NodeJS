export type ApiResponse<T> = {
  status: string;
  message: string;
  data: T;
  timestamp: string;
};

export type Product = {
  id: string;
  code: string;
  name: string;
  summary: string;
  description: string;
  price: number | string;
  salePrice: number | string;
  onSale: boolean;
  image: string | null;
  inStock: boolean;
  rating: number;
  dateCreated: string;
};

export type ProductListData = {
  rows: Product[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
};

export type Review = {
  id: string;
  comment: string;
  rating: number;
  reviewDate: string;
  user?: {
    username: string;
  };
};

export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path, { credentials: 'include' });
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || payload.status === 'error') {
    throw new Error(payload.message || `Request failed: ${response.status}`);
  }
  return payload.data;
}