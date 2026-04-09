import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi, categoryApi, colorApi, CreateProductInput, ProductListItem, Product, Category, Color } from '../../../api/client';
import { Loader2, Plus, Edit2, Trash2, Search, X, Image as ImageIcon, ChevronLeft, ChevronRight, Filter, XCircle } from 'lucide-react';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [lang, setLang] = useState<'en' | 'fr'>('en');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [tagFilter, setTagFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin', 'products', lang, debouncedSearch, categoryFilter, tagFilter, page],
    queryFn: async () => {
      const response = await productApi.getAll({ 
        lang, 
        search: debouncedSearch || undefined,
        categoryId: categoryFilter || undefined,
        tagId: tagFilter ? parseInt(tagFilter) : undefined,
        page,
        limit: 10,
      });
      return response.data;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['admin', 'categories', lang],
    queryFn: async () => {
      const response = await categoryApi.getAll(lang);
      return response.data;
    },
  });

  const { data: colorsData } = useQuery({
    queryKey: ['admin', 'colors', lang],
    queryFn: async () => {
      const response = await colorApi.getAll(lang, true);
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
    },
  });

  const openModal = async (product?: ProductListItem) => {
    if (product) {
      setIsLoadingProduct(true);
      try {
        const response = await productApi.getById(product.id, lang);
        setEditingProduct(response.data);
      } catch {
        alert('Failed to load product details');
        setIsLoadingProduct(false);
        return;
      }
      setIsLoadingProduct(false);
    } else {
      setEditingProduct(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter(null);
    setTagFilter('');
    setPage(1);
  };

  const hasActiveFilters = search || categoryFilter || tagFilter;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-600">Manage your products</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as 'en' | 'fr')}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
          
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${showFilters ? 'bg-blue-50 border-blue-500 text-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            <Filter size={18} />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 text-gray-700 hover:bg-gray-50"
            >
              <XCircle size={18} />
              Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryFilter || ''}
                onChange={(e) => { setCategoryFilter(e.target.value ? parseInt(e.target.value) : null); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categoriesData?.categories?.map((cat: Category) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tag</label>
              <select
                value={tagFilter}
                onChange={(e) => { setTagFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Tags</option>
                <option value="1">Featured</option>
                <option value="2">New</option>
                <option value="3">Sale</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : productsData?.products?.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No products found.
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {productsData?.products?.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <ImageIcon className="text-gray-400" size={20} />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">/{product.slug}</div>
                          {product.categoryNames.length > 0 && (
                            <div className="text-xs text-gray-400 mt-1">
                              {product.categoryNames.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.sku}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {product.discountedPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            ${product.basePrice.toFixed(2)}
                          </span>
                        )}
                        <span className="font-medium text-green-600">
                          ${product.finalPrice.toFixed(2)}
                        </span>
                        {product.discountPercentage && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                            -{product.discountPercentage}%
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openModal(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this product?')) {
                            deleteMutation.mutate(product.id);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {productsData && productsData.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, productsData.total)} of {productsData.total} results
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, productsData.totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (productsData.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= productsData.totalPages - 2) {
                      pageNum = productsData.totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg ${page === pageNum ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(productsData.totalPages, p + 1))}
                  disabled={page === productsData.totalPages}
                  className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categoriesData?.categories || []}
          colors={colorsData?.colors || []}
          isLoading={isLoadingProduct}
          onClose={closeModal}
          onSubmit={async (data) => {
            if (editingProduct) {
              const updateData = {
                slug: data.slug !== editingProduct.slug ? data.slug : undefined,
                name: data.name.en !== editingProduct.name ? { en: data.name.en, fr: data.name.fr } : undefined,
                description: data.description.en !== editingProduct.description ? { en: data.description.en, fr: data.description.fr } : undefined,
                basePrice: data.basePrice !== editingProduct.basePrice ? data.basePrice : undefined,
                discountedPrice: data.discountedPrice !== editingProduct.discountedPrice ? data.discountedPrice : undefined,
                sku: data.sku !== editingProduct.sku ? data.sku : undefined,
                stock: data.stock !== editingProduct.stock ? data.stock : undefined,
                isActive: data.isActive !== editingProduct.isActive ? data.isActive : undefined,
              };

              const originalCategoryIds = editingProduct.categories?.map(c => c.id) || [];
              const originalColorOptions = editingProduct.colors?.map(c => ({ colorId: c.colorId, priceModifier: c.priceModifier })) || [];
              const originalTagNames = editingProduct.tags?.map(t => t.name) || [];

              if (Object.keys(updateData).length > 0) {
                await productApi.update(editingProduct.id, updateData);
              }

              if (JSON.stringify(data.categoryIds) !== JSON.stringify(originalCategoryIds)) {
                await productApi.setCategories(editingProduct.id, data.categoryIds || []);
              }

              if (JSON.stringify(data.colorOptions) !== JSON.stringify(originalColorOptions)) {
                await productApi.setColors(editingProduct.id, data.colorOptions || []);
              }

              if (JSON.stringify(data.tags) !== JSON.stringify(originalTagNames)) {
                await productApi.setTags(editingProduct.id, data.tags || []);
              }

              if (data.images && data.images.length > 0) {
                await productApi.addImages(editingProduct.id, data.images);
              }

              queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
              closeModal();
            } else {
              productApi.create(data).then(() => {
                queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
                closeModal();
              });
            }
          }}
        />
      )}
    </div>
  );
}

interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  colors: Color[];
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductInput) => Promise<void>;
}

function ProductModal({ product, categories, colors, isLoading, onClose, onSubmit }: ProductModalProps) {
  const [slug, setSlug] = useState(product?.slug || '');
  const [nameEn, setNameEn] = useState(product?.name || '');
  const [nameFr, setNameFr] = useState('');
  const [descEn, setDescEn] = useState('');
  const [descFr, setDescFr] = useState('');
  const [basePrice, setBasePrice] = useState(product?.basePrice?.toString() || '');
  const [discountedPrice, setDiscountedPrice] = useState(product?.discountedPrice?.toString() || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [stock, setStock] = useState(product?.stock?.toString() || '0');
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedColors, setSelectedColors] = useState<{ colorId: number; priceModifier: number }[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<{ url: string; altText: string; colorId: number | null; isPrimary: boolean }[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setSlug(product.slug || '');
      setNameEn(product.name || '');
      setDescEn(product.description || '');
      setBasePrice(product.basePrice?.toString() || '');
      setDiscountedPrice(product.discountedPrice?.toString() || '');
      setSku(product.sku || '');
      setStock(product.stock?.toString() || '0');
      setIsActive(product.isActive ?? true);
      setSelectedCategories(product.categories?.map(c => c.id) || []);
      setSelectedColors(product.colors?.map(c => ({ colorId: c.colorId, priceModifier: c.priceModifier })) || []);
      setTags(product.tags?.map(t => t.name) || []);
      setImages(product.images?.map(img => ({
        url: img.url,
        altText: img.altText,
        colorId: img.colorId,
        isPrimary: img.isPrimary,
      })) || []);
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data: CreateProductInput = {
      slug,
      name: { en: nameEn, fr: nameFr },
      description: { en: descEn, fr: descFr },
      basePrice: parseFloat(basePrice),
      discountedPrice: discountedPrice ? parseFloat(discountedPrice) : null,
      sku,
      stock: parseInt(stock) || 0,
      isActive,
      categoryIds: selectedCategories,
      colorOptions: selectedColors,
      tags,
      images: images.filter(img => img.url).map((img, idx) => ({ ...img, isPrimary: idx === 0 })),
    };
    
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateSlug = () => {
    setSlug(nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, { url: newImageUrl, altText: newImageAlt, colorId: null, isPrimary: images.length === 0 }]);
      setNewImageUrl('');
      setNewImageAlt('');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const toggleColor = (colorId: number) => {
    if (selectedColors.find(c => c.colorId === colorId)) {
      setSelectedColors(selectedColors.filter(c => c.colorId !== colorId));
    } else {
      setSelectedColors([...selectedColors, { colorId, priceModifier: 0 }]);
    }
  };

  const toggleCategory = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      {isLoading ? (
        <div className="bg-white rounded-lg w-full max-w-2xl p-12 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : (
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name (English) *
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name (Français) *
              </label>
              <input
                type="text"
                value={nameFr}
                onChange={(e) => setNameFr(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU *
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (English)
            </label>
            <textarea
              value={descEn}
              onChange={(e) => setDescEn(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Français)
            </label>
            <textarea
              value={descFr}
              onChange={(e) => setDescFr(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Price *
              </label>
              <input
                type="number"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discounted Price
              </label>
              <input
                type="number"
                step="0.01"
                value={discountedPrice}
                onChange={(e) => setDiscountedPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock *
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-1 text-sm rounded-full border ${
                    selectedCategories.includes(cat.id)
                      ? 'bg-blue-100 border-blue-500 text-blue-800'
                      : 'bg-gray-50 border-gray-300 text-gray-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Colors
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map(color => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => toggleColor(color.id)}
                  className={`flex items-center gap-2 px-3 py-1 text-sm rounded-full border ${
                    selectedColors.find(c => c.colorId === color.id)
                      ? 'bg-blue-100 border-blue-500 text-blue-800'
                      : 'bg-gray-50 border-gray-300 text-gray-700'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: color.code }}
                  />
                  {color.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter tag name"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-red-600"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Image URL"
              />
              <input
                type="text"
                value={newImageAlt}
                onChange={(e) => setNewImageAlt(e.target.value)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Alt text"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img.url}
                      alt={img.altText}
                      className="w-full h-20 object-cover rounded"
                    />
                    {img.isPrimary && (
                      <span className="absolute top-1 left-1 px-1 text-xs bg-blue-600 text-white rounded">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 size={18} className="animate-spin" />}
              {product ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
      )}
    </div>
  );
}
