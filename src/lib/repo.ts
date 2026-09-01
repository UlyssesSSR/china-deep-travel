import { randomUUID } from 'crypto';
import { db } from './db';
import { DEMO, demoCategories, demoArticles, demoArticleDetails, demoPackages, demoAds, DEMO_BALANCE, demoUsers, demoOrders, demoAdSlots, demoAdminArticles, demoCommentsBySlug, addDemoComment, deleteDemoComment } from './demo';
import type {
  Article,
  ArticleCard,
  ArticleDetail,
  Category,
  PointPackage,
  Advertisement,
  AdSlot,
  SiteStats,
  Comment
} from './types';
import { isArticleUnlocked } from './points';
export { awardPoints, deductPoints } from './points';

// ============================================================
// Categories
// ============================================================
export async function getCategories(): Promise<Category[]> {
  if (DEMO) return demoCategories;
  const { rows } = await db.query<Category>(
    'SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC'
  );
  return rows;
}

// ============================================================
// Articles — public listing
// ============================================================
interface ListParams {
  category?: string | null;
  cost?: 'free' | 'paid' | 'all';
  sort?: string;
  page?: number;
  limit: number;
  offset: number;
}

export async function getPublishedArticles(params: ListParams): Promise<{
  articles: ArticleCard[];
  total: number;
}> {
  if (DEMO) {
    let articles = demoArticles;
    if (params.category) articles = articles.filter((a) => a.category?.slug === params.category);
    if (params.cost === 'free') articles = articles.filter((a) => a.isFree);
    if (params.cost === 'paid') articles = articles.filter((a) => !a.isFree);
    if (params.sort === 'popular' || params.sort === 'trending')
      articles = [...articles].sort((a, b) => b.viewCount - a.viewCount);
    return { articles, total: articles.length };
  }
  const where: string[] = ['a.status = ?'];
  const values: any[] = ['published'];
  let idx = 2;

  if (params.category) {
    where.push(`a.category_id = (SELECT id FROM categories WHERE slug = ?)`);
    values.push(params.category);
    idx++;
  }
  if (params.cost === 'free') where.push(`a.is_free = 1`);
  if (params.cost === 'paid') where.push(`a.is_free = 0`);

  const orderBy =
    params.sort === 'popular'
      ? 'a.view_count DESC'
      : params.sort === 'trending'
        ? 'a.unlock_count DESC, a.view_count DESC'
        : 'a.published_at DESC';

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countRes = await db.query<{ count: number }>(
    `SELECT COUNT(*) AS count FROM articles a ${whereSql}`,
    values
  );
  const total = parseInt(String(countRes.rows[0]?.count || '0'), 10);

  const listRes = await db.query<any>(
    `SELECT a.*, c.name AS category_name, c.slug AS category_slug,
            u.name AS author_name, u.avatar_url AS author_avatar
     FROM articles a
     LEFT JOIN categories c ON a.category_id = c.id
     LEFT JOIN users u ON a.author_id = u.id
     ${whereSql}
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    [...values, params.limit, params.offset]
  );

  const articles = listRes.rows.map((r) => mapArticleCard(r, false));
  return { articles, total };
}

export function mapArticleCard(row: any, isUnlocked: boolean): ArticleCard {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImage: row.cover_image_url,
    category: row.category_slug
      ? { name: row.category_name, slug: row.category_slug }
      : null,
    pointCost: row.point_cost,
    isFree: !!row.is_free,
    isFeatured: !!row.is_featured,
    readTimeMinutes: row.read_time_minutes,
    viewCount: row.view_count,
    publishedAt: row.published_at,
    isUnlocked,
    author: row.author_name
      ? { name: row.author_name, avatarUrl: row.author_avatar }
      : null
  };
}

// ============================================================
// Articles — detail (with SERVER-SIDE unlock logic)
// ------------------------------------------------------------
// The paywall is enforced here, not in the UI. `content` is only ever present
// in the response when the article is free OR the caller has unlocked it.
// ============================================================
export async function getArticleBySlug(
  slug: string,
  userId?: string
): Promise<ArticleDetail | null> {
  if (DEMO) {
    const base = demoArticleDetails[slug];
    if (!base) return null;
    // Re-apply unlock state against the live in-memory store so users can
    // unlock (and re-view) articles without MySQL.
    const { isDemoUnlocked, getDemoBalance } = await import('./demo');
    const a: any = (await import('./demo')).demoArticles.find((x: any) => x.slug === slug);
    const isFree = !!(a?.isFree ?? base.isFree);
    const unlocked = isFree || !!(userId && a && isDemoUnlocked(userId, a.id));
    const balance = userId ? getDemoBalance(userId) : 0;
    return {
      ...base,
      isUnlocked: unlocked,
      isFree,
      canUnlock: !unlocked && !isFree,
      currentPoints: balance,
      pointCost: a?.pointCost ?? base.pointCost,
      content: unlocked ? base.content : null,
    };
  }
  const { rows } = await db.query<any>(
    `SELECT a.*, c.name AS category_name, c.slug AS category_slug,
            u.name AS author_name, u.avatar_url AS author_avatar
     FROM articles a
     LEFT JOIN categories c ON a.category_id = c.id
     LEFT JOIN users u ON a.author_id = u.id
     WHERE a.slug = ? LIMIT 1`,
    [slug]
  );
  const row = rows[0];
  if (!row) return null;

  const unlocked = !!row.is_free || (userId ? await isArticleUnlocked(userId, row.id) : false);

  const card = mapArticleCard(row, unlocked);
  const balance = userId ? await getUserPoints(userId) : 0;

  const detail: ArticleDetail = {
    ...card,
    summary: row.excerpt,
    canUnlock: !unlocked && !row.is_free,
    currentPoints: balance,
    content: unlocked ? row.content : null
  };
  return detail;
}

export async function getUserPoints(userId: string): Promise<number> {
  if (DEMO) return DEMO_BALANCE;
  const { rows } = await db.query<{ current_points: number }>(
    'SELECT current_points FROM users WHERE id = ?',
    [userId]
  );
  return rows[0]?.current_points ?? 0;
}

export async function incrementViewCount(articleId: string) {
  if (DEMO) return;
  await db.query('UPDATE articles SET view_count = view_count + 1 WHERE id = ?', [articleId]);
}

// ============================================================
// Point packages (public)
// ============================================================
export async function getPackages(): Promise<PointPackage[]> {
  if (DEMO) return demoPackages;
  const { rows } = await db.query<any>(
    `SELECT id, name, price_usd, points_amount, bonus_points, badge,
            ((badge IS NOT NULL AND LOWER(badge) LIKE '%popular%') OR LOWER(name) LIKE '%explorer%') AS is_popular
     FROM point_packages WHERE is_active = 1 ORDER BY sort_order ASC`
  );
  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    priceUSD: r.price_usd.toString(),
    pointsAmount: r.points_amount + (r.bonus_points || 0),
    badge: r.badge,
    isPopular: !!r.is_popular,
    bonusPoints: r.bonus_points || 0
  }));
}

// ============================================================
// Ads — active per slot
// ============================================================
export async function getActiveAds(): Promise<Record<string, Advertisement | null>> {
  if (DEMO) return demoAds;
  const { rows } = await db.query<Advertisement>(
    `SELECT ad.* FROM advertisements ad
     JOIN ad_slots s ON ad.slot_id = s.id
     WHERE ad.is_active = 1
       AND (ad.start_date IS NULL OR ad.start_date <= CURDATE())
       AND (ad.end_date IS NULL OR ad.end_date >= CURDATE())
     ORDER BY s.position, ad.priority DESC`
  );
  const result: Record<string, Advertisement | null> = {};
  for (const ad of rows) {
    const slot = await db.query<AdSlot>('SELECT slot_code FROM ad_slots WHERE id = ?', [ad.slot_id]);
    const code = slot.rows[0]?.slot_code;
    if (code && !result[code]) result[code] = ad;
  }
  const slots = await db.query<AdSlot>('SELECT slot_code FROM ad_slots ORDER BY position');
  for (const s of slots.rows) if (!(s.slot_code in result)) result[s.slot_code] = null;
  return result;
}

export async function recordAdImpression(adId: string, _userId?: string) {
  if (DEMO) return;
  await db.query('UPDATE advertisements SET impression_count = impression_count + 1 WHERE id = ?', [adId]);
}

// ============================================================
// Admin — orders (list / export)
// ============================================================
export async function getAdminOrders(opts: {
  status?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}): Promise<{ orders: any[]; total: number }> {
  if (DEMO) {
    const from = opts.from;
    const to = opts.to;
    let orders = [...demoOrders];
    if (opts.status) orders = orders.filter((o: any) => o.status === opts.status);
    if (from) orders = orders.filter((o: any) => o.created_at >= from);
    if (to) orders = orders.filter((o: any) => o.created_at <= to + 'T23:59:59.999Z');
    orders.sort((a: any, b: any) => (a.created_at < b.created_at ? 1 : -1));
    const total = orders.length;
    const limit = opts.limit ?? 100;
    const offset = opts.offset ?? 0;
    return { orders: orders.slice(offset, offset + limit), total };
  }
  const where: string[] = [];
  const values: any[] = [];
  if (opts.status) { where.push('o.status = ?'); values.push(opts.status); }
  if (opts.from) { where.push('o.created_at >= ?'); values.push(opts.from); }
  if (opts.to) { where.push('o.created_at <= ?'); values.push(opts.to + ' 23:59:59'); }
  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const countRes = await db.query<{ count: number }>(
    `SELECT COUNT(*) AS count FROM orders o ${whereSql}`,
    values
  );
  const total = parseInt(String(countRes.rows[0]?.count || '0'), 10);
  const listRes = await db.query<any>(
    `SELECT o.*, u.email AS user_email
     FROM orders o LEFT JOIN users u ON o.user_id = u.id
     ${whereSql} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
    [...values, opts.limit ?? 100, opts.offset ?? 0]
  );
  return { orders: listRes.rows, total };
}

