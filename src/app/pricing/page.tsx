import type { Metadata } from 'next';
import { getPackages } from '@/lib/repo';
import { AdSlot } from '@/components/ads/AdSlot';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing & Points',
  description: 'Buy CPT points to unlock deep China travel guides. 1 USD = 30 points. No subscription, no expiry.'
};

export const dynamic = 'force-dynamic';

const FAQ = [
  {
    q: 'How does the CPT points system work?',
    a: 'Points are a one-time pay-per-guide currency. You top up once, then spend points to unlock individual guides. 1 USD = 30 CPT Points (e.g. $10 = 300 pts). Most guides cost 15–25 pts.'
  },
  {
    q: 'Do points expire?',
    a: 'No. Once purchased, points stay in your account until you spend them. We never charge inactivity fees.'
  },
  {
    q: 'Can I get a refund?',
    a: 'Unused points can be refunded within 30 days of purchase (see Terms of Service). Already-unlocked guides are non-refundable, but you can re-read them forever.'
  },
  {
    q: 'Why pay-per-guide instead of subscription?',
    a: 'You only pay for guides you actually want to read. Skip the monthly fee for guides you don\u2019t care about. Bonus points on larger packages let you save up front.'
  }
];

export default async function PricingPage() {
  const FREE_MODE = process.env.NEXT_PUBLIC_FREE_MODE === 'true';
  const packages = await getPackages();

  if (FREE_MODE) {
    return (
      <div className="bg-background min-h-screen">
        <div className="bg-secondary py-16">
          <div className="max-w-container mx-auto px-4 text-center">
            <Badge variant="accent" icon="\u2728" className="mb-4">Limited-Time Free Access</Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              All guides are free right now.
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">
              Sign in and read every deep China travel guide — no points, no payment needed.
              Paid plans will open soon.
            </p>
          </div>
        </div>
        <div className="max-w-container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-card rounded-2xl p-8 border border-border text-center">
            <div className="text-4xl mb-4">🎉</div>
            <p className="text-muted-foreground leading-relaxed">
              Top-up &amp; paid plans are coming soon. For now, just explore — everything is free.
            </p>
          </div>
        </div>
        <AdSlot slotCode="AD-06" />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-secondary py-16">
        <div className="max-w-container mx-auto px-4 text-center">
          <Badge variant="accent" icon="\u2728" className="mb-4">
            Simple, transparent pricing
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Pay only for the guides you read.
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            1 USD = <strong className="text-accent">30 CPT Points</strong>. Buy points once, unlock any guide forever.
            No subscription. No hidden fees.
          </p>
        </div>
      </div>

      {/* Packages */}
      <div className="max-w-container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((p) => (
            <div
              key={p.id}
              className={`relative rounded-2xl p-6 border ${
                p.isPopular
                  ? 'border-primary bg-card shadow-lg scale-105'
                  : 'border-border bg-card'
              }`}
            >
              {p.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {p.badge || 'Most Popular'}
                  </span>
                </div>
              )}
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {p.name}
              </h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-foreground">${p.priceUSD}</span>
                <span className="text-muted-foreground ml-2 text-sm">USD</span>
              </div>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-accent font-semibold">{p.pointsAmount} points</span>
                  {p.bonusPoints > 0 && (
                    <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded">
                      +{p.bonusPoints} bonus
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  = {(p.pointsAmount / 15).toFixed(0)}\u2013{(p.pointsAmount / 25).toFixed(0)} guides
                </p>
              </div>
              <Link href="/user/points" className="block">
                <Button variant={p.isPopular ? 'primary' : 'outline'} className="w-full">
                  Buy {p.pointsAmount} pts
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Custom amount */}
        <div className="mt-12 max-w-xl mx-auto bg-card rounded-2xl p-6 border border-border text-center">
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            Need a custom amount?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Top up any amount from $5 to $500. We credit 30 points per dollar automatically.
          </p>
          <Link href="/user/points">
            <Button variant="outline">Custom top-up \u2192</Button>
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-muted/30 py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-foreground mb-8 text-center">
            Frequently asked
          </h2>
          <div className="space-y-4">
            {FAQ.map((f) => (
              <details
                key={f.q}
                className="bg-card border border-border rounded-xl p-5 group"
              >
                <summary className="font-semibold text-foreground cursor-pointer list-none flex items-center justify-between">
                  {f.q}
                  <span className="text-primary group-open:rotate-180 transition-transform">
                    \u25BC
                  </span>
                </summary>
                <p className="text-muted-foreground mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      <AdSlot slotCode="AD-06" />
    </div>
  );
}