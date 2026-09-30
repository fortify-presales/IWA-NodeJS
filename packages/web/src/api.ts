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
  category: string;
  subcategory: string;
  brand: string;
  activeIngredient: string | null;
  strength: string | null;
  form: string;
  quantity: number;
  onPrescription: boolean;
  pharmacyOnly: boolean;
  controlledMedicine: boolean;
  requiresConsultation: boolean;
  minimumAge: number;
  suitableForChildren: boolean;
  symptomsTreated: string[];
  commonUses: string[];
  keywords: string[];
  stockLevel: number;
  featured: boolean;
  bestseller: boolean;
  alternativeProducts: string[];
  relatedProducts: string[];
  summary: string;
  description: string;
  warning: string | null;
  usageNotes: string | null;
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