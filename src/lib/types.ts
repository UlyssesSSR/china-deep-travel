// ============================================================
// Shared TypeScript types — mirror the PostgreSQL schema
// ============================================================

export type UserRole = 'user' | 'editor' | 'admin';
export type OrderStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type TransactionType =
  | 'purchase'
  | 'unlock'
  | 'refund'
  | 'admin_adjustment'
  | 'signup_bonus';
export type ArticleStatus = 'draft' | 'pending_review' | 'published' | 'archived';
export type PaymentProvider = 'stripe' | 'paypal';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: UserRole;
  email_verified: boolean;
  is_suspended: boolean;
  current_points: number;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  currentPoints: number;
  emailVerified: boolean;
  memberSince: string;
  stats?: UserStats;
}

export interface UserStats {
  articlesUnlocked: number;
  totalSpentUSD: number;
  totalPointsSpent: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  article_count: number;
  sort_order: number;
  is_active: boolean;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string | null;
  cover_image_url: string | null;
  category_id: string | null;
  point_cost: number;
  is_free: boolean;
  is_featured: boolean;
  status: ArticleStatus;
  read_time_minutes: number | null;
  tags: string[] | null;
  view_count: number;
  unlock_count: number;
  author_id: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Article as shown in listings / detail (never leaks full content unless unlocked) */
export interface ArticleCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  category: { name: string; slug: string } | null;
  pointCost: number;
  isFree: boolean;
  isFeatured: boolean;
  readTimeMinutes: number | null;
  viewCount: number;
  publishedAt: string | null;
  isUnlocked: boolean;
  author?: { name: string; avatarUrl: string | null } | null;
}

export interface ArticleDetail extends ArticleCard {
  summary: string;
  canUnlock: boolean;
  currentPoints: number;
  content?: string | null;
}

export interface PointPackage {
  id: string;
  name: string;
  priceUSD: string;
  pointsAmount: number;
  badge: string | null;
  isPopular: boolean;
  bonusPoints: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  package_id: string | null;
  provider: PaymentProvider;
  amount_usd: number;
  points_awarded: number;
  status: OrderStatus;
  paid_at: string | null;
  created_at: string;
}

export interface PointTransaction {
  id: string;
  type: TransactionType;
  pointsDelta: number;
  balanceAfter: number;
  reference: {
    type: 'article' | 'order' | 'admin' | 'signup';
    id?: string;
    title?: string;
    amountUSD?: string;
  } | null;
  createdAt: string;
}

export interface Comment {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  createdAt: string;
  parentId: string | null;
  status: 'published' | 'hidden';
  replies?: Comment[];
}

export interface AdSlot {
  id: string;
  slot_code: string;
  slot_name: string;
  width: number | null;
  height: number | null;
  is_mobile_hidden: boolean;
}

export interface Advertisement {
  id: string;
  slot_id: string;
  title: string;
  image_url: string | null;
  target_url: string | null;
  html_content: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  click_count: number;
  priority: number;
}

export interface SiteStats {
  totalUsers: number;
  totalArticles: number;
  pointsInCirculation: number;
  revenueThisMonthUSD: number;
  revenueTotalUSD: number;
  totalOrders: number;
  ordersThisMonth: number;
  pointsSpentOnUnlocks: number;
  revenueByDay: { date: string; revenue: number; orders: number }[];
  topArticles: { title: string; slug: string; unlockCount: number; views: number }[];
  topArticlesByPoints: { title: string; slug: string; pointsConsumed: number; unlocks: number }[];
  newUsersByDay: { date: string; users: number }[];
}

/** Shape of the JWT payload */
export interface SessionPayload {
  userId: string;
  role: UserRole;
  email: string;
}
