export interface ProductImage {
  id: number;
  productId: number;
  colorId: number | null;
  url: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
  createdAt: Date;
}

export interface UploadedImage {
  url: string;
  altText?: string;
  colorId?: number;
  isPrimary?: boolean;
}
