-- ============================================================
-- China Deep Travel — Seed Data (sample content for v1)
-- Run AFTER schema.sql:  psql "$DATABASE_URL" -f db/seed.sql
-- ============================================================

-- ------------------------------------------------------------
-- Sample articles (categories are seeded in schema.sql)
-- ------------------------------------------------------------

-- Helper: a function to insert articles without knowing category UUIDs
DO $$
DECLARE
  v_cat_mtn   UUID;
  v_cat_food  UUID;
  v_cat_path  UUID;
  v_cat_rev   UUID;
  v_cat_tips  UUID;
  v_admin     UUID;
BEGIN
  SELECT id INTO v_cat_mtn  FROM categories WHERE slug = 'mountains-nature';
  SELECT id INTO v_cat_food FROM categories WHERE slug = 'food-dining';
  SELECT id INTO v_cat_path FROM categories WHERE slug = 'off-beaten-path';
  SELECT id INTO v_cat_rev  FROM categories WHERE slug = 'honest-reviews';
  SELECT id INTO v_cat_tips FROM categories WHERE slug = 'travel-tips';
  SELECT id INTO v_admin    FROM users WHERE role = 'admin' LIMIT 1;

  -- 1) FREE article (teaser / funnel)
  INSERT INTO articles (slug, title, excerpt, content, cover_image_url, category_id, point_cost, is_free, is_featured, status, read_time_minutes, tags, meta_title, meta_description, author_id, published_at)
  VALUES (
    'china-first-timer-survival-guide',
    'A China First-Timer Survival Guide (Read This Before You Book Anything)',
    'Visas, payments, SIM cards, and the one app you absolutely need. The honest pre-trip checklist nobody sends you.',
    '<h2>Before you land</h2><p>China in 2026 is easier than the horror stories suggest — but only if you prepare the right things. This free guide covers the essentials every first-timer wishes they knew.</p><h2>1. Get a SIM before you arrive</h2><p>Airport kiosks exist, but pre-ordering an eSIM saves two hours of confusion.</p><h2>2. Download the apps that actually matter</h2><p>One map app, one translator, one payment app. We name the exact ones in the full version.</p><p><em>This is a free sample. Unlock the full library for deep, city-by-city breakdowns.</em></p>',
    'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1200&q=80',
    v_cat_tips, 0, TRUE, TRUE, 'published', 6,
    ARRAY['visa','sim','first-timer'],
    'China First-Timer Survival Guide',
    'The honest pre-trip checklist for visiting China for the first time.',
    v_admin, NOW() - INTERVAL '20 days'
  )
  ON CONFLICT (slug) DO NOTHING;

  -- 2) PAID — Mountains
  INSERT INTO articles (slug, title, excerpt, content, cover_image_url, category_id, point_cost, is_free, is_featured, status, read_time_minutes, tags, meta_title, meta_description, author_id, published_at)
  VALUES (
    'real-mount-huangshan-guide',
    'The Real Mount Huangshan: Skip the Cable Car, Earn the Views',
    'Thousands of tourists pile into the same three viewpoints every day. Here is how to experience Huangshan the way the old poets did — and actually get photos without 40 strangers in them.',
    '<h2>The tourist trap</h2><p>Most visitors take the south cable car at 9am and wonder why every viewpoint looks like a queue. The mountain is 160 square kilometers. The crowds occupy about 2 of them.</p><h2>The local route</h2><p>Start from the west gate at 5:30am... (full 3,000-word guide with maps, photo spots, and where to sleep on the summit)</p>',
    'https://images.unsplash.com/photo-1518401284773-4a2d3c1d3e1b?w=1200&q=80',
    v_cat_mtn, 15, FALSE, TRUE, 'published', 12,
    ARRAY['huangshan','hiking','sunrise'],
    'The Real Mount Huangshan Guide',
    'Skip the cable-car crowds and experience Huangshan like a local.',
    v_admin, NOW() - INTERVAL '14 days'
  )
  ON CONFLICT (slug) DO NOTHING;

  -- 3) PAID — Food
  INSERT INTO articles (slug, title, excerpt, content, cover_image_url, category_id, point_cost, is_free, is_featured, status, read_time_minutes, tags, meta_title, meta_description, author_id, published_at)
  VALUES (
    'chengdu-street-food-map',
    'Chengdu Street Food Map: 14 Stalls Locals Actually Queue For',
    'Forget the tourist hotpot buffet. This is the block-by-block map of where Chengdu actually eats — with the dishes to order and the ones to skip.',
    '<h2>Morning: the alley breakfast run</h2><p>Before 8am, the side streets behind Jinli fill with... (full guide with stall names, prices in RMB, and how to order without Mandarin)</p>',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&q=80',
    v_cat_food, 12, FALSE, FALSE, 'published', 10,
    ARRAY['chengdu','food','street'],
    'Chengdu Street Food Map',
    '14 local street-food stalls in Chengdu worth the queue.',
    v_admin, NOW() - INTERVAL '10 days'
  )
  ON CONFLICT (slug) DO NOTHING;

  -- 4) PAID — Off the beaten path
  INSERT INTO articles (slug, title, excerpt, content, cover_image_url, category_id, point_cost, is_free, is_featured, status, read_time_minutes, tags, meta_title, meta_description, author_id, published_at)
  VALUES (
    'gansu-off-beat-villages',
    'Gansu Beyond Dunhuang: 5 Villages That Are Not on Any Tour Bus',
    'The Hexi Corridor has 2,000 years of history and almost no foreign tourists west of Zhangye. Here is how to reach the quiet ones.',
    '<h2>Why here</h2><p>The train from Lanzhou to Urumqi passes through... (full route, guesthouses, and a translator-phrase sheet)</p>',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
    v_cat_path, 18, FALSE, FALSE, 'published', 14,
    ARRAY['gansu','village','offbeat'],
    'Gansu Off-the-Beaten-Path Villages',
    'Five quiet villages in Gansu worth the detour.',
    v_admin, NOW() - INTERVAL '7 days'
  )
  ON CONFLICT (slug) DO NOTHING;

  -- 5) PAID — Honest reviews
  INSERT INTO articles (slug, title, excerpt, content, cover_image_url, category_id, point_cost, is_free, is_featured, status, read_time_minutes, tags, meta_title, meta_description, author_id, published_at)
  VALUES (
    'west-lake-hangzhou-honest',
    'West Lake, Hangzhou — An Honest Review (Yes, Even in Crowds)',
    'Everyone says West Lake is overrated. They are half right. Here is exactly when to go, which 800 meters are worth it, and which are a waste of your afternoon.',
    '<h2>The verdict</h2><p>West Lake is beautiful and over-photographed. But the northwest corner at 6:30am is genuinely magical... (full breakdown by section, time of day, and season)</p>',
    'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=1200&q=80',
    v_cat_rev, 10, FALSE, FALSE, 'published', 8,
    ARRAY['hangzhou','review','west-lake'],
    'West Lake Hangzhou — Honest Review',
    'An honest, crowd-aware review of Hangzhou West Lake.',
    v_admin, NOW() - INTERVAL '4 days'
  )
  ON CONFLICT (slug) DO NOTHING;

  -- 6) PAID — Tips
  INSERT INTO articles (slug, title, excerpt, content, cover_image_url, category_id, point_cost, is_free, is_featured, status, read_time_minutes, tags, meta_title, meta_description, author_id, published_at)
  VALUES (
    'china-train-booking-guide',
    'Booking China Trains Without the Scam Sites (12306 Decoded)',
    'The official 12306 app is a nightmare for foreigners. This is the clean way to book high-speed trains, what the seat letters mean, and how to avoid the reseller markups.',
    '<h2>The problem</h2><p>Third-party sites add 15-30% fees for the same seat... (full walkthrough, screenshot map, and ID requirements)</p>',
    'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200&q=80',
    v_cat_tips, 10, FALSE, FALSE, 'published', 9,
    ARRAY['trains','12306','transport'],
    'China Train Booking Guide',
    'Book Chinese high-speed trains without the scam markups.',
    v_admin, NOW() - INTERVAL '2 days'
  )
  ON CONFLICT (slug) DO NOTHING;

END $$;

-- ------------------------------------------------------------
-- Sample advertisements (so ad slots render in dev)
-- ------------------------------------------------------------
INSERT INTO advertisements (slot_id, title, image_url, target_url, is_active, start_date, priority)
SELECT id, 'Partner: Trusted China eSIM', 'https://via.placeholder.com/728x90?text=eSIM+Partner', 'https://example.com/esim', TRUE, CURRENT_DATE, 10
FROM ad_slots WHERE slot_code = 'AD-01'
ON CONFLICT DO NOTHING;

INSERT INTO advertisements (slot_id, title, image_url, target_url, is_active, start_date, priority)
SELECT id, 'Partner: Boutique Chengdu Hostel', 'https://via.placeholder.com/300x250?text=Hostel', 'https://example.com/hostel', TRUE, CURRENT_DATE, 10
FROM ad_slots WHERE slot_code = 'AD-05'
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- Done
-- ------------------------------------------------------------
SELECT 'Seed complete.' AS status;
