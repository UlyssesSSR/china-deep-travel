# China Deep Travel (CPT)

English-language paid China-travel-guide platform with a **points-based paywall**.
Users pre-charge points (1 USD = 30 CPT Points) and unlock premium guides per-article.
Unlocked articles are free to re-read forever.

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS + shadcn-style UI primitives
- **API:** Route Handlers under `src/app/api/**` (REST, JWT in HttpOnly cookie)
- **DB:** PostgreSQL (Supabase / Neon) — schema in `db/schema.sql`
- **Auth:** JWT session cookie (`cpt_session`, SameSite=Lax, 7d) + email/password + Google OAuth
- **Payments:** Stripe Checkout + webhooks
- **Email:** Resend
- **Storage/CDN:** Cloudflare R2
- **Hosting:** Vercel · **Monitoring:** Sentry

## Project Layout

```
china-deep-travel/
├── db/
│   ├── schema.sql      # full DB schema (users, articles, orders, points ledger, ads…)
│   ├── seed.sql        # demo categories, articles, packages, ads, admin user
│   └── deploy.sh       # create DB → schema → seed → run migrations
├── src/
│   ├── lib/            # shared contracts (do not duplicate)
│   │   ├── db.ts       # pg connection pool + query()
│   │   ├── types.ts    # domain types
│   │   ├── auth.ts     # JWT, bcrypt, session cookie, requireUser/requireAdmin
│   │   ├── api.ts      # ok/created/withHandler/apiError helpers
│   │   ├── repo.ts     # data-access layer (single source of SQL)
│   │   ├── points.ts   # atomic awardPoints / deductPoints (ledger tx)
│   │   ├── stripe.ts   # Stripe client
│   │   └── email.ts    # Resend wrappers
│   ├── app/
│   │   ├── api/        # 27 route handlers (auth, articles, user, checkout, webhooks, admin)
│   │   ├── (pages)     # 20 pages: home, /guides, article detail, auth, dashboard, admin…
│   │   ├── layout.tsx  # root layout (Navbar + Footer)
│   │   └── globals.css
│   └── components/     # ui / layout / article / ads / admin
├── .env.example        # copy to .env.local and fill in
└── package.json
```

## Local Development

```bash
# 1. install
npm install

# 2. configure environment
cp .env.example .env.local        # then fill DATABASE_URL, STRIPE_*, RESEND_*, etc.

# 3. set up the database (Postgres must be reachable)
psql "$DATABASE_URL" -f db/schema.sql
psql "$DATABASE_URL" -f db/seed.sql
#   OR use the all-in-one script:  bash db/deploy.sh

# 4. run
npm run dev                       # http://localhost:3000
```

## Type-Check / Build

```bash
npm run typecheck                 # tsc --noEmit  (passes clean)
npm run build                     # production build (needs DATABASE_URL + env at build time)
```

## Key Business Rules

- **Points ledger is immutable.** Every balance change writes a `point_transactions` row and
  updates `users.current_points` in the same transaction (`src/lib/points.ts`).
- **Unlock is atomic.** Deduct uses `SELECT … FOR UPDATE` row lock; insufficient balance →
  `402 INSUFFICIENT_POINTS` with `{ required, current, shortage }`.
- **Re-read free.** Unlocked articles are recorded in `user_unlocked_articles` and never re-charged.

## Admin

Seed creates an admin: `admin@chinadeeptravel.com` / `Admin#2024`.
Admin panel lives under `/admin` (KPI dashboard, articles CMS, users, orders/refunds, ads).