// ============================================================
// Admin — ad slots (with their ads)
// ============================================================
export async function getAdSlotsWithAds(): Promise<any[]> {
  if (DEMO) return demoAdSlots;
  const { rows: slots } = await db.query<any>('SELECT * FROM ad_slots ORDER BY position ASC');
  if (slots.length === 0) return [];
  const { rows: ads } = await db.query<any>(
    'SELECT * FROM advertisements WHERE slot_id IN (?) ORDER BY priority DESC',
    [slots.map((s: any) => s.id)]
  );
  const bySlot: Record<string, any[]> = {};
  for (const ad of ads) (bySlot[ad.slot_id] ||= []).push(ad);
  return slots.map((s: any) => ({ ...s, ads: bySlot[s.id] || [] }));
}

// ============================================================
// Stats (admin dashboard)
// ============================================================
export async function getStats(): Promise<SiteStats> {
  if (DEMO) {
    return {
      totalUsers: demoUsers.length,
      totalArticles: demoArticles.length,
      pointsInCirculation: demoUsers.reduce((s: number, u: any) => s + (u.current_points || 0), 0),
      revenueThisMonthUSD: 3240.5,
      revenueTotalUSD: 5500.0,
      totalOrders: demoOrders.length,
      ordersThisMonth: demoOrders.filter((o: any) => o.status === 'completed').length,
      pointsSpentOnUnlocks: 60,
      revenueByDay: [],
      topArticles: demoArticles.slice(0, 5).map((a) => ({
        title: a.title,
        slug: a.slug,
        unlockCount: a.viewCount,
        views: a.viewCount
      })),
      topArticlesByPoints: demoArticles.slice(0, 5).map((a) => ({
        title: a.title,
        slug: a.slug,
        pointsConsumed: a.isFree ? 0 : a.pointCost,
        unlocks: a.viewCount
      })),
      newUsersByDay: []
    };
  }
  const users = await db.query<{ count: number }>('SELECT COUNT(*) AS count FROM users');
  const articles = await db.query<{ count: number }>(
    "SELECT COUNT(*) AS count FROM articles WHERE status = 'published'"
  );
  const pts = await db.query<{ sum: number | null }>('SELECT SUM(current_points) AS sum FROM users');
  const rev = await db.query<{ sum: number | null }>(
    "SELECT SUM(amount_usd) AS sum FROM orders WHERE status = 'completed' AND paid_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')"
  );
  const revTotal = await db.query<{ sum: number | null }>(
    "SELECT SUM(amount_usd) AS sum FROM orders WHERE status = 'completed'"
  );
  const ordersCnt = await db.query<{ count: number }>('SELECT COUNT(*) AS count FROM orders');
  const ordersMonth = await db.query<{ count: number }>(
    "SELECT COUNT(*) AS count FROM orders WHERE status = 'completed' AND paid_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')"
  );
  const spent = await db.query<{ sum: number | null }>(
    "SELECT SUM(ABS(points_delta)) AS sum FROM point_transactions WHERE type = 'unlock'"
  );
  const byDay = await db.query<any>(
    `SELECT DATE(paid_at) AS date, SUM(amount_usd) AS revenue, COUNT(*) AS orders
     FROM orders WHERE status = 'completed' AND paid_at >= NOW() - INTERVAL 30 DAY
     GROUP BY 1 ORDER BY 1 DESC`
  );
  const top = await db.query<any>(
    `SELECT title, slug, unlock_count, view_count FROM articles
     WHERE status = 'published' ORDER BY unlock_count DESC LIMIT 10`
  );
  const topPts = await db.query<any>(
    `SELECT a.title, a.slug, a.unlock_count AS unlocks,
            COALESCE(SUM(ABS(pt.points_delta)), 0) AS points_consumed
     FROM articles a
     LEFT JOIN point_transactions pt ON pt.reference_id = a.id AND pt.type = 'unlock'
     WHERE a.status = 'published'
     GROUP BY a.id
     ORDER BY points_consumed DESC, a.unlock_count DESC
     LIMIT 10`
  );
  const newUsers = await db.query<any>(
    `SELECT DATE(created_at) AS date, COUNT(*) AS users
     FROM users WHERE created_at >= NOW() - INTERVAL 30 DAY
     GROUP BY 1 ORDER BY 1 DESC`
  );

  return {
    totalUsers: parseInt(String(users.rows[0]?.count || '0'), 10),
    totalArticles: parseInt(String(articles.rows[0]?.count || '0'), 10),
    pointsInCirculation: parseInt(String(pts.rows[0]?.sum || '0'), 10),
    revenueThisMonthUSD: parseFloat(String(rev.rows[0]?.sum || '0')),
    revenueTotalUSD: parseFloat(String(revTotal.rows[0]?.sum || '0')),
    totalOrders: parseInt(String(ordersCnt.rows[0]?.count || '0'), 10),
    ordersThisMonth: parseInt(String(ordersMonth.rows[0]?.count || '0'), 10),
    pointsSpentOnUnlocks: parseInt(String(spent.rows[0]?.sum || '0'), 10),
    revenueByDay: byDay.rows.map((r: any) => ({
      date: r.date,
      revenue: parseFloat(r.revenue || 0),
      orders: parseInt(r.orders, 10)
    })),
    topArticles: top.rows.map((r: any) => ({
      title: r.title,
      slug: r.slug,
      unlockCount: r.unlock_count,
      views: r.view_count
    })),
    topArticlesByPoints: topPts.rows.map((r: any) => ({
      title: r.title,
      slug: r.slug,
      pointsConsumed: parseInt(r.points_consumed || '0', 10),
      unlocks: r.unlocks
    })),
    newUsersByDay: newUsers.rows.map((r: any) => ({
      date: r.date,
      users: parseInt(r.users, 10)
    }))
  };
}

