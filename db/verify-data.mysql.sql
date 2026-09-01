-- 快速验证脚本
-- 运行此脚本检查数据是否导入成功

USE cpt;

-- 1. 用户统计
SELECT
  '👥 用户' as Category,
  COUNT(*) as Total,
  SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as Admins,
  SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as Users,
  AVG(current_points) as AvgPoints
FROM users;

-- 2. 文章统计
SELECT
  '📝 文章' as Category,
  COUNT(*) as Total,
  SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as Published,
  SUM(CASE WHEN is_free = true THEN 1 ELSE 0 END) as Free,
  SUM(CASE WHEN is_featured = true THEN 1 ELSE 0 END) as Featured,
  AVG(point_cost) as AvgCost
FROM articles;

-- 3. 文章分类统计
SELECT
  c.name as Category,
  COUNT(a.id) as Articles,
  SUM(a.view_count) as Views
FROM categories c
LEFT JOIN articles a ON c.id = a.category_id AND a.status = 'published'
GROUP BY c.id
ORDER BY Articles DESC;

-- 4. 订单统计
SELECT
  '💰 订单' as Category,
  COUNT(*) as Total,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as Completed,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as Pending,
  SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) as Refunded,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as Failed,
  CONCAT('$', ROUND(SUM(CASE WHEN status = 'completed' THEN amount_usd ELSE 0 END), 2)) as Revenue
FROM orders;

-- 5. 积分交易统计
SELECT
  '🎯 积分交易' as Category,
  COUNT(*) as Total,
  SUM(CASE WHEN type = 'purchase' THEN 1 ELSE 0 END) as Purchases,
  SUM(CASE WHEN type = 'unlock' THEN 1 ELSE 0 END) as Unlocks,
  SUM(CASE WHEN type = 'refund' THEN 1 ELSE 0 END) as Refunds,
  SUM(CASE WHEN type = 'welcome' THEN 1 ELSE 0 END) as Welcome,
  SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as TotalAwarded,
  ABS(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END)) as TotalSpent
FROM point_transactions;

-- 6. 解锁文章统计
SELECT
  '🔓 已解锁' as Category,
  COUNT(DISTINCT user_id) as Users,
  COUNT(*) as TotalUnlocks,
  COUNT(*) / COUNT(DISTINCT user_id) as AvgPerUser
FROM unlocked_articles;

-- 7. 广告统计
SELECT
  '📺 广告' as Category,
  COUNT(*) as Total,
  SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as Active,
  COUNT(DISTINCT slot_id) as Slots
FROM advertisements;

-- 8. 热门文章（按浏览量）
SELECT
  '🔥 热门文章 TOP 5' as Info;

SELECT
  title as Title,
  view_count as Views,
  CONCAT(point_cost, ' pts') as Cost,
  CASE WHEN is_featured = true THEN '⭐' ELSE '' END as Featured
FROM articles
WHERE status = 'published'
ORDER BY view_count DESC
LIMIT 5;

-- 9. 热门用户（按积分余额）
SELECT
  '💎 积分富豪 TOP 5' as Info;

SELECT
  email as Email,
  current_points as Points,
  role as Role
FROM users
WHERE role = 'user'
ORDER BY current_points DESC
LIMIT 5;

-- 10. 数据完整性检查
SELECT
  '✅ 数据完整性检查' as Info;

SELECT
  CASE
    WHEN (SELECT COUNT(*) FROM users WHERE role = 'admin') >= 1 THEN '✓ 管理员账号存在'
    ELSE '✗ 缺少管理员账号'
  END as Check1,
  CASE
    WHEN (SELECT COUNT(*) FROM point_packages) = 4 THEN '✓ 积分套餐完整'
    ELSE '✗ 积分套餐缺失'
  END as Check2,
  CASE
    WHEN (SELECT COUNT(*) FROM ad_slots) = 6 THEN '✓ 广告位完整'
    ELSE '✗ 广告位缺失'
  END as Check3,
  CASE
    WHEN (SELECT COUNT(*) FROM articles WHERE status = 'published') >= 10 THEN '✓ 文章数据充足'
    ELSE '✗ 文章数量不足'
  END as Check4;
