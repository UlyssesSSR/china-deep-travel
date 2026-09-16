import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedArticles } from '@/lib/repo';
import { ArticleCard } from '@/components/article/ArticleCard';


export const metadata: Metadata = {
  title: 'Secret Spots — Hardcore China Beyond the Guidebooks',
  description: 'Route reports from China\'s most remote corners: cross-border overland routes, no-hotel wilderness, multi-modal transport chains, and camping intel you won\'t find in any guidebook. Written by people who\'ve actually been there.'
};

// Hardcoded daren author info (shown on page)
const DAREN_AUTHOR = {
  name: 'Azhi — 300K km on China\'s Backroads',
  tagline: '300,000 km covered in 3 years — only writing about routes he\'s actually walked',
  avatar: '/uploads/daren-avatar-azi.jpg',
  articleCount: 9
};

export default async function SecretSpotsPage() {
  const [{ articles }] = await Promise.all([
    getPublishedArticles({ category: 'secret-spots', limit: 50, offset: 0 }),
  ]);

  return (
    <div className="bg-background min-h-screen">
      {/* Hero banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a0a00 0%, #2d1810 50%, #1a0a00 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
        className="py-14 px-4"
      >
        {/* Background texture */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,200,100,0.02) 35px, rgba(255,200,100,0.02) 70px)',
            pointerEvents: 'none'
          }}
        />
        <div className="max-w-container mx-auto relative">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1 mb-5">
            <span className="text-amber-400 text-sm font-semibold">🔥 Field-Tested</span>
            <span className="text-amber-400/60 text-sm">·</span>
            <span className="text-amber-400/70 text-sm">Not AI-generated</span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            Secret Spots
          </h1>
          <p className="text-white/60 max-w-lg text-base leading-relaxed">
            Places tour buses don&apos;t go. Destinations no public transit reaches.
            Wilderness with zero hotels. Here you&apos;ll only find routes that real travelers
            have walked — multi-modal transport chains, camping field reports, local codes.
          </p>

          {/* Daren author card */}
          <div className="mt-8 flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 max-w-md">
            <div className="relative shrink-0">
              <img
                src={DAREN_AUTHOR.avatar}
                alt={DAREN_AUTHOR.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-amber-500/50"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#2d1810]" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{DAREN_AUTHOR.name}</p>
              <p className="text-white/50 text-xs mt-0.5">{DAREN_AUTHOR.tagline}</p>
              <p className="text-amber-400/60 text-xs mt-1">{DAREN_AUTHOR.articleCount} field-tested guides</p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured tags */}
      <div className="bg-[#2d1810]/50 border-b border-amber-900/20">
        <div className="max-w-container mx-auto px-4 py-3 flex flex-wrap gap-2">
          {['Wilderness Overland', 'Tea Horse Road', 'Camping Field Report', 'Multi-Modal Transit', 'Hardcore Routes'].map(tag => (
            <span
              key={tag}
              className="text-xs px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Articles */}
      <div className="max-w-container mx-auto px-4 py-10">
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl mb-4 block">🗺</span>
            <h2 className="text-xl font-semibold text-secondary mb-2">Secret spots unlocking soon…</h2>
            <p className="text-text-muted">The daren is out scouting — first guide drops soon.</p>
            <Link
              href="/guides"
              className="inline-block mt-6 px-6 py-3 bg-primary text-white rounded-btn font-semibold hover:bg-primary-dark transition-colors"
            >
              Browse regular guides in the meantime
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-text-muted">
                <span className="text-secondary font-semibold">{articles.length}</span> secret spot guides
              </p>
              <Link
                href="/guides"
                className="text-sm text-primary hover:text-primary-dark transition-colors"
              >
                Browse all guides →
              </Link>
            </div>

            {/* Article grid — 2 columns on desktop, 1 on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {articles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {/* CTA to join */}
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <span className="text-3xl mb-3 block">🏕</span>
              <h3 className="font-display text-xl font-bold text-secondary mb-2">
                Got a secret spot of your own?
              </h3>
              <p className="text-text-muted text-sm max-w-md mx-auto mb-5">
                Walked through wilderness? Know transport routes only locals use? This is where
                you share real field experience — not travel diaries, actual route reports.
              </p>
              <Link
                href="/auth/register"
                className="inline-block px-6 py-3 bg-primary text-white rounded-btn font-semibold hover:bg-primary-dark transition-colors"
              >
                Become a contributor
              </Link>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