// ============================================================
// Admin — articles CRUD
// ============================================================
export interface ArticleInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string | null;
  categoryId?: string | null;
  pointCost?: number;
  isFree?: boolean;
  isFeatured?: boolean;
  status?: Article['status'];
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
}

export async function listArticlesAdmin(opts: {
  status?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  offset?: number;
}): Promise<{ articles: any[]; total: number }> {
  if (DEMO) return { articles: demoAdminArticles, total: demoAdminArticles.length };
  const where: string[] = [];
  const values: any[] = [];
  let idx = 1;
  if (opts.status) {
    where.push(`a.status = ?`);
    values.push(opts.status);
  }
  if (opts.category) {
    where.push(`a.category_id = (SELECT id FROM categories WHERE slug = ?)`);
    values.push(opts.category);
    idx++;
  }
  if (opts.search) {
    where.push(`(a.title LIKE ? OR a.excerpt LIKE ?)`);
    values.push(`%${opts.search}%`, `%${opts.search}%`);
    idx += 2;
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const count = await db.query<{ count: number }>(
    `SELECT COUNT(*) AS count FROM articles a ${whereSql}`,
    values
  );
  const list = await db.query<any>(
    `SELECT a.*, c.name AS category_name FROM articles a
     LEFT JOIN categories c ON a.category_id = c.id
     ${whereSql} ORDER BY a.updated_at DESC LIMIT ? OFFSET ?`,
    [...values, opts.limit ?? 24, opts.offset ?? 0]
  );
  return { articles: list.rows, total: parseInt(String(count.rows[0]?.count || '0'), 10) };
}

export async function createArticle(input: ArticleInput, authorId: string) {
  const id = randomUUID();
  await db.query<any>(
    `INSERT INTO articles
      (id, title, slug, excerpt, content, cover_image_url, category_id, point_cost, is_free,
       is_featured, status, tags, meta_title, meta_description, author_id, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CASE WHEN ? = 'published' THEN NOW() ELSE NULL END)`,
    [
      id,
      input.title,
      input.slug,
      input.excerpt,
      input.content,
      input.coverImageUrl ?? null,
      input.categoryId ?? null,
      input.pointCost ?? 15,
      input.isFree ?? false,
      input.isFeatured ?? false,
      input.status ?? 'draft',
      JSON.stringify(input.tags ?? []),
      input.metaTitle ?? null,
      input.metaDescription ?? null,
      authorId,
      input.status ?? 'draft'
    ]
  );
  const { rows } = await db.query<any>('SELECT * FROM articles WHERE id = ?', [id]);
  return rows[0];
}

export async function updateArticle(id: string, input: Partial<ArticleInput>) {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  const set = (col: string, val: any) => {
    fields.push(`${col} = ?`);
    values.push(val);
    idx++;
  };
  if (input.title !== undefined) set('title', input.title);
  if (input.slug !== undefined) set('slug', input.slug);
  if (input.excerpt !== undefined) set('excerpt', input.excerpt);
  if (input.content !== undefined) set('content', input.content);
  if (input.coverImageUrl !== undefined) set('cover_image_url', input.coverImageUrl);
  if (input.categoryId !== undefined) set('category_id', input.categoryId);
  if (input.pointCost !== undefined) set('point_cost', input.pointCost);
  if (input.isFree !== undefined) set('is_free', input.isFree);
  if (input.isFeatured !== undefined) set('is_featured', input.isFeatured);
  if (input.status !== undefined) {
    set('status', input.status);
    if (input.status === 'published') fields.push(`published_at = COALESCE(published_at, NOW())`);
  }
  if (input.tags !== undefined) set('tags', JSON.stringify(input.tags));
  if (input.metaTitle !== undefined) set('meta_title', input.metaTitle);
  if (input.metaDescription !== undefined) set('meta_description', input.metaDescription);
  set('updated_at', new Date());

  values.push(id);
  await db.query<any>(`UPDATE articles SET ${fields.join(', ')} WHERE id = ?`, values);
  const { rows } = await db.query<any>('SELECT * FROM articles WHERE id = ?', [id]);
  return rows[0];
}

export async function archiveArticle(id: string) {
  await db.query("UPDATE articles SET status = 'archived', updated_at = NOW() WHERE id = ?", [id]);
}

// ============================================================
// Admin — users
// ============================================================
export async function listUsers(opts: {
  search?: string;
  page?: number;
  limit?: number;
  offset?: number;
}): Promise<{ users: any[]; total: number }> {
  if (DEMO) return { users: demoUsers, total: demoUsers.length };
  const where: string[] = [];
  const values: any[] = [];
  if (opts.search) {
    where.push(`(u.name LIKE ? OR u.email LIKE ?)`);
    values.push(`%${opts.search}%`, `%${opts.search}%`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const count = await db.query<{ count: number }>(
    `SELECT COUNT(*) AS count FROM users u ${whereSql}`,
    values
  );
  const list = await db.query<any>(
    `SELECT u.id, u.name, u.email, u.role, u.current_points, u.email_verified,
            u.is_suspended, u.created_at,
            (SELECT COUNT(*) FROM user_unlocked_articles ua WHERE ua.user_id = u.id) AS unlocked_count
    FROM users u ${whereSql} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
    [...values, opts.limit ?? 24, opts.offset ?? 0]
  );
  return { users: list.rows, total: parseInt(String(count.rows[0]?.count || '0'), 10) };
}

// ============================================================
// Comments
// ============================================================
function mapCommentRow(r: any): Comment {
  return {
    id: r.id,
    articleId: r.article_id,
    userId: r.user_id,
    userName: r.user_name,
    userAvatar: r.user_avatar,
    content: r.content,
    createdAt: r.created_at,
    parentId: r.parent_id,
    status: r.status === 'hidden' ? 'hidden' : 'published',
    replies: []
  };
}

function buildCommentTree(rows: any[]): Comment[] {
  const map = new Map<string, Comment>();
  for (const r of rows) map.set(r.id, mapCommentRow(r));
  const roots: Comment[] = [];
  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) map.get(node.parentId)!.replies!.push(node);
    else roots.push(node);
  }
  return roots;
}

export async function getArticleIdBySlug(slug: string): Promise<string | null> {
  if (DEMO) {
    const a = demoArticles.find((x) => x.slug === slug);
    return a ? a.id : null;
  }
  const { rows } = await db.query<{ id: string }>(
    'SELECT id FROM articles WHERE slug = ? LIMIT 1',
    [slug]
  );
  return rows[0]?.id ?? null;
}

export async function getCommentsByArticleSlug(slug: string): Promise<Comment[]> {
  if (DEMO) return demoCommentsBySlug(slug);
  const { rows } = await db.query<any>(
    `SELECT c.id, c.article_id, c.user_id, c.parent_id, c.content, c.status, c.created_at,
            u.name AS user_name, u.avatar_url AS user_avatar
     FROM comments c
     JOIN articles a ON c.article_id = a.id
     JOIN users u ON c.user_id = u.id
     WHERE a.slug = ? AND c.status = 'published'
     ORDER BY c.created_at ASC`,
    [slug]
  );
  return buildCommentTree(rows);
}

export async function getCommentById(id: string): Promise<{ id: string; userId: string; articleId: string; status: string } | null> {
  if (DEMO) {
    // Demo comments use synthetic ids; ownership check is best-effort.
    return { id, userId: 'demo-user', articleId: 'demo', status: 'published' };
  }
  const { rows } = await db.query<{ id: string; user_id: string; article_id: string; status: string }>(
    'SELECT id, user_id, article_id, status FROM comments WHERE id = ? LIMIT 1',
    [id]
  );
  const r = rows[0];
  return r ? { id: r.id, userId: r.user_id, articleId: r.article_id, status: r.status } : null;
}

export async function addComment(input: {
  articleId: string;
  userId: string;
  content: string;
  parentId?: string | null;
}): Promise<Comment> {
  if (DEMO) {
    const u = demoUsers.find((x) => x.id === input.userId);
    return addDemoComment({
      articleSlug: '',
      userId: input.userId,
      userName: u?.name ?? 'Traveler',
      userAvatar: null,
      content: input.content,
      parentId: input.parentId ?? null
    });
  }
  const id = randomUUID();
  await db.query(
    `INSERT INTO comments (id, article_id, user_id, parent_id, content, status)
     VALUES (?, ?, ?, ?, ?, 'published')`,
    [id, input.articleId, input.userId, input.parentId ?? null, input.content]
  );
  const { rows } = await db.query<any>(
    `SELECT c.id, c.article_id, c.user_id, c.parent_id, c.content, c.status, c.created_at,
            u.name AS user_name, u.avatar_url AS user_avatar
     FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ? LIMIT 1`,
    [id]
  );
  return mapCommentRow(rows[0]);
}

export async function deleteComment(id: string): Promise<void> {
  if (DEMO) {
    deleteDemoComment(id);
    return;
  }
  await db.query('DELETE FROM comments WHERE id = ?', [id]);
}
