// ============================================================
// Demo data --used ONLY when DATABASE_URL is not configured,
// so the frontend UI can be previewed without a real backend.
// Remove / ignore this file once the database is connected.
// ============================================================

/**
 * In-memory demo "tables" --process-local state that lets the user simulate
 * a full session (register, recharge, unlock, history) without MySQL.
 *
 * Each Map/Array is mutated through the helper functions at the bottom of
 * the file. The data is wiped when the dev server restarts.
 */
type DemoUnlock = {
  userId: string;
  articleId: string;
  pointsSpent: number;
  unlockedAt: string;
};
const demoUnlocks: DemoUnlock[] = [];

type DemoTx = {
  id: string;
  userId: string;
  type: 'purchase' | 'signup_bonus' | 'admin_adjustment' | 'refund' | 'unlock';
  pointsDelta: number;
  balanceAfter: number;
  referenceType: string | null;
  referenceId: string | null;
  adminNote: string | null;
  createdAt: string;
};
const demoTxs: DemoTx[] = [];

type DemoOrder = {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  amountUsd: number;
  pointsAwarded: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  provider: 'mock' | 'stripe' | 'paypal';
  paidAt: string | null;
  createdAt: string;
};
const demoOrdersExtra: DemoOrder[] = [];

/** Per-user balance cache (also reflects purchases / deductions). */
const demoBalances = new Map<string, number>();

