import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi, CreateCategoryInput, UpdateCategoryInput, Category } from '../../../api/client';
import { Loader2, Plus, Edit2, Trash2, ChevronDown, ChevronRight, X } from 'lucide-react';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [lang, setLang] = useState<'en' | 'fr'>('en');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const { data: treeData, isLoading } = useQuery({
    queryKey: ['admin', 'categories', 'tree', lang],
    queryFn: async () => {
      const response = await categoryApi.getTree(lang);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryInput) => categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryInput }) =>
      categoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });

  const openModal = (category?: Category) => {
    setEditingCategory(category || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const renderCategory = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedIds.has(category.id);

    return (
      <div key={category.id}>
        <div
          className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg mb-2 hover:bg-gray-50"
          style={{ marginLeft: `${level * 24}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleExpand(category.id)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{category.name}</span>
              <span className="text-xs text-gray-500">/{category.slug}</span>
              {!category.isActive && (
                <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">Inactive</span>
              )}
            </div>
            {category.description && (
              <p className="text-sm text-gray-500 truncate">{category.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal(category)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => {
                if (confirm('Delete this category?')) {
                  deleteMutation.mutate(category.id);
                }
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {category.children!.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
          <p className="text-gray-600">Manage product categories</p>
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
            Add Category
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : treeData?.categories?.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No categories yet. Create your first one!
        </div>
      ) : (
        <div>
          {treeData?.categories?.map(category => renderCategory(category))}
        </div>
      )}

      {isModalOpen && (
        <CategoryModal
          category={editingCategory}
          onClose={closeModal}
          onSubmit={(data) => {
            if (editingCategory) {
              updateMutation.mutate({ id: editingCategory.id, data });
            } else {
              createMutation.mutate(data as CreateCategoryInput);
            }
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}

interface CategoryModalProps {
  category: Category | null;
  onClose: () => void;
  onSubmit: (data: CreateCategoryInput | UpdateCategoryInput) => void;
  isLoading: boolean;
}

function CategoryModal({ category, onClose, onSubmit, isLoading }: CategoryModalProps) {
  const [slug, setSlug] = useState(category?.slug || '');
  const [nameEn, setNameEn] = useState(category?.name || '');
  const [nameFr, setNameFr] = useState('');
  const [descEn, setDescEn] = useState(category?.description || '');
  const [descFr, setDescFr] = useState('');
  const [imageUrl, setImageUrl] = useState(category?.imageUrl || '');
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [order, setOrder] = useState(category?.order || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      slug,
      name: { en: nameEn, fr: nameFr },
      description: { en: descEn, fr: descFr },
      imageUrl: imageUrl || null,
      isActive,
      order,
    };
    onSubmit(data);
  };

  const generateSlug = () => {
    setSlug(nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {category ? 'Edit Category' : 'Add Category'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name (English)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="button"
                onClick={generateSlug}
                className="px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Generate Slug
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name (Français)
            </label>
            <input
              type="text"
              value={nameFr}
              onChange={(e) => setNameFr(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
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
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 size={18} className="animate-spin" />}
              {category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
