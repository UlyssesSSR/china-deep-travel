import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import type { ArticleCard as ArticleCardType } from '@/lib/types';

interface ArticleCardProps {
  article: ArticleCardType;
  featured?: boolean;
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
  'honest reviews': '⭐',
  tips: '💡',
  'travel-tips': '💡',
  'travel tips': '💡'
};

function getCategoryIcon(slug: string): string {
  return CATEGORY_ICONS[slug.toLowerCase()] ?? '📍';
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const coverUrl = article.coverImage;
  const isLocked = !article.isUnlocked && !article.isFree;
  const isFree = article.isFree;
  const href = `/guides/${article.slug}`;

  if (featured) {
    return (
      <Link href={href} className="group block">
        <article className="flex flex-col md:flex-row gap-0 bg-surface rounded-card border border-border overflow-hidden hover:shadow-lg transition-all duration-150 hover:-translate-y-0.5">
          {/* Cover */}
          <div className="relative md:w-2/5 aspect-[16/10] md:aspect-auto overflow-hidden shrink-0">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-5xl opacity-30">🏔</span>
              </div>
            )}
            {/* Featured ribbon */}
            <div className="absolute top-3 left-3">
              <Badge variant="accent" icon="⭐">Editor&apos;s Pick</Badge>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col justify-between p-6 flex-1">
            <div>
              {/* Category + cost */}
              <div className="flex items-center gap-2 mb-3">
                {article.category && (
                  <Badge icon={getCategoryIcon(article.category.slug)}>
                    {article.category.name}
                  </Badge>
                )}
                <Badge variant={isLocked ? 'default' : isFree ? 'success' : 'default'}>
                  {isFree ? '✓ Free' : `🪙 ${article.pointCost} pts`}
                </Badge>
              </div>

              <h3 className="font-display text-xl font-semibold text-secondary mb-3 group-hover:text-primary transition-colors duration-150 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
                {article.excerpt}
              </p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3 text-xs text-text-muted">
                {article.readTimeMinutes && (
                  <span>{article.readTimeMinutes} min read</span>
                )}
                {article.viewCount > 0 && (
                  <span>{article.viewCount.toLocaleString()} views</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm font-medium">
                {isLocked ? (
                  <span className="text-locked flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Locked
                  </span>
                ) : (
                  <span className="text-success flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {isFree ? 'Free to read' : 'Unlocked'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={href} className="group block">
      <article className="h-full flex flex-col bg-surface rounded-card border border-border overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-150">
        {/* Cover image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <span className="text-4xl opacity-30">🏔</span>
            </div>
          )}
          {/* Category badge overlay */}
          {article.category && (
            <div className="absolute top-2.5 left-2.5">
              <Badge icon={getCategoryIcon(article.category.slug)}>
                {article.category.name}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-4">
          <h3 className="font-display text-base font-semibold text-secondary mb-2 group-hover:text-primary transition-colors duration-150 line-clamp-2 flex-none">
            {article.title}
          </h3>
          <p className="text-text-secondary text-xs leading-relaxed line-clamp-3 flex-1">
            {article.excerpt}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              {article.readTimeMinutes && (
                <span>{article.readTimeMinutes} min</span>
              )}
              {article.publishedAt && (
                <span>
                  {new Date(article.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              )}
            </div>
            <span className={`text-xs font-semibold ${isLocked ? 'text-locked' : isFree ? 'text-success' : 'text-accent'}`}>
              {isFree ? '✓ Free' : `🪙 ${article.pointCost}`}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
