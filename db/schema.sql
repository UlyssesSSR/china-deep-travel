-- ============================================================
-- China Deep Travel Platform — Database Schema
-- PostgreSQL (compatible with Supabase / Neon)
-- Version: 1.0
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy search

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('user', 'editor', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE transaction_type AS ENUM ('purchase', 'unlock', 'refund', 'admin_adjustment', 'signup_bonus');
CREATE TYPE article_status AS ENUM ('draft', 'pending_review', 'published', 'archived');
CREATE TYPE payment_provider AS ENUM ('stripe', 'paypal');

-- ============================================================
-- TABLES
-- ============================================================

-- 1. Users
CREATE TABLE users (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255)    UNIQUE NOT NULL,
    password_hash   VARCHAR(255),                  -- NULL if OAuth-only account
    name            VARCHAR(100)    NOT NULL,
    avatar_url      VARCHAR(500),
    role            user_role       DEFAULT 'user',
    email_verified  BOOLEAN         DEFAULT FALSE,
    is_suspended    BOOLEAN         DEFAULT FALSE,
    current_points  INTEGER         DEFAULT 0 CHECK (current_points >= 0),
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- 2. Email Verification Tokens
CREATE TABLE email_verifications (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(64) UNIQUE NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_verifications_token ON email_verifications(token);
CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);

-- 3. Password Reset Tokens
CREATE TABLE password_reset_tokens (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(64) UNIQUE NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Categories
CREATE TABLE categories (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(80)     NOT NULL,          -- e.g. "Mountains & Nature"
    slug            VARCHAR(80)     UNIQUE NOT NULL,    -- e.g. "mountains-nature"
    description     VARCHAR(300),
    icon_name       VARCHAR(50),                       -- e.g. "mountain", for UI icons
    article_count   INTEGER     DEFAULT 0,
    sort_order      INTEGER     DEFAULT 0,
    is_active       BOOLEAN     DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Seed categories
INSERT INTO categories (name, slug, description, icon_name, sort_order) VALUES
    ('Mountains & Nature',    'mountains-nature',     'Mount Heng, Huangshan, Jiuzhaigou and beyond',       'mountain',     1),
    ('Food & Dining',          'food-dining',          'Real Chinese food — the street, not the stereotype', 'utensils',    2),
    ('Off-the-Beaten-Path',    'off-beaten-path',      'Routes most tourists never find',                    'compass',     3),
    ('Honest Reviews',         'honest-reviews',       'No-BS verdicts on attractions and experiences',      'star',        4),
    ('Travel Tips',            'travel-tips',          'Visas, transport, money, SIM cards — the practical', 'lightbulb',   5);

-- 5. Articles
CREATE TABLE articles (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug                VARCHAR(150)    UNIQUE NOT NULL,
    title               VARCHAR(120)    NOT NULL,
    excerpt             VARCHAR(300)    NOT NULL,          -- shown in cards + free summary
    content             TEXT,                               -- HTML / MDX; full body (paying users)
    cover_image_url     VARCHAR(500),
    category_id         UUID            REFERENCES categories(id),
    point_cost          INTEGER         DEFAULT 15 CHECK (point_cost >= 0),
    is_free             BOOLEAN         DEFAULT FALSE,
    is_featured         BOOLEAN         DEFAULT FALSE,
    status              article_status  DEFAULT 'draft',
    read_time_minutes   INTEGER,
    tags                VARCHAR(100)[]  DEFAULT '{}',
    view_count          INTEGER         DEFAULT 0,
    unlock_count        INTEGER         DEFAULT 0,         -- how many users unlocked this
    meta_title          VARCHAR(70),
    meta_description     VARCHAR(160),
    author_id           UUID            REFERENCES users(id),
    published_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_category_id ON articles(category_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_is_featured ON articles(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);

-- 6. User Unlocked Articles (junction)
CREATE TABLE user_unlocked_articles (
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_id      UUID        NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    points_spent    INTEGER     NOT NULL,
    unlocked_at     TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, article_id)       -- one user can't unlock same article twice
);

CREATE INDEX idx_user_unlocked_articles_user_id ON user_unlocked_articles(user_id);
CREATE INDEX idx_user_unlocked_articles_article_id ON user_unlocked_articles(article_id);

-- 7. Point Packages
CREATE TABLE point_packages (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(50)     NOT NULL,      -- "Starter", "Explorer", etc.
    price_usd       DECIMAL(10,2)  NOT NULL,
    points_amount   INTEGER         NOT NULL,
    bonus_points    INTEGER         DEFAULT 0,     -- extra points on top
    badge           VARCHAR(30),                   -- e.g. "Best Value", "Save 12%"
    is_active       BOOLEAN         DEFAULT TRUE,
    sort_order      INTEGER         DEFAULT 0,
    created_at      TIMESTAMPTZ     DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     DEFAULT NOW(),
    CONSTRAINT positive_price CHECK (price_usd > 0),
    CONSTRAINT positive_points CHECK (points_amount > 0)
);

-- Seed default packages
INSERT INTO point_packages (name, price_usd, points_amount, bonus_points, badge, sort_order) VALUES
    ('Starter',      10.00, 300,   0,  NULL,            1),
    ('Explorer ⭐',  28.00, 900,   0,  'Save 7%',       2),
    ('Superfan',     85.00, 3000,  0,  'Save 12%',      3);

-- 8. Orders (Payment Records)
CREATE TABLE orders (
    id                      UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number            VARCHAR(30)     UNIQUE NOT NULL,   -- e.g. "CPT-20260828-XXXXX"
    user_id                 UUID            NOT NULL REFERENCES users(id),
    package_id              UUID            REFERENCES point_packages(id),
    provider                payment_provider DEFAULT 'stripe',
    amount_usd              DECIMAL(10,2)   NOT NULL,
    points_awarded          INTEGER         NOT NULL,
    points_breakdown_json   JSONB,                              -- for bonus tracking
    stripe_payment_intent_id VARCHAR(255)    UNIQUE,
    stripe_checkout_url     VARCHAR(500),
    status                  order_status    DEFAULT 'pending',
    paid_at                 TIMESTAMPTZ,
    refunded_at             TIMESTAMPTZ,
    refund_amount_usd       DECIMAL(10,2),
    error_message           TEXT,
    ip_address              VARCHAR(45),
    user_agent              VARCHAR(500),
    created_at              TIMESTAMPTZ     DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- 9. Point Transactions (immutable ledger)
CREATE TABLE point_transactions (
    id              UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID                NOT NULL REFERENCES users(id),
    type            transaction_type    NOT NULL,
    points_delta    INTEGER             NOT NULL,  -- +ve or -ve
    balance_after   INTEGER             NOT NULL,
    reference_type  VARCHAR(30),                      -- 'order', 'article', 'admin', etc.
    reference_id    UUID,                             -- FK to order.id or article.id
    admin_note      TEXT,                             -- required for admin_adjustment
    metadata        JSONB            DEFAULT '{}',
    created_at      TIMESTAMPTZ       DEFAULT NOW()
);

CREATE INDEX idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX idx_point_transactions_type ON point_transactions(type);
CREATE INDEX idx_point_transactions_created_at ON point_transactions(created_at DESC);

-- 10. Ad Slots
CREATE TABLE ad_slots (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_code       VARCHAR(20) UNIQUE NOT NULL,    -- "AD-01", "AD-02", etc.
    slot_name       VARCHAR(80) NOT NULL,
    description     VARCHAR(200),
    width           INTEGER,
    height          INTEGER,
    position        INTEGER     DEFAULT 0,
    is_active       BOOLEAN     DEFAULT TRUE,
    is_mobile_hidden BOOLEAN    DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Seed ad slots
INSERT INTO ad_slots (slot_code, slot_name, description, width, height, position) VALUES
    ('AD-01', 'Homepage — Above Latest Articles', '728×90 leaderboard, shown on homepage only',    728, 90,  1),
    ('AD-02', 'Homepage — Sidebar',               '300×250 rectangle, desktop sidebar',           300, 250, 2),
    ('AD-03', 'Guide Listing — Below Filters',    '728×90 leaderboard',                          728, 90,  3),
    ('AD-04', 'Article — Above Summary',          '728×90 leaderboard',                          728, 90,  4),
    ('AD-05', 'Article — Below Content',         '300×250 rectangle',                           300, 250, 5),
    ('AD-06', 'Global Footer Banner',             '728×90 leaderboard, all pages',               728, 90,  6);

-- 11. Advertisements
CREATE TABLE advertisements (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    slot_id         UUID        NOT NULL REFERENCES ad_slots(id),
    title           VARCHAR(100) NOT NULL,
    image_url       VARCHAR(500),
    target_url      VARCHAR(500),
    html_content    TEXT,                               -- for HTML5 creatives
    is_active       BOOLEAN     DEFAULT FALSE,
    start_date      DATE,
    end_date        DATE,
    click_count     INTEGER     DEFAULT 0,
    impression_count INTEGER    DEFAULT 0,
    priority        INTEGER     DEFAULT 0,              -- higher = shown first in rotation
    created_by      UUID        REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_advertisements_slot_id ON advertisements(slot_id);
CREATE INDEX idx_advertisements_is_active ON advertisements(is_active) WHERE is_active = TRUE;

-- 12. Ad Impressions (for analytics)
CREATE TABLE ad_impressions (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    ad_id       UUID        REFERENCES advertisements(id),
    slot_id     UUID        REFERENCES ad_slots(id),
    user_id     UUID        REFERENCES users(id),        -- NULL if guest
    ip_hash     VARCHAR(64),                             -- hashed IP for fraud detection
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
-- Note: Partition this table by month in production for performance
-- CREATE TABLE ad_impressions_2026_08 PARTITION OF ad_impressions FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

-- 13. Site Settings (key-value)
CREATE TABLE site_settings (
    key          VARCHAR(100) PRIMARY KEY,
    value        JSONB,
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Seed defaults
INSERT INTO site_settings (key, value) VALUES
    ('welcome_bonus_points',    '{"amount": 20, "enabled": true}'),
    ('site_name',              '{"en": "China Deep Travel"}'),
    ('site_tagline',           '{"en": "Real China. Not the Tour-Bus Version."}'),
    ('contact_email',          '{"address": "hello@chinadeeptravel.com"}'),
    ('seo_defaults',           '{"meta_title_suffix": " | China Deep Travel"}');

-- 14. Article Revisions (version history)
CREATE TABLE article_revisions (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id  UUID        NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    content     TEXT,
    title       VARCHAR(120),
    edited_by   UUID        REFERENCES users(id),
    version     INTEGER     NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_article_revisions_article_id ON article_revisions(article_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at          BEFORE UPDATE ON users              FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_articles_updated_at       BEFORE UPDATE ON articles           FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated_at         BEFORE UPDATE ON orders             FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_advertisements_updated_at BEFORE UPDATE ON advertisements     FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-update article_count on category
CREATE OR REPLACE FUNCTION update_category_article_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'published' THEN
        UPDATE categories SET article_count = article_count + 1 WHERE id = NEW.category_id;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'published' THEN
        UPDATE categories SET article_count = article_count - 1 WHERE id = OLD.category_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'published' AND NEW.status = 'published' THEN
            UPDATE categories SET article_count = article_count + 1 WHERE id = NEW.category_id;
        ELSIF OLD.status = 'published' AND NEW.status != 'published' THEN
            UPDATE categories SET article_count = article_count - 1 WHERE id = OLD.category_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_category_article_count
    AFTER INSERT OR UPDATE OR DELETE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_category_article_count();

-- ============================================================
-- ROW LEVEL SECURITY (Supabase / PostgreSQL)
-- ============================================================

-- Users can only see/edit their own data (admin overrides via is_admin flag)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_unlocked_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users see only their own records
CREATE POLICY "users_own_record" ON users FOR ALL
    USING (auth.uid() = id OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "users_own_transactions" ON point_transactions FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "users_own_unlocks" ON user_unlocked_articles FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "users_own_orders" ON orders FOR ALL
    USING (user_id = auth.uid());

-- ============================================================
-- VIEWS (for admin dashboard)
-- ============================================================

-- Active advertisements with slot info
CREATE VIEW v_active_ads AS
SELECT
    a.*,
    s.slot_code,
    s.slot_name,
    s.width,
    s.height
FROM advertisements a
JOIN ad_slots s ON a.slot_id = s.id
WHERE a.is_active = TRUE
  AND (a.start_date IS NULL OR a.start_date <= CURRENT_DATE)
  AND (a.end_date IS NULL OR a.end_date >= CURRENT_DATE)
ORDER BY s.position, a.priority DESC;

-- Revenue summary
CREATE VIEW v_revenue_summary AS
SELECT
    DATE_TRUNC('day', paid_at) AS date,
    COUNT(*)                    AS order_count,
    SUM(amount_usd)             AS revenue_usd,
    SUM(points_awarded)          AS points_sold
FROM orders
WHERE status = 'completed'
GROUP BY DATE_TRUNC('day', paid_at)
ORDER BY date DESC;

-- Top articles by unlock count
CREATE VIEW v_top_articles AS
SELECT
    a.id,
    a.title,
    a.slug,
    c.name               AS category,
    a.unlock_count,
    a.view_count,
    a.published_at
FROM articles a
LEFT JOIN categories c ON a.category_id = c.id
WHERE a.status = 'published'
ORDER BY a.unlock_count DESC NULLS LAST
LIMIT 20;

-- ============================================================
-- SEED DATA — Admin User
-- ============================================================
-- Password: ChangeThisAdmin123! (hash with bcrypt, cost 12)
INSERT INTO users (email, password_hash, name, role, email_verified, current_points)
VALUES (
    'admin@chinadeeptravel.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYo3P/4Ly',
    'Platform Admin',
    'admin',
    TRUE,
    0
);

-- ============================================================
-- END OF SCHEMA
-- ============================================================
