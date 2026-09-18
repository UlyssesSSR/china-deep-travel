import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getCategories, getPublishedArticles } from '@/lib/repo';
import { ArticleCard } from '@/components/article/ArticleCard';
import { GuidesFilters } from '@/components/article/GuidesFilters';
import { AdSlot } from '@/components/ads/AdSlot';

export const metadata: Metadata = {
  title: 'All Guides',
  description:
    'Browse all China travel guides — from mountain hikes to food tours, all written by locals who live in China.'
};

const PAGE_SIZE = 12;

interface GuidesPageProps {
  searchParams: { category?: string; cost?: string; sort?: string; page?: string };
}

export default async function GuidesPage({ searchParams }: GuidesPageProps) {
  const category = searchParams.category ?? '';
  const cost = (searchParams.cost ?? 'all') as 'free' | 'paid' | 'all';
  const sort = (searchParams.sort ?? 'newest') as 'newest' | 'popular' | 'trending';
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10));
  const offset = (page - 1) * PAGE_SIZE;

  const [{ articles, total }, categories] = await Promise.all([
    getPublishedArticles({ category: category || undefined, exclude_category: 'secret-spots', cost, sort, limit: PAGE_SIZE, offset }),
    getCategories()
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="bg-background min-h-screen">
      {/* Page header */}
      <div className="bg-secondary py-12">
        <div className="max-w-container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            All Travel Guides
          </h1>
          <p className="text-white/70 max-w-lg">
            {total} guide{total !== 1 ? 's' : ''} available — from hidden mountain villages to the best
            regional cuisines in China.
          </p>
        </div>
      </div>

      <div className="max-w-container mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <div className="lg:w-56 shrink-0">
            <GuidesFilters total={total} currentPage={page} categories={categories.map(c => ({ slug: c.slug, name: c.name }))} />
          </div>

          {/* Main content */}
          <div className="flex-1">
            {articles.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-5xl mb-4 block">🏔</span>
                <h2 className="font-display text-xl font-semibold text-secondary mb-2">
                  No guides match your filters
                </h2>
                <p className="text-text-secondary mb-6">
                  Try adjusting your search or clearing the filters.
                </p>
                <a href="/guides" className="text-primary hover:text-primary-dark font-medium">
                  Clear all filters →
                </a>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    {page > 1 && (
                      <a
                        href={`/guides?${buildQueryString({ ...searchParams, page: String(page - 1) })}`}
                        className="px-4 py-2 border border-border rounded-btn text-sm text-text-secondary hover:bg-surface hover:border-primary/30 transition-colors"
                      >
                        ← Previous
                      </a>
                    )}
                    <span className="px-4 py-2 text-sm text-text-muted">
                      Page {page} of {totalPages}
                    </span>
                    {page < totalPages && (
                      <a
                        href={`/guides?${buildQueryString({ ...searchParams, page: String(page + 1) })}`}
                        className="px-4 py-2 border border-border rounded-btn text-sm text-text-secondary hover:bg-surface hover:border-primary/30 transition-colors"
                      >
                        Next →
                      </a>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Ad below filters */}
        <div className="mt-10">
          <AdSlot slotCode="AD-03" className="max-w-4xl mx-auto" />
        </div>
      </div>
    </div>
  );
}

function buildQueryString(params: Record<string, string>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v && v !== 'all' && v !== 'newest' && v !== '1') {
      sp.set(k, v);
    }
  }
  return sp.toString();
}
