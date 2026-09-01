'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';

const CAT_EMOJI: Record<string, string> = {
  'beijing-north': '🏯',
  'shanghai-east': '🏙',
  'silk-road-west': '🐫',
  'yunnan-southwest': '🌺',
  'sichuan-central': '🌶',
  'nature-scenic': '🏔'
};

const COST_OPTIONS = [
  { value: 'all', label: 'All Prices' },
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid (Points)' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' }
];

interface GuidesFiltersProps {
  total: number;
  currentPage: number;
  categories: { slug: string; name: string }[];
}

export function GuidesFilters({ total, currentPage, categories }: GuidesFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);

  const category = searchParams.get('category') ?? '';
  const cost = searchParams.get('cost') ?? 'all';
  const sort = searchParams.get('sort') ?? 'newest';

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== 'all' && value !== 'newest') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return (
    <aside>
      {/* Mobile filter toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-surface border border-border rounded-btn text-sm font-medium text-secondary mb-4"
      >
        <span>Filters {total > 0 && `(${total} results)`}</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`${open ? 'block' : 'hidden'} lg:block`}>
        {/* Category filter */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
            Category
          </h3>
          <div className="flex flex-col gap-1.5">
            <button
              key="all"
              onClick={() => updateParam('category', '')}
              className={`text-left px-3 py-2 rounded-btn text-sm transition-colors duration-100 ${
                category === ''
                  ? 'bg-primary text-white font-medium'
                  : 'text-text-secondary hover:bg-background hover:text-secondary'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => updateParam('category', cat.slug)}
                className={`text-left px-3 py-2 rounded-btn text-sm transition-colors duration-100 ${
                  category === cat.slug
                    ? 'bg-primary text-white font-medium'
                    : 'text-text-secondary hover:bg-background hover:text-secondary'
                }`}
              >
                {CAT_EMOJI[cat.slug] ?? '📚'} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Cost filter */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
            Price
          </h3>
          <div className="flex flex-col gap-1.5">
            {COST_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateParam('cost', opt.value)}
                className={`text-left px-3 py-2 rounded-btn text-sm transition-colors duration-100 ${
                  cost === opt.value
                    ? 'bg-primary text-white font-medium'
                    : 'text-text-secondary hover:bg-background hover:text-secondary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
            Sort By
          </h3>
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="w-full bg-surface border border-border rounded-btn px-3 py-2 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Active filters clear */}
        {(category || cost !== 'all') && (
          <button
            onClick={() => router.push(pathname)}
            className="text-xs text-primary hover:text-primary-dark font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>
    </aside>
  );
}
