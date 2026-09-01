import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getArticleBySlug, getPublishedArticles, incrementViewCount } from '@/lib/repo';
import { renderMarkdown } from '@/lib/markdown';
import { UnlockButton } from '@/components/article/UnlockButton';
import { ArticleCard } from '@/components/article/ArticleCard';
import { AdSlot } from '@/components/ads/AdSlot';
import { Badge } from '@/components/ui/Badge';
import Comments from '@/components/Comments';

interface ArticlePageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return { title: 'Guide Not Found' };
  return {
    title: article.title,
    description: article.excerpt
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const user = await getCurrentUser();
  const article = await getArticleBySlug(params.slug, user?.id);

  if (!article) notFound();

  // Increment view count asynchronously
  incrementViewCount(article.id).catch(() => {});

  const isLocked = !article.isUnlocked && !article.isFree;
  const isLoggedIn = !!user;
  const canUnlock = article.canUnlock && isLoggedIn;

  // Related articles
  const { articles: relatedRaw } = await getPublishedArticles({
    category: article.category?.slug,
    sort: 'popular',
    limit: 4,
    offset: 0
  });
  const related = relatedRaw.filter((a) => a.id !== article.id).slice(0, 3);

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  return (
    <article className="bg-background">
      {/* Breadcrumb */}
      <div className="max-w-container mx-auto px-4 pt-6">
        <nav className="flex items-center gap-2 text-sm text-text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/guides" className="hover:text-primary transition-colors">Guides</Link>
          {article.category && (
            <>
              <span>/</span>
              <Link
                href={`/guides?category=${article.category.slug}`}
                className="hover:text-primary transition-colors"
              >
                {article.category.name}
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Header */}
      <header className="max-w-container mx-auto px-4 pt-6 pb-8">
        <div className="max-w-reading mx-auto">
          {/* Category + cost */}
          <div className="flex items-center gap-2 mb-4">
            {article.category && (
              <Badge icon={getCategoryIcon(article.category.slug)}>
                {article.category.name}
              </Badge>
            )}
            {article.isFree ? (
              <Badge variant="success">✓ Free</Badge>
            ) : article.isUnlocked ? (
              <Badge variant="success">✓ Unlocked</Badge>
            ) : (
              <Badge>🪙 {article.pointCost} pts</Badge>
            )}
            {article.readTimeMinutes && (
              <span className="text-sm text-text-muted">{article.readTimeMinutes} min read</span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-secondary leading-tight mb-6">
            {article.title}
          </h1>

          {/* Author + meta */}
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            {article.author?.avatarUrl ? (
              <img
                src={article.author.avatarUrl}
                alt={article.author.name ?? 'Author'}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {(article.author?.name ?? 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-medium text-secondary">{article.author?.name ?? 'China Deep Travel Team'}</p>
              {publishedDate && <p className="text-text-muted text-xs">{publishedDate}</p>}
            </div>
          </div>
        </div>
      </header>

      {/* Cover image */}
      {article.coverImage && (
        <div className="max-w-container mx-auto px-4 mb-8">
          <div className="max-w-reading mx-auto relative aspect-[16/9] rounded-card overflow-hidden">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
            />
          </div>
        </div>
      )}

      {/* Ad Slot 4 */}
      <div className="max-w-container mx-auto px-4 mb-8">
        <AdSlot slotCode="AD-04" className="max-w-4xl mx-auto" />
      </div>

      {/* Content area */}
      <div className="max-w-container mx-auto px-4 pb-16">
        <div className="max-w-reading mx-auto">
          {/* Summary (always visible) */}
          <div className="mb-8 p-6 bg-surface rounded-card border border-border">
            <h2 className="font-display text-xl font-semibold text-secondary mb-3">Summary</h2>
            <p className="text-text-secondary leading-relaxed">{article.summary}</p>
          </div>

          {/* Paywall or full content */}
          {isLocked ? (
            <PaywallPanel
              pointCost={article.pointCost}
              currentPoints={article.currentPoints}
              canUnlock={canUnlock}
              isLoggedIn={isLoggedIn}
              slug={article.slug}
            />
          ) : (
            <>
              {article.content && (
                <div
                  className="prose-article"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
                />
              )}

              {/* Author bio */}
              {article.author && (
                <div className="mt-12 p-6 bg-surface rounded-card border border-border flex gap-4 items-start">
                  {article.author.avatarUrl ? (
                    <img
                      src={article.author.avatarUrl}
                      alt={article.author.name ?? 'Author'}
                      className="w-14 h-14 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-lg shrink-0">
                      {(article.author.name ?? 'A').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-display font-semibold text-secondary mb-1">
                      About {article.author.name}
                    </p>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      A seasoned China traveler and writer at China Deep Travel, committed to
                      bringing you honest, on-the-ground insights that go beyond the typical
                      tourist experience.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Ad Slot 5 (sidebar-style on desktop) */}
        <div className="max-w-container mx-auto mt-10">
          <AdSlot slotCode="AD-05" className="max-w-reading mx-auto hidden md:block" />
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="max-w-container mx-auto mt-16">
            <h2 className="font-display text-2xl font-semibold text-secondary mb-6">
              More in {article.category?.name ?? 'Travel Guides'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((rel) => (
                <ArticleCard key={rel.id} article={rel} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-container mx-auto px-4 pb-16">
        <Comments slug={article.slug} />
      </div>
    </article>
  );
}

interface PaywallPanelProps {
  pointCost: number;
  currentPoints: number;
  canUnlock: boolean;
  isLoggedIn: boolean;
  slug: string;
}

function PaywallPanel({ pointCost, currentPoints, canUnlock, isLoggedIn, slug }: PaywallPanelProps) {
  const needs = pointCost - currentPoints;
  const progress = Math.min(100, Math.round((currentPoints / pointCost) * 100));

  return (
    <div className="rounded-card border-2 border-locked/30 bg-surface overflow-hidden">
      {/* Header */}
      <div className="bg-locked/5 px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2 text-locked font-semibold">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Unlock This Guide
        </div>
      </div>

      <div className="p-6">
        <p className="text-text-secondary mb-4">
          This guide requires{' '}
          <strong className="text-secondary">{pointCost} CPT Points</strong> to read in full.
          {isLoggedIn ? (
            <>
              {' '}Your current balance:{' '}
              <strong className="text-secondary">{currentPoints} points</strong>.
            </>
          ) : (
            <> Sign in to check your balance.</>
          )}
        </p>

        {/* Progress bar */}
        {isLoggedIn && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-text-muted mb-1.5">
              <span>Your points</span>
              <span>
                {currentPoints} / {pointCost} pts
                {needs > 0 && ` (need ${needs} more)`}
              </span>
            </div>
            <div className="h-2.5 bg-background rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <UnlockButton
            slug={slug}
            pointCost={pointCost}
            canUnlock={canUnlock}
            currentPoints={currentPoints}
            isLoggedIn={isLoggedIn}
          />
        </div>

        <p className="text-xs text-text-muted mt-4">
          Already unlocked?{' '}
          <Link href={`/guides/${slug}`} className="text-primary hover:underline">
            Refresh the page
          </Link>{' '}
          to load the full content.
        </p>
      </div>
    </div>
  );
}

const CATEGORY_ICONS: Record<string, string> = {
  mountains: '🏔',
  'mountains-and-nature': '🏔',
  'mountains & nature': '🏔',
  food: '🍜',
  'food-and-dining': '🍜',
  'food & dining': '🍜',
  'off-the-beaten-path': '🧭',
  'off the beaten path': '🧭',
  reviews: '⭐',
  'honest-reviews': '⭐',
  tips: '💡'
};

function getCategoryIcon(slug: string): string {
  return CATEGORY_ICONS[slug.toLowerCase()] ?? '📍';
}
