import Link from 'next/link';
import Image from 'next/image';
import { getCategories, getPublishedArticles } from '@/lib/repo';
import { AdSlot } from '@/components/ads/AdSlot';
import { ArticleCard } from '@/components/article/ArticleCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const VALUE_PROPS = [
  {
    icon: '🌏',
    title: 'Written by Locals',
    desc: 'Every guide is written by someone with years of firsthand experience living and traveling in China.'
  },
  {
    icon: '👣',
    title: 'Off-the-Beaten-Path',
    desc: 'Skip the tour-bus routes. We cover the villages, mountain trails, and local eateries that guidebooks miss.'
  },
  {
    icon: '🪙',
    title: 'Pay Per Guide',
    desc: 'No subscription, no hidden fees. Buy points once and unlock exactly the guides you want to read.'
  },
  {
    icon: '✅',
    title: 'Honest & Unfiltered',
    desc: 'Real pros and cons, real prices, real travel conditions. No affiliate deals, no sponsored content.'
  }
];

const FAQ_TEASERS = [
  {
    q: 'How do CPT Points work?',
    a: 'Points are a pay-per-guide currency. Each article has a point cost (usually 10–20 pts). You buy a points package once, then spend them as you read.',
    href: '/faq#points'
  },
  {
    q: 'Is there a free preview?',
    a: 'Yes — every guide shows its full summary and the first few sections for free before the paywall.',
    href: '/faq#preview'
  },
  {
    q: 'Can I request a refund?',
    a: 'Unused points are refundable within 30 days of purchase. See our refund policy for full details.',
    href: '/faq#refunds'
  }
];

export default async function HomePage() {
  const [categories, { articles: latestArticles }, { articles: featuredArticles }] =
    await Promise.all([
      getCategories(),
      getPublishedArticles({ sort: 'newest', limit: 8, offset: 0 }),
      getPublishedArticles({ sort: 'popular', limit: 3, offset: 0 })
    ]);

  const featured = featuredArticles.filter((a) => a.isFeatured).slice(0, 2);
  const freeArticle = latestArticles.find((a) => a.isFree);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative bg-secondary overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1600&q=80"
            alt="Misty mountains of China"
            fill
            priority
            className="object-cover opacity-20"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/95 to-secondary/70" />
        </div>

        <div className="relative max-w-container mx-auto px-4 py-20 md:py-28 lg:py-36">
          <div className="max-w-2xl">
            <Badge variant="accent" icon="🏔" className="mb-6">
              Deep Travel Guides to China
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Real China.{' '}
              <span className="text-primary">Not the Tour-Bus Version.</span>
            </h1>
            <p className="text-lg text-white/80 mb-10 leading-relaxed max-w-xl">
              Deep travel guides written by people who actually live here. Skip the tourist traps,
              discover the real China — from hidden hiking trails in Yunnan to the best dumplings in
              Harbin.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button href="/guides" size="lg">
                Start Exploring →
              </Button>
              <Button href="/user/points" variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10 hover:border-white">
                Get Points
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Value Props ──────────────────────────────────────────── */}
      <section className="bg-surface border-y border-border py-16">
        <div className="max-w-container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUE_PROPS.map((vp) => (
              <div key={vp.title} className="text-center">
                <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  {vp.icon}
                </div>
                <h3 className="font-semibold text-secondary mb-2">{vp.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{vp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category Showcase ────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-16">
          <div className="max-w-container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-secondary">
                Explore by Category
              </h2>
              <Link href="/guides" className="text-sm text-primary hover:text-primary-dark font-medium">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.slice(0, 5).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/guides?category=${cat.slug}`}
                  className="group flex flex-col items-start p-4 bg-surface rounded-card border border-border hover:border-primary/30 hover:shadow-md transition-all duration-150 hover:-translate-y-0.5"
                >
                  <span className="text-2xl mb-2" aria-hidden="true">
                    {cat.icon_name ?? '📍'}
                  </span>
                  <span className="font-semibold text-sm text-secondary group-hover:text-primary transition-colors line-clamp-1">
                    {cat.name}
                  </span>
                  <span className="text-xs text-text-muted mt-1">
                    {cat.article_count} guide{cat.article_count !== 1 ? 's' : ''}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Ad Slot 1 ───────────────────────────────────────────── */}
      <div className="max-w-container mx-auto px-4 pb-12">
        <AdSlot slotCode="AD-01" className="max-w-4xl mx-auto" />
      </div>

      {/* ── Featured Guides ──────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-12 bg-background">
          <div className="max-w-container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">
                  Editor&apos;s Picks
                </p>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-secondary">
                  Featured Guides
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featured.map((article) => (
                <ArticleCard key={article.id} article={article} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Latest Guides ────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-secondary">
              Latest Guides
            </h2>
            <Link href="/guides" className="text-sm text-primary hover:text-primary-dark font-medium">
              Browse all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Free Preview + Sidebar Ad ────────────────────────────── */}
      {freeArticle && (
        <section className="bg-background py-12">
          <div className="max-w-container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Free teaser */}
              <div className="lg:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-success mb-3">
                  Free to Read
                </p>
                <ArticleCard article={freeArticle} featured />
              </div>
              {/* Sidebar ad */}
              <div className="hidden lg:block">
                <AdSlot slotCode="AD-02" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Ad Slot 2 fallback (if no free article) ──────────────── */}
      {!freeArticle && (
        <div className="max-w-container mx-auto px-4 pb-12">
          <AdSlot slotCode="AD-02" className="max-w-sm ml-auto" />
        </div>
      )}

      {/* ── FAQ Teaser ───────────────────────────────────────────── */}
      <section className="bg-surface border-t border-border py-16">
        <div className="max-w-container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-secondary mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              Everything you need to know before you start exploring China with us.
            </p>
          </div>
          <div className="max-w-2xl mx-auto space-y-4">
            {FAQ_TEASERS.map((item) => (
              <div
                key={item.q}
                className="bg-background rounded-card border border-border p-5 hover:border-primary/20 transition-colors"
              >
                <h3 className="font-semibold text-secondary mb-2">{item.q}</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-3">{item.a}</p>
                <Link href={item.href} className="text-xs text-primary hover:text-primary-dark font-medium">
                  Learn more →
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button href="/faq" variant="outline">
              View All FAQs
            </Button>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────── */}
      <section className="bg-primary py-16">
        <div className="max-w-container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Discover the Real China?
          </h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            Join thousands of travelers who have already uncovered the China guidebooks don&apos;t
            cover.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button href="/guides" size="lg" className="bg-white text-primary hover:bg-white/90">
              Browse All Guides
            </Button>
            <Button
              href="/user/points"
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Get Points
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
