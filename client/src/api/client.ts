import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';
  is_verified?: boolean;
  created_at?: string;
}

export interface AuthResponse {
  message: string;
  user?: User;
  emailPreviewUrl?: string;
  userId?: number;
  requiresVerification?: boolean;
}

export const authApi = {
  signup: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/signup', { email, password }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  verifyOtp: (email: string, otp: string) =>
    api.post<AuthResponse>('/auth/verify-otp', { email, otp }),

  resendOtp: (email: string) =>
    api.post<AuthResponse & { emailPreviewUrl: string }>('/auth/resend-otp', { email }),

  getMe: () => api.get<User>('/auth/me'),

  logout: () => api.post('/auth/logout'),
};

export const adminApi = {
  getUsers: () => api.get<{ users: User[] }>('/admin/users'),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
};

export interface LocalizedText {
  en: string;
  fr: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  parentId: number | null;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string | null;
  children?: Category[];
}

export interface CategoryTree {
  categories: Category[];
}

export interface Color {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
}

export interface ProductImage {
  id: number;
  url: string;
  altText: string;
  colorId: number | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductColor {
  id: number;
  colorId: number;
  name: string;
  code: string;
  priceModifier: number;
}

export interface ProductTag {
  id: number;
  slug: string;
  name: string;
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  basePrice: number;
  discountedPrice: number | null;
  finalPrice: number;
  discountPercentage: number | null;
  sku: string;
  stock: number;
  isActive: boolean;
  categories: { id: number; name: string }[];
  colors: ProductColor[];
  images: ProductImage[];
  tags: ProductTag[];
  createdAt: string;
  updatedAt: string | null;
}

export interface ProductListItem {
  id: number;
  slug: string;
  name: string;
  basePrice: number;
  discountedPrice: number | null;
  finalPrice: number;
  discountPercentage: number | null;
  sku: string;
  stock: number;
  isActive: boolean;
  imageUrl: string | null;
  categoryNames: string[];
  tagNames: string[];
  createdAt: string;
}

export interface ProductListResponse {
  products: ProductListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCategoryInput {
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  imageUrl?: string | null;
  parentId?: number | null;
  isActive?: boolean;
  order?: number;
}

export interface UpdateCategoryInput {
  slug?: string;
  name?: Partial<LocalizedText>;
  description?: Partial<LocalizedText>;
  imageUrl?: string | null;
  parentId?: number | null;
  isActive?: boolean;
  order?: number;
}

export interface CreateProductInput {
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  basePrice: number;
  discountedPrice?: number | null;
  sku: string;
  stock?: number;
  isActive?: boolean;
  categoryIds?: number[];
  colorOptions?: { colorId: number; priceModifier?: number }[];
  tags?: string[];
  images?: { url: string; altText?: string; colorId?: number | null; isPrimary?: boolean }[];
}

export interface UpdateProductInput {
  slug?: string;
  name?: Partial<LocalizedText>;
  description?: Partial<LocalizedText>;
  basePrice?: number;
  discountedPrice?: number | null;
  sku?: string;
  stock?: number;
  isActive?: boolean;
}

export interface CreateColorInput {
  name: LocalizedText;
  code: string;
  isActive?: boolean;
}

export interface UpdateColorInput {
  name?: Partial<LocalizedText>;
  code?: string;
  isActive?: boolean;
}

export const categoryApi = {
  getAll: (lang = 'en') => api.get<CategoryListResponse>(`/admin/categories?lang=${lang}`),
  getTree: (lang = 'en') => api.get<CategoryTree>(`/admin/categories/tree?lang=${lang}`),
  getById: (id: number, lang = 'en') => api.get<Category>(`/admin/categories/${id}?lang=${lang}`),
  create: (data: CreateCategoryInput) => api.post<Category>('/admin/categories', data),
  update: (id: number, data: UpdateCategoryInput) => api.put<Category>(`/admin/categories/${id}`, data),
  delete: (id: number) => api.delete(`/admin/categories/${id}`),
  reorder: (id: number, order: number) => api.patch(`/admin/categories/${id}/reorder`, { order }),
};

export interface CategoryListResponse {
  categories: Category[];
}

export const productApi = {
  getAll: (params?: { lang?: string; categoryId?: number; tagId?: number; search?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.lang) searchParams.set('lang', params.lang);
    if (params?.categoryId) searchParams.set('categoryId', String(params.categoryId));
    if (params?.tagId) searchParams.set('tagId', String(params.tagId));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    return api.get<ProductListResponse>(`/admin/products?${searchParams.toString()}`);
  },
  getById: (id: number, lang = 'en') => api.get<Product>(`/admin/products/${id}?lang=${lang}`),
  create: (data: CreateProductInput) => api.post<Product>('/admin/products', data),
  update: (id: number, data: UpdateProductInput) => api.put<Product>(`/admin/products/${id}`, data),
  delete: (id: number) => api.delete(`/admin/products/${id}`),
  addImages: (id: number, images: { url: string; altText?: string; colorId?: number | null; isPrimary?: boolean }[]) =>
    api.post<Product>(`/admin/products/${id}/images`, { images }),
  removeImage: (id: number, imageId: number) =>
    api.delete(`/admin/products/${id}/images/${imageId}`),
  setPrimaryImage: (id: number, imageId: number) =>
    api.patch(`/admin/products/${id}/images/${imageId}/primary`),
  setCategories: (id: number, categoryIds: number[]) =>
    api.put<Product>(`/admin/products/${id}/categories`, { categoryIds }),
  setColors: (id: number, colors: { colorId: number; priceModifier?: number }[]) =>
    api.put<Product>(`/admin/products/${id}/colors`, { colors }),
  setTags: (id: number, tags: string[]) =>
    api.put<Product>(`/admin/products/${id}/tags`, { tags }),
};

export const colorApi = {
  getAll: (lang = 'en', activeOnly = false) =>
    api.get<{ colors: Color[] }>(`/admin/colors?lang=${lang}&active=${activeOnly}`),
  create: (data: CreateColorInput) => api.post<Color>('/admin/colors', data),
  update: (id: number, data: UpdateColorInput) => api.put<Color>(`/admin/colors/${id}`, data),
  delete: (id: number) => api.delete(`/admin/colors/${id}`),
};

export default api;
