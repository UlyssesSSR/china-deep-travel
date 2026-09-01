import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'China Deep Travel is a platform for honest, deep travel guides to China — written by people who actually live here.'
};

const TEAM = [
  {
    name: 'Wei Chen',
    role: 'Co-Founder & Lead Writer',
    bio: 'Lived in China for 12 years, traveled to 28 provinces. Specializes in Yunnan, Sichuan, and Xinjiang.',
    avatar: null
  },
  {
    name: 'Sarah Mitchell',
    role: 'Co-Founder & Editor',
    bio: 'Former Shanghai expat turned full-time China traveler. Writes about food, cities, and off-the-beaten-path routes.',
    avatar: null
  },
  {
    name: 'Jia Li',
    role: 'Contributing Writer',
    bio: 'Born in Chengdu, now based between Beijing and Guangzhou. Covers Sichuan cuisine, tea culture, and rural China.',
    avatar: null
  }
];

const VALUES = [
  {
    icon: '🎯',
    title: 'Honest, Always',
    desc: 'We don\'t accept payment for coverage, don\'t run affiliate links, and we tell you when a place is genuinely overrated. You can trust our recommendations because we have nothing to gain from misleading you.'
  },
  {
    icon: '🗺',
    title: 'Depth Over Breadth',
    desc: 'We\'d rather spend six months researching one region than write five shallow posts. Each guide goes through multiple rounds of field research, local interviews, and editorial review.'
  },
  {
    icon: '🌱',
    title: 'Sustainable & Respectful',
    desc: 'We encourage slow travel, respect for local communities, and environmentally conscious choices. The China we love is worth protecting.'
  },
  {
    icon: '💡',
    title: 'Practical First',
    desc: 'Beautiful prose is great, but you also need to know how to get there, what to budget, and what can go wrong. Every guide prioritizes actionable, up-to-date practical information.'
  }
];

export default function AboutPage() {
  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="bg-secondary py-20 md:py-28">
        <div className="max-w-container mx-auto px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">About Us</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 max-w-2xl mx-auto">
            We came for a semester.{' '}
            <span className="text-primary">We never left.</span>
          </h1>
          <p className="text-white/70 max-w-xl mx-auto text-lg leading-relaxed">
            China Deep Travel started as a private travel journal shared between friends. Today it
            is a platform for deep, honest travel guides to China — written by the people who know
            it best.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="max-w-container mx-auto px-4">
          <div className="max-w-reading mx-auto">
            <h2 className="font-display text-2xl font-semibold text-secondary mb-6">
              Why We Exist
            </h2>
            <div className="space-y-5 text-text-secondary leading-relaxed">
              <p>
                Every major travel platform was built around mass tourism. They show you the
                same five attractions in Beijing, the same Instagram spots in Shanghai, the same
                tour-bus itineraries that have been recycled since the 1990s.
              </p>
              <p>
                China is enormous — 23 provinces, 5 autonomous regions, 4 municipalities, and
                2 special administrative regions. The vast majority of it never appears in
                mainstream travel content. The best food scenes are in second-tier cities. The
                most breathtaking hikes are in provinces that don&apos;t have international airports.
                The most memorable experiences happen in villages that don&apos;t have English signs.
              </p>
              <p>
                That&apos;s the China we want to show you. Not the China of tour groups and
                tourist traps, but the China of 1.4 billion real people living real lives — and
                the corners of it that are genuinely worth discovering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-surface border-y border-border">
        <div className="max-w-container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-secondary text-center mb-12">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {VALUES.map((v) => (
              <div key={v.title} className="flex gap-4">
                <span className="text-3xl shrink-0">{v.icon}</span>
                <div>
                  <h3 className="font-semibold text-secondary mb-2">{v.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="max-w-container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-secondary text-center mb-12">
            The Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {TEAM.map((member) => (
              <div key={member.name} className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display text-2xl font-bold mx-auto mb-4">
                  {member.name.charAt(0)}
                </div>
                <h3 className="font-semibold text-secondary mb-1">{member.name}</h3>
                <p className="text-xs text-accent font-medium mb-3">{member.role}</p>
                <p className="text-sm text-text-secondary leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-secondary py-16">
        <div className="max-w-container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '12+', label: 'Years Combined in China' },
              { value: '28', label: 'Provinces Covered' },
              { value: '100+', label: 'Guides Published' },
              { value: '50K+', label: 'Readers Monthly' }
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-3xl md:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="max-w-container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-secondary mb-4">
            Ready to Start Exploring?
          </h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Browse our full library of deep travel guides and discover the China you won&apos;t
            find anywhere else.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button href="/guides" size="lg">
              Browse All Guides
            </Button>
            <Button href="/faq" variant="outline" size="lg">
              Read the FAQ
            </Button>
          </div>
        </div>
      </section>

      {/* Business Partnership */}
      <section className="py-16 bg-surface border-t border-border">
        <div className="max-w-container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">Partnerships</p>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-secondary mb-4">
              Business & Advertising
            </h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              We partner with brands and services that align with our values — honesty, sustainability,
              and genuine value for travelers. If you&apos;re interested in collaborating, we&apos;d love to hear from you.
            </p>
            <div className="bg-white rounded-lg border border-border p-6 text-left space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-lg">📧</span>
                <div>
                  <p className="font-medium text-secondary">Email</p>
                  <a href="mailto:partners@chinadeeptravel.com" className="text-accent hover:underline">
                    partners@chinadeeptravel.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">📋</span>
                <div>
                  <p className="font-medium text-secondary">What We Offer</p>
                  <p className="text-sm text-text-secondary">
                    Display advertising, sponsored content, affiliate partnerships, and custom collaborations.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-lg">✓</span>
                <div>
                  <p className="font-medium text-secondary">Our Policy</p>
                  <p className="text-sm text-text-secondary">
                    We never accept payment for positive coverage. Sponsored content is always clearly labeled.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