/** Demo state helpers (kept here to keep all demo data in one place). */
export function getDemoBalance(userId: string): number {
  if (!demoBalances.has(userId)) demoBalances.set(userId, DEMO_BALANCE);
  return demoBalances.get(userId)!;
}
export function setDemoBalance(userId: string, v: number) {
  demoBalances.set(userId, v);
}
export function addDemoTx(tx: DemoTx) {
  demoTxs.unshift(tx);
}
export function listDemoTxs(userId: string, type?: string): DemoTx[] {
  return demoTxs.filter((t) => t.userId === userId && (!type || t.type === type));
}
export function addDemoUnlock(u: DemoUnlock) {
  // Idempotent on (userId, articleId)
  if (!demoUnlocks.some((x) => x.userId === u.userId && x.articleId === u.articleId)) {
    demoUnlocks.push(u);
  }
}
export function isDemoUnlocked(userId: string, articleId: string): boolean {
  return demoUnlocks.some((x) => x.userId === userId && x.articleId === articleId);
}
export function listDemoUnlocks(userId: string) {
  return demoUnlocks.filter((x) => x.userId === userId);
}
export function addDemoOrder(o: DemoOrder) {
  demoOrdersExtra.unshift(o);
}
export function listDemoOrders() {
  return [...demoOrdersExtra, ...demoOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
export function getDemoOrder(id: string) {
  return listDemoOrders().find((o) => o.id === id);
}
export function updateDemoOrder(id: string, patch: Partial<DemoOrder>) {
  const all = listDemoOrders();
  const i = all.findIndex((o) => o.id === id);
  if (i < 0) return null;
  // Mutate the in-place list (extra first, then fixed)
  const o = all[i];
  Object.assign(o, patch);
  return o;
}

import type {
  ArticleCard,
  ArticleDetail,
  Category,
  PointPackage,
  Advertisement,
  User,
  Comment
} from './types';

/** True when no database is configured -> frontend runs on mock data. */
export const DEMO = !process.env.DATABASE_URL;

export const DEMO_BALANCE = 320;

export const demoUser: User = {
  id: 'demo-user',
  email: 'traveler@demo.com',
  name: 'Alex Traveler',
  avatar_url: null,
  role: 'admin',
  email_verified: true,
  is_suspended: false,
  current_points: DEMO_BALANCE,
  last_login_at: '2026-08-20T09:00:00Z',
  created_at: '2026-06-01T08:00:00Z',
  updated_at: '2026-08-20T09:00:00Z'
};

export const demoCategories: Category[] = [
  {
    id: 'c1',
    name: 'Destinations',
    slug: 'destinations',
    description: 'City-by-city deep dives',
    icon_name: 'map',
    article_count: 5,
    sort_order: 1,
    is_active: true
  },
  {
    id: 'c2',
    name: 'Food & Drink',
    slug: 'food',
    description: 'Where and what to eat',
    icon_name: 'utensils',
    article_count: 3,
    sort_order: 2,
    is_active: true
  },
  {
    id: 'c3',
    name: 'Culture & History',
    slug: 'culture',
    description: 'Heritage that matters',
    icon_name: 'landmark',
    article_count: 2,
    sort_order: 3,
    is_active: true
  },
  {
    id: 'c4',
    name: 'Transport & Apps',
    slug: 'transport',
    description: 'Trains, metros, must-have apps',
    icon_name: 'train',
    article_count: 2,
    sort_order: 4,
    is_active: true
  }
];

const cover = (seed: string) => `https://picsum.photos/seed/${seed}/800/450`;

export const demoArticles: ArticleCard[] = [
  {
    id: 'a1',
    slug: 'shanghai-3-day-itinerary',
    title: 'Shanghai in 3 Days: A First-Timer’s Itinerary',
    excerpt:
      'The Bund at night, hidden lane cafés in Jing’an, and a day trip to Zhujiajiao --paced so you actually enjoy it.',
    coverImage: cover('shanghai'),
    category: { name: 'Destinations', slug: 'destinations' },
    pointCost: 0,
    isFree: true,
    isFeatured: true,
    readTimeMinutes: 12,
    viewCount: 4210,
    publishedAt: '2026-08-10T00:00:00Z',
    isUnlocked: true,
    author: { name: 'China Deep Travel Team', avatarUrl: null }
  },
  {
    id: 'a2',
    slug: 'zhangjiajie-national-park',
    title: 'Zhangjiajie National Park: Avatars, Cable Cars & Crowd Hacks',
    excerpt:
      'Which entrance to use, how to skip the 2-hour queue, and the exact loop that hits the glass bridge and Tianzi Mountain.',
    coverImage: cover('zhangjiajie'),
    category: { name: 'Destinations', slug: 'destinations' },
    pointCost: 15,
    isFree: false,
    isFeatured: false,
    readTimeMinutes: 15,
    viewCount: 2890,
    publishedAt: '2026-08-08T00:00:00Z',
    isUnlocked: false,
    author: { name: 'Mei Lin', avatarUrl: null }
  },
  {
    id: 'a3',
    slug: 'chengdu-food-crawl',
    title: 'Chengdu Food Crawl: 11 Stops From Breakfast to Midnight',
    excerpt:
      'Sichuan pepper, numb-and-spicy hotpot, and the hole-in-the-wall that locals actually queue for.',
    coverImage: cover('chengdu'),
    category: { name: 'Food & Drink', slug: 'food' },
    pointCost: 15,
    isFree: false,
    isFeatured: false,
    readTimeMinutes: 10,
    viewCount: 3120,
    publishedAt: '2026-08-06T00:00:00Z',
    isUnlocked: false,
    author: { name: 'Leo Zhang', avatarUrl: null }
  },
  {
    id: 'a4',
    slug: 'beijing-forbidden-city',
    title: 'Forbidden City Without the Regret: Route, Tickets & Timing',
    excerpt:
      'The 2-hour route that covers the highlights, how to buy tickets without a scalper, and the one gate everyone misses.',
    coverImage: cover('forbidden'),
    category: { name: 'Culture & History', slug: 'culture' },
    pointCost: 15,
    isFree: false,
    isFeatured: false,
    readTimeMinutes: 18,
    viewCount: 2540,
    publishedAt: '2026-08-04T00:00:00Z',
    isUnlocked: false,
    author: { name: 'China Deep Travel Team', avatarUrl: null }
  },
  {
    id: 'a5',
    slug: 'xian-dumpling-trail',
    title: 'Xi’an Dumpling Trail: A Self-Guided Tasting Walk',
    excerpt:
      'From soup dumplings to the 18-fold showcase, mapped stop-by-stop with prices in 2026 yuan.',
    coverImage: cover('xian'),
    category: { name: 'Food & Drink', slug: 'food' },
    pointCost: 15,
    isFree: false,
    isFeatured: false,
    readTimeMinutes: 8,
    viewCount: 1980,
    publishedAt: '2026-08-02T00:00:00Z',
    isUnlocked: false,
    author: { name: 'Leo Zhang', avatarUrl: null }
  },
  {
    id: 'a6',
    slug: 'high-speed-rail-101',
    title: 'China High-Speed Rail 101: Booking, Seats & Onboard Tips',
    excerpt:
      'How to book on 12306 vs. Trip.com, which seat class is worth it, and what to do when a train is sold out.',
    coverImage: cover('rail'),
    category: { name: 'Transport & Apps', slug: 'transport' },
    pointCost: 15,
    isFree: false,
    isFeatured: false,
    readTimeMinutes: 14,
    viewCount: 3670,
    publishedAt: '2026-07-30T00:00:00Z',
    isUnlocked: false,
    author: { name: 'Sam Wu', avatarUrl: null }
  },
  {
    id: 'a7',
    slug: 'guilin-li-river-cruise',
    title: 'Guilin & the Li River: Which Cruise Is Actually Worth It',
    excerpt:
      'A free, no-hype comparison of the 4-hour cruise vs. the bamboo raft, plus where to stay for the karst views.',
    coverImage: cover('guilin'),
    category: { name: 'Destinations', slug: 'destinations' },
    pointCost: 0,
    isFree: true,
    isFeatured: false,
    readTimeMinutes: 11,
    viewCount: 2210,
    publishedAt: '2026-07-28T00:00:00Z',
    isUnlocked: true,
    author: { name: 'Mei Lin', avatarUrl: null }
  },
  {
    id: 'a8',
    slug: 'shanghai-metro-guide',
    title: 'Shanghai Metro Guide for Visitors (With the One Tip That Saves Hours)',
    excerpt:
      'Which pass to get, how to pay with Alipay, and the transfer you must avoid during rush hour.',
    coverImage: cover('metro'),
    category: { name: 'Transport & Apps', slug: 'transport' },
    pointCost: 15,
    isFree: false,
    isFeatured: false,
    readTimeMinutes: 9,
    viewCount: 1740,
    publishedAt: '2026-07-25T00:00:00Z',
    isUnlocked: false,
    author: { name: 'Sam Wu', avatarUrl: null }
  },
  {
    id: 'a9',
    slug: 'hangzhou-west-lake',
    title: 'Hangzhou’s West Lake: The Half-Day Walk Locals Recommend',
    excerpt:
      'The clockwise loop that catches the light right, plus the teahouse with the view worth the detour.',
    coverImage: cover('hangzhou'),
    category: { name: 'Destinations', slug: 'destinations' },
    pointCost: 15,
    isFree: false,
    isFeatured: false,
    readTimeMinutes: 13,
    viewCount: 1530,
    publishedAt: '2026-07-22T00:00:00Z',
    isUnlocked: false,
    author: { name: 'China Deep Travel Team', avatarUrl: null }
  }
];

function detailFrom(card: ArticleCard, content: string | null): ArticleDetail {
  return {
    ...card,
    summary: card.excerpt,
    canUnlock: !card.isUnlocked && !card.isFree,
    currentPoints: DEMO_BALANCE,
    content
  };
}

const freeBody = `This is demo article content shown because the guide is **free** (or already unlocked).

## What you'll get
- A paced, realistic day-by-day plan
- Exact addresses and the 2026 prices
- Crowd-avoidance tips that actually work

> Tip: save this page -- unlocked guides stay free to re-read forever.

## Sample section
Start at the waterfront before sunset, walk inland for dinner, and keep one morning loose for the side streets you'll discover.`;

const premiumBody = freeBody + `

## Day-by-day plan

**Day 1** - Arrive mid-morning, drop bags at your hotel, walk the main avenue to get your bearings, and end with a casual dinner in the old town. Avoid the obvious tourist strip; cross one bridge and the prices drop by half.

**Day 2** - The headline attraction, but at opening time (8 AM) to beat the tour buses. Buy tickets online the night before; the on-site queue adds 60 to 90 minutes. Lunch at a spot the hotel concierge recommends, not one with English menus outside.

**Day 3** - Slow morning, a museum or garden you have been saving, then a long walk along the waterfront or through the hutong. Save the farewell dinner for somewhere with a view -- the rooftop spots fill up after 7 PM, so book ahead.

## Crowd-avoidance cheatsheet
- Go on weekday mornings if you can. Saturday is the worst at every major site.
- Buy tickets through the official WeChat mini-program, not third-party resellers.
- For photos without crowds, walk five blocks away from the entrance -- the angles still work.

## Money and logistics
- Cash: bring ~CNY 500 in small notes for street food and taxis.
- Card acceptance is improving, but Alipay / WeChat Pay is universal. Tourists can link Visa / Mastercard to Alipay now (Tour Pass).
- A Didi ride inside the third ring is usually CNY 15 to 30.

## What we wish we had known
- Skip the VIP fast-pass booths outside the entrance -- they are almost always a scam.
- The English-audio guide at the main museum is fine; the human guides at the smaller temples are far better.`;

export const demoArticleDetails: Record<string, ArticleDetail> = {
  'shanghai-3-day-itinerary': detailFrom(demoArticles[0], freeBody),
  'guilin-li-river-cruise': detailFrom(demoArticles[6], freeBody),
  'zhangjiajie-national-park': detailFrom(demoArticles[1], premiumBody),
  'chengdu-food-crawl': detailFrom(demoArticles[2], premiumBody),
  'beijing-forbidden-city': detailFrom(demoArticles[3], premiumBody),
  'xian-dumpling-trail': detailFrom(demoArticles[4], premiumBody),
  'high-speed-rail-101': detailFrom(demoArticles[5], premiumBody),
  'shanghai-metro-guide': detailFrom(demoArticles[7], premiumBody),
  'hangzhou-west-lake': detailFrom(demoArticles[8], premiumBody)
};

export const demoPackages: PointPackage[] = [
  {
    id: 'pkg-starter',
    name: 'Starter Pack',
    priceUSD: '9.99',
    pointsAmount: 300,
    badge: null,
    isPopular: false,
    bonusPoints: 0
  },
  {
    id: 'pkg-explorer',
    name: 'Explorer Pack',
    priceUSD: '19.99',
    pointsAmount: 600,
    badge: 'Most Popular',
    isPopular: true,
    bonusPoints: 60
  },
  {
    id: 'pkg-nomad',
    name: 'Nomad Pack',
    priceUSD: '49.99',
    pointsAmount: 1500,
    badge: 'Best Value',
    isPopular: false,
    bonusPoints: 200
  }
];

// Ad slots AD-01 .. AD-06. These are placeholders so the layout reserves
// the space; once the DB is connected, getActiveAds() returns real ads.
const adBanner = (seed: string, slot: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

function makeAd(slot: string, title: string, w: number, h: number): Advertisement {
  return {
    id: `ad-${slot}`,
    slot_id: slot,
    title,
    image_url: adBanner(`cpt-${slot}`, slot, w, h),
    target_url: '#',
    html_content: null,
    is_active: true,
    start_date: null,
    end_date: null,
    click_count: 0,
    priority: 1
  };
}

export const demoAds: Record<string, Advertisement | null> = {
  'AD-01': makeAd('AD-01', 'Sponsored · Top Banner', 1200, 200),
  'AD-02': makeAd('AD-02', 'Sponsored · Sidebar', 300, 600),
  'AD-03': makeAd('AD-03', 'Sponsored · In-list', 1200, 160),
  'AD-04': makeAd('AD-04', 'Sponsored · In-article', 1200, 200),
  'AD-05': makeAd('AD-05', 'Sponsored · Sidebar 2', 300, 600),
  'AD-06': makeAd('AD-06', 'Sponsored · Footer', 1200, 160)
};

// ============================================================
// User-center demo data (used only when no DB is configured)
// ============================================================
export const demoDashboardData = {
  unlockedCount: 3,
  totalSpentUSD: 19.99,
  recentTransactions: [
    { id: 't1', type: 'signup_bonus', points_delta: 20, balance_after: 20, created_at: '2026-06-01T08:05:00Z', reference_title: null },
    { id: 't2', type: 'purchase', points_delta: 600, balance_after: 620, created_at: '2026-07-15T10:00:00Z', reference_title: null },
    { id: 't3', type: 'unlock', points_delta: -15, balance_after: 605, created_at: '2026-07-20T12:00:00Z', reference_title: 'Zhangjiajie National Park' },
    { id: 't4', type: 'unlock', points_delta: -15, balance_after: 590, created_at: '2026-08-01T09:00:00Z', reference_title: 'Chengdu Food Crawl' },
    { id: 't5', type: 'unlock', points_delta: -15, balance_after: 575, created_at: '2026-08-10T14:00:00Z', reference_title: 'Beijing Forbidden City' }
  ],
  pointsByDay: (() => {
    const out: { date: string; points: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date('2026-08-28T00:00:00Z');
      d.setDate(d.getDate() - i);
      const day = 29 - i;
      const seed = (day * 7) % 13;
      const points = seed < 4 ? -(seed + 1) * 5 : seed > 9 ? (seed - 9) * 50 : 0;
      out.push({ date: d.toISOString().slice(0, 10), points });
    }
    return out;
  })()
};

export const demoHistoryTransactions = [
  { id: 't1', type: 'signup_bonus', points_delta: 20, balance_after: 20, created_at: '2026-06-01T08:05:00Z', reference_title: null },
  { id: 't2', type: 'purchase', points_delta: 600, balance_after: 620, created_at: '2026-07-15T10:00:00Z', reference_title: null, amount_usd: '19.99' },
  { id: 't3', type: 'unlock', points_delta: -15, balance_after: 605, created_at: '2026-07-20T12:00:00Z', reference_title: 'Zhangjiajie National Park' },
  { id: 't4', type: 'unlock', points_delta: -15, balance_after: 590, created_at: '2026-08-01T09:00:00Z', reference_title: 'Chengdu Food Crawl' },
  { id: 't5', type: 'unlock', points_delta: -15, balance_after: 575, created_at: '2026-08-10T14:00:00Z', reference_title: 'Beijing Forbidden City' },
  { id: 't6', type: 'unlock', points_delta: -15, balance_after: 560, created_at: '2026-08-15T11:00:00Z', reference_title: "Xi'an Dumpling Trail" },
  { id: 't7', type: 'refund', points_delta: 15, balance_after: 575, created_at: '2026-08-18T16:00:00Z', reference_title: null },
  { id: 't8', type: 'unlock', points_delta: -15, balance_after: 560, created_at: '2026-08-22T13:00:00Z', reference_title: 'Hangzhou West Lake' }
];

export const demoUnlockedArticles = [
  { id: 'a2', slug: 'zhangjiajie-national-park', title: 'Zhangjiajie National Park: Avatars, Cable Cars & Crowd Hacks', excerpt: 'Which entrance to use, how to skip the 2-hour queue, and the exact loop that hits the glass bridge and Tianzi Mountain.', cover_image_url: cover('zhangjiajie'), point_cost: 15, read_time_minutes: 15, category_name: 'Destinations', category_slug: 'destinations', unlocked_at: '2026-07-20T12:00:00Z' },
  { id: 'a3', slug: 'chengdu-food-crawl', title: 'Chengdu Food Crawl: 11 Stops From Breakfast to Midnight', excerpt: 'Sichuan pepper, numb-and-spicy hotpot, and the hole-in-the-wall that locals actually queue for.', cover_image_url: cover('chengdu'), point_cost: 15, read_time_minutes: 10, category_name: 'Food & Drink', category_slug: 'food', unlocked_at: '2026-08-01T09:00:00Z' },
  { id: 'a4', slug: 'beijing-forbidden-city', title: 'Forbidden City Without the Regret: Route, Tickets & Timing', excerpt: 'The 2-hour route that covers the highlights, how to buy tickets without a scalper, and the one gate everyone misses.', cover_image_url: cover('forbidden'), point_cost: 15, read_time_minutes: 18, category_name: 'Culture & History', category_slug: 'culture', unlocked_at: '2026-08-10T14:00:00Z' }
];

// ============================================================
// Admin demo data (used only when no DB is configured)
// ============================================================
export const demoAdminArticles = demoArticles.map((a) => ({
  id: a.id,
  title: a.title,
  category_name: a.category?.name || null,
  status: a.isFree ? 'published' : 'published',
  point_cost: a.pointCost,
  is_free: a.isFree,
  view_count: a.viewCount,
  updated_at: a.publishedAt
}));

export const demoUsers: any[] = [
  { id: 'u1', name: 'Alex Traveler', email: 'traveler@demo.com', role: 'user', current_points: 320, email_verified: true, is_suspended: false, unlocked_count: 3, created_at: '2026-06-01T08:00:00Z' },
  { id: 'u2', name: 'Mei Lin', email: 'mei@demo.com', role: 'user', current_points: 145, email_verified: true, is_suspended: false, unlocked_count: 1, created_at: '2026-06-12T10:30:00Z' },
  { id: 'u3', name: 'Leo Zhang', email: 'leo@demo.com', role: 'user', current_points: 60, email_verified: true, is_suspended: false, unlocked_count: 1, created_at: '2026-07-02T14:15:00Z' },
  { id: 'u4', name: 'Sam Wu', email: 'sam@demo.com', role: 'editor', current_points: 980, email_verified: true, is_suspended: false, unlocked_count: 5, created_at: '2026-05-20T09:00:00Z' },
  { id: 'u5', name: 'Spam Bot', email: 'spam@bad.com', role: 'user', current_points: 0, email_verified: false, is_suspended: true, unlocked_count: 0, created_at: '2026-08-25T03:00:00Z' }
];

export const demoOrders: any[] = [
  { id: 'o1', order_number: 'CPT-1', user_id: 'u1', user_email: 'traveler@demo.com', amount_usd: '19.99', points_awarded: 660, status: 'completed', provider: 'mock', paid_at: '2026-07-15T10:00:00Z', created_at: '2026-07-15T10:00:00Z' },
  { id: 'o2', order_number: 'CPT-2', user_id: 'u3', user_email: 'leo@demo.com', amount_usd: '9.99', points_awarded: 150, status: 'completed', provider: 'mock', paid_at: '2026-07-22T11:20:00Z', created_at: '2026-07-22T11:20:00Z' },
  { id: 'o3', order_number: 'CPT-3', user_id: 'u4', user_email: 'sam@demo.com', amount_usd: '49.99', points_awarded: 1700, status: 'completed', provider: 'mock', paid_at: '2026-08-01T09:00:00Z', created_at: '2026-08-01T09:00:00Z' },
  { id: 'o4', order_number: 'CPT-4', user_id: 'u2', user_email: 'mei@demo.com', amount_usd: '15.00', points_awarded: 450, status: 'pending', provider: 'mock', paid_at: null, created_at: '2026-08-20T16:40:00Z' },
  { id: 'o5', order_number: 'CPT-5', user_id: 'u1', user_email: 'traveler@demo.com', amount_usd: '5.00', points_awarded: 150, status: 'refunded', provider: 'mock', paid_at: '2026-08-21T08:00:00Z', created_at: '2026-08-21T08:00:00Z' },
  { id: 'o6', order_number: 'CPT-6', user_id: 'u3', user_email: 'leo@demo.com', amount_usd: '30.00', points_awarded: 900, status: 'failed', provider: 'mock', paid_at: null, created_at: '2026-08-26T12:05:00Z' }
];

export const demoAdSlots: any[] = [
  { id: 's1', slot_code: 'AD-01', slot_name: 'Homepage Hero Banner', width: 970, height: 250, is_mobile_hidden: false, position: 1, ads: [demoAds['AD-01']] },
  { id: 's2', slot_code: 'AD-02', slot_name: 'Guides Sidebar (Desktop)', width: 300, height: 600, is_mobile_hidden: true, position: 2, ads: [demoAds['AD-02']] },
  { id: 's3', slot_code: 'AD-03', slot_name: 'Article Inline', width: 728, height: 90, is_mobile_hidden: false, position: 3, ads: [demoAds['AD-03']] },
  { id: 's4', slot_code: 'AD-04', slot_name: 'Article Footer', width: 728, height: 90, is_mobile_hidden: false, position: 4, ads: [demoAds['AD-04']] },
  { id: 's5', slot_code: 'AD-05', slot_name: 'Guide List Sidebar (Desktop)', width: 300, height: 250, is_mobile_hidden: true, position: 5, ads: [demoAds['AD-05']] },
  { id: 's6', slot_code: 'AD-06', slot_name: 'Footer Banner', width: 970, height: 90, is_mobile_hidden: false, position: 6, ads: [demoAds['AD-06']] }
];

// ============================================================
// Comments (in-memory demo store; mirrors the `comments` table)
// ============================================================
type DemoComment = {
  id: string;
  articleSlug: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  parentId: string | null;
  createdAt: string;
};
const demoCommentsStore: DemoComment[] = [
  { id: 'dc1', articleSlug: 'forbidden-city-complete-guide', userId: 'u2', userName: 'Mei Lin', userAvatar: null, content: 'The 8 AM tip saved me — walked straight in while the tour buses lined up. Thanks!', parentId: null, createdAt: '2026-08-12T09:30:00Z' },
  { id: 'dc2', articleSlug: 'forbidden-city-complete-guide', userId: 'u3', userName: 'Leo Zhang', userAvatar: null, content: 'Agreed — buying the ticket on the WeChat mini-program the night before was painless.', parentId: 'dc1', createdAt: '2026-08-12T10:05:00Z' },
  { id: 'dc3', articleSlug: 'shanghai-food', userId: 'u4', userName: 'Sam Wu', userAvatar: null, content: 'Nanxiang soup dumplings are worth the queue. Go on a weekday morning.', parentId: null, createdAt: '2026-08-20T12:00:00Z' }
];

export function demoCommentsBySlug(slug: string): Comment[] {
  const rows = demoCommentsStore.filter((c) => c.articleSlug === slug);
  const map = new Map<string, Comment>();
  for (const c of rows) {
    map.set(c.id, { id: c.id, articleId: 'demo', userId: c.userId, userName: c.userName,
      userAvatar: c.userAvatar, content: c.content, createdAt: c.createdAt, parentId: c.parentId,
      status: 'published', replies: [] });
  }
  const roots: Comment[] = [];
  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      const parent = map.get(node.parentId)!;
      (parent.replies ?? (parent.replies = [])).push(node);
    } else roots.push(node);
  }
  return roots;
}

export function addDemoComment(input: { articleSlug: string; userId: string; userName: string; userAvatar: string | null; content: string; parentId?: string | null }): Comment {
  const id = 'dc-' + Math.random().toString(36).slice(2, 10);
  const c: DemoComment = { id, articleSlug: input.articleSlug, userId: input.userId, userName: input.userName,
    userAvatar: input.userAvatar, content: input.content, parentId: input.parentId ?? null, createdAt: new Date().toISOString() };
  demoCommentsStore.push(c);
  return { id, articleId: 'demo', userId: c.userId, userName: c.userName, userAvatar: c.userAvatar,
    content: c.content, createdAt: c.createdAt, parentId: c.parentId, status: 'published', replies: [] };
}

export function deleteDemoComment(id: string): void {
  const i = demoCommentsStore.findIndex((c) => c.id === id);
  if (i >= 0) demoCommentsStore.splice(i, 1);
}
