import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about China Deep Travel — points, payments, accounts, and reading guides.'
};

type FAQItem = { q: string; a: string };
type FAQCategory = { title: string; icon: string; items: FAQItem[] };

const FAQ: FAQCategory[] = [
  {
    title: 'Points & Payments',
    icon: '🪙',
    items: [
      {
        q: 'What are CPT Points?',
        a: 'CPT Points (China Deep Travel Points) are a virtual currency used to unlock paid guides on our platform. Each guide has a point cost (usually 10–20 pts). You purchase a points package once, then spend them as you read. There is no subscription — you only pay for what you unlock.'
      },
      {
        q: 'How do I buy points?',
        a: 'Visit the Pricing page (link in the navigation) to choose from our points packages. We accept Visa, Mastercard, American Express, PayPal, and Stripe. Your points are added to your account instantly after payment.'
      },
      {
        q: 'Do points expire?',
        a: 'Points never expire. Once purchased, they remain in your account until you choose to spend them.'
      },
      {
        q: 'Can I get a refund?',
        a: 'We do not offer refunds on point purchases. However, points never expire — they stay in your account indefinitely until you use them. We recommend starting with a smaller package if you are unsure how many guides you will read. Free previews are available for all paid guides, so you can decide if a guide is worth unlocking before spending your points.'
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex), PayPal, Apple/Google Pay via Stripe, and Alipay (including AlipayHK and Alipay+ for overseas users). All transactions are encrypted and secure.'
      }
    ]
  },
  {
    title: 'Reading & Unlocking',
    icon: '📖',
    items: [
      {
        q: 'Do all guides cost points?',
        a: 'No — some guides are completely free and can be read without any points. Look for the green "Free" badge on guide cards. We also offer free previews (summary + intro) for all paid guides so you can decide if it is worth unlocking.'
      },
      {
        q: 'How do I unlock a guide?',
        a: 'When viewing a locked guide, click the "Unlock" button. If you have enough points, the guide content will load instantly. If you are not logged in, you will be redirected to sign in first.'
      },
      {
        q: 'Do I need to be logged in to read?',
        a: 'You can browse all guides and read free previews without an account. To unlock paid guides, you need to be logged in with sufficient points.'
      },
      {
        q: 'Can I read a guide again after unlocking it?',
        a: 'Yes — once unlocked, a guide stays in your library permanently. You can read it anytime, on any device, as long as you are logged in.'
      },
      {
        q: 'Are the guides updated?',
        a: 'Our writers periodically update guides when major changes occur (e.g., new MRT lines open, a restaurant closes, a hiking trail is rerouted). The "Updated" date is shown on each guide. If you spot something outdated, use the feedback button at the bottom of any guide.'
      }
    ]
  },
  {
    title: 'Account & Profile',
    icon: '👤',
    items: [
      {
        q: 'How do I create an account?',
        a: 'Click "Get Started" in the top navigation, enter your name, email, and a password. We will send a verification email — click the link in it to activate your account. New users receive a welcome bonus of 5 free points.'
      },
      {
        q: 'How do I reset my password?',
        a: 'Go to the login page and click "Forgot password?" Enter your email address and we will send a reset link valid for 1 hour.'
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes. Contact support@chinadeeptravel.com from the email address associated with your account and we will delete all your data within 30 days. Point refunds will be processed before deletion if applicable.'
      },
      {
        q: 'Why haven\'t I received the verification email?',
        a: 'Check your spam/junk folder first. If it is not there, make sure you signed up with the correct email address. You can request a new verification email from the login page. Also add noreply@chinadeeptravel.com to your contacts to prevent future issues.'
      }
    ]
  },
  {
    title: 'Content & Accuracy',
    icon: '✅',
    items: [
      {
        q: 'How often are new guides published?',
        a: 'We publish 2–4 new or updated guides per month. Subscribe to our newsletter (coming soon) or follow us on social media to be notified of new releases.'
      },
      {
        q: 'Are your guides biased or sponsored?',
        a: 'Absolutely not. China Deep Travel accepts no sponsored content, no affiliate commissions, and no freebies from venues we review. Our writers pay their own way, always. The only income we have is from your point purchases.'
      },
      {
        q: 'I found incorrect information in a guide. What should I do?',
        a: 'Use the feedback button at the bottom of any guide to report specific inaccuracies. We review all submissions and update guides promptly when warranted. Thank you for helping us keep our content accurate.'
      },
      {
        q: 'Can I request a specific guide or destination?',
        a: 'Yes! We have a wishlist system. Go to our Contact page and let us know which destination or topic you would like us to cover. Popular requests get priority in our editorial schedule.'
      }
    ]
  }
];

export default function FAQPage() {
  return (
    <div className="bg-background">
      {/* Header */}
      <section className="bg-secondary py-16 md:py-20">
        <div className="max-w-container mx-auto px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">Help Center</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-white/70 max-w-lg mx-auto">
            Everything you need to know about China Deep Travel — points, payments, reading guides,
            and your account.
          </p>
        </div>
      </section>

      {/* FAQ content */}
      <section className="max-w-container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {FAQ.map((category) => (
            <div key={category.title} className="mb-12">
              <h2 className="font-display text-xl font-semibold text-secondary mb-6 flex items-center gap-2">
                <span>{category.icon}</span>
                {category.title}
              </h2>
              <div className="space-y-3">
                {category.items.map((item) => (
                  <details
                    key={item.q}
                    className="group bg-surface rounded-card border border-border overflow-hidden"
                  >
                    <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none text-secondary font-medium hover:text-primary transition-colors select-none">
                      <span>{item.q}</span>
                      <svg
                        className="w-4 h-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-5 pb-5 text-text-secondary text-sm leading-relaxed border-t border-border pt-3">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-surface border-t border-border py-12">
        <div className="max-w-container mx-auto px-4 text-center">
          <h2 className="font-display text-xl font-semibold text-secondary mb-3">
            Still have questions?
          </h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto text-sm">
            Our team is small but responsive. Send us an email and we will get back to you within
            1–2 business days.
          </p>
          <Button href="mailto:support@chinadeeptravel.com" variant="outline">
            Contact Support
          </Button>
        </div>
      </section>
    </div>
  );
}
