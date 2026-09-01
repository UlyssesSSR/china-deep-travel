'use client';

import { useState } from 'react';

interface AdsManagerProps {
  slotId: string;
  slotName: string;
  existingAd?: any;
}

export default function AdsManager({ slotId, slotName, existingAd }: AdsManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    title: existingAd?.title || '',
    imageUrl: existingAd?.image_url || '',
    targetUrl: existingAd?.target_url || '',
    isActive: existingAd?.is_active ?? true,
    startDate: existingAd?.start_date ? new Date(existingAd.start_date).toISOString().split('T')[0] : '',
    endDate: existingAd?.end_date ? new Date(existingAd.end_date).toISOString().split('T')[0] : '',
    priority: existingAd?.priority || 1,
  });

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      slotId,
      title: form.title,
      imageUrl: form.imageUrl || null,
      targetUrl: form.targetUrl || null,
      isActive: form.isActive,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      priority: parseInt(form.priority as any) || 1,
    };

    try {
      const url = existingAd 
        ? `/api/admin/ads/${existingAd.id}` 
        : '/api/admin/ads';
      
      const res = await fetch(url, {
        method: existingAd ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to save ad');
      }

      setShowForm(false);
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to save ad');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setForm(prev => ({ ...prev, imageUrl: data.url }));
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async () => {
    setError(null);
    setLoading(true);
    
    try {
      const res = await fetch(`/api/admin/ads/${existingAd.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !form.isActive }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || 'Failed to update ad');
      }

      setForm(prev => ({ ...prev, isActive: !prev.isActive }));
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to update ad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-[#C0392B] text-white rounded-lg hover:bg-[#922B21] transition-colors text-sm font-medium"
        >
          {existingAd ? 'Edit' : '+ Create Ad'}
        </button>
        {existingAd && (
          <button
            onClick={handleToggleActive}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              form.isActive
                ? 'border border-[#E74C3C] text-[#E74C3C] hover:bg-[#E74C3C] hover:text-white'
                : 'border border-[#27AE60] text-[#27AE60] hover:bg-[#27AE60] hover:text-white'
            }`}
          >
            {form.isActive ? 'Disable' : 'Enable'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-[#1A1A2E] mb-4">
              {existingAd ? 'Edit Ad' : 'Create New Ad'}
            </h3>
            <p className="text-sm text-[#6B7280] mb-6">Slot: {slotName}</p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-[#E74C3C] rounded text-[#E74C3C] text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  Image
                </label>
                <input
                  type="url"
                  value={form.imageUrl}
                  onChange={(e) => handleChange('imageUrl', e.target.value)}
                  className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:ring-2 focus:ring-[#C0392B] focus:border-transparent"
                  placeholder="https://... or upload below"
                />
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="block text-sm text-[#6B7280] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#1A1A2E] file:text-white file:cursor-pointer"
                  />
                  {uploading && <span className="text-sm text-[#6B7280]">Uploading...</span>}
                </div>
                {form.imageUrl && (
                  <img
                    src={form.imageUrl}
                    alt="Ad preview"
                    className="mt-2 w-32 h-20 object-cover rounded border border-[#E8E4DF]"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
                  Target URL
                </label>
                <input
                  type="url"
                  value={form.targetUrl}
                  onChange={(e) => handleChange('targetUrl', e.target.value)}
                  className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:ring-2 focus:ring-[#C0392B] focus:border-transparent"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:ring-2 focus:ring-[#C0392B] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:ring-2 focus:ring-[#C0392B] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
                  Priority (higher = shown first)
                </label>
                <input
                  type="number"
                  value={form.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  min={1}
                  className="w-full px-4 py-3 border border-[#E8E4DF] rounded-lg focus:ring-2 focus:ring-[#C0392B] focus:border-transparent"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="w-5 h-5 rounded border-[#E8E4DF] text-[#C0392B] focus:ring-[#C0392B]"
                />
                <span className="text-sm text-[#1A1A2E]">Active</span>
              </label>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#C0392B] text-white rounded-lg hover:bg-[#922B21] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : existingAd ? 'Save Changes' : 'Create Ad'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-[#E8E4DF] rounded-lg hover:bg-[#FAFAF8] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
