'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Category } from '@/lib/types';

interface ArticlesFormProps {
  categories: Category[];
  mode: 'new' | 'edit';
  initial?: any;
  id?: string;
}

export default function ArticlesForm({ categories, mode, initial, id }: ArticlesFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    title: initial?.title || '',
    slug: initial?.slug || '',
    excerpt: initial?.excerpt || '',
    content: initial?.content || '',
    coverImageUrl: initial?.cover_image_url || '',
    categoryId: initial?.category_id || '',
    pointCost: initial?.point_cost || 15,
    isFree: initial?.is_free || false,
    isFeatured: initial?.is_featured || false,
    status: initial?.status || 'draft',
    tags: Array.isArray(initial?.tags) ? initial.tags.join(', ') : '',
    metaTitle: initial?.meta_title || '',
    metaDescription: initial?.meta_description || '',
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (mode === 'new' && form.title && !form.slug) {
      const slug = form.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setForm(prev => ({ ...prev, slug }));
    }
  }, [form.title, mode]);

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', credentials: 'include', body: fd });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Upload failed');
      }
      const data = await res.json();
      setForm(prev => ({ ...prev, coverImageUrl: data.url }));
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      coverImageUrl: form.coverImageUrl || null,
      categoryId: form.categoryId || null,
      pointCost: parseInt(form.pointCost as any) || 15,
      isFree: form.isFree,
      isFeatured: form.isFeatured,
      status: form.status,
      tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      metaTitle: form.metaTitle || null,
      metaDescription: form.metaDescription || null,
    };

    try {
      const url = mode === 'new' 
        ? '/api/admin/articles' 
        : `/api/admin/articles/${id}`;
      
      const res = await fetch(url, {
        method: mode === 'new' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to save article');
      }

      router.push('/admin/articles');
    } catch (err: any) {
      setError(err.message || 'Failed to save article');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-[#E74C3C] rounded-lg text-[#E74C3C]">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-[#E8E4DF] p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#1A1A2E] mb-4">Basic Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
              Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:ring-2 focus:ring-[#C0392B] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:ring-2 focus:ring-[#C0392B] focus:border-transparent font-mono text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
              Excerpt *
            </label>
            <textarea
              value={form.excerpt}
              onChange={(e) => handleChange('excerpt', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:ring-2 focus:ring-[#C0392B] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
              Content (HTML supported) *
            </label>
            <textarea
              value={form.content}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={15}
              className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:ring-2 focus:ring-[#C0392B] focus:border-transparent font-mono text-sm"
              required
            />
            <p className="mt-1 text-xs text-[#6B7280]">HTML supported</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
              Cover Image
            </label>
            <input
              type="url"
              value={form.coverImageUrl}
              onChange={(e) => handleChange('coverImageUrl', e.target.value)}
              className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:ring-2 focus:ring-[#C0392B] focus:border-transparent"
              placeholder="https://... or upload below"
            />
            <div className="mt-3 flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                disabled={uploading}
                className="block text-sm text-[#6B7280] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#1A1A2E] file:text-white file:cursor-pointer"
              />
              {uploading && <span className="text-sm text-[#6B7280]">Uploading...</span>}
            </div>
            {form.coverImageUrl && (
              <img
                src={form.coverImageUrl}
                alt="Cover preview"
                className="mt-3 w-48 h-28 object-cover rounded-lg border border-[#E8E4DF]"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
              Category
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
              className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:ring-2 focus:ring-[#C0392B] focus:border-transparent"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:ring-2 focus:ring-[#C0392B] focus:border-transparent"
              placeholder="tag1, tag2, tag3"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8E4DF] p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#1A1A2E] mb-4">Pricing & Settings</h2>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
              Point Cost
            </label>
            <input
              type="number"
              value={form.pointCost}
              onChange={(e) => handleChange('pointCost', e.target.value)}
              min={0}
              className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:ring-2 focus:ring-[#C0392B] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:ring-2 focus:ring-[#C0392B] focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex flex-col gap-4 pt-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFree}
                onChange={(e) => handleChange('isFree', e.target.checked)}
                className="w-5 h-5 rounded border-[#E8E4DF] text-[#C0392B] focus:ring-[#C0392B]"
              />
              <span className="text-sm text-[#1A1A2E]">Free Article</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => handleChange('isFeatured', e.target.checked)}
                className="w-5 h-5 rounded border-[#E8E4DF] text-[#C0392B] focus:ring-[#C0392B]"
              />
              <span className="text-sm text-[#1A1A2E]">Featured</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8E4DF] p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#1A1A2E] mb-4">SEO</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
              Meta Title
            </label>
            <input
              type="text"
              value={form.metaTitle}
              onChange={(e) => handleChange('metaTitle', e.target.value)}
              className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:ring-2 focus:ring-[#C0392B] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
              Meta Description
            </label>
            <textarea
              value={form.metaDescription}
              onChange={(e) => handleChange('metaDescription', e.target.value)}
              rows={2}
              className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:ring-2 focus:ring-[#C0392B] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-[#C0392B] text-white rounded-lg hover:bg-[#922B21] transition-colors font-medium disabled:opacity-50"
        >
          {loading ? 'Saving...' : mode === 'new' ? 'Create Article' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-[#E8E4DF] rounded-lg hover:bg-[#FAFAF8] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
