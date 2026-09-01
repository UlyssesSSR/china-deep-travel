import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { DEMO, demoUnlockedArticles } from '@/lib/demo';
import Link from 'next/link';

export default async function UserPurchasedPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null; // Layout handles redirect
  }

  const unlockedArticles = DEMO
    ? demoUnlockedArticles
    : (
        await db.query<any>(
          `SELECT ua.unlocked_at, a.id, a.slug, a.title, a.excerpt, a.cover_image_url,
            a.point_cost, a.read_time_minutes, c.name AS category_name, c.slug AS category_slug
     FROM user_unlocked_articles ua
     JOIN articles a ON ua.article_id = a.id
     LEFT JOIN categories c ON a.category_id = c.id
     WHERE ua.user_id = ?
     ORDER BY ua.unlocked_at DESC`,
          [user.id]
        )
      ).rows;

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1A1A2E] mb-2">My Library</h1>
      <p className="text-[#6B7280] mb-8">
        {unlockedArticles.length} guide{unlockedArticles.length !== 1 ? 's' : ''} unlocked
      </p>

      {unlockedArticles.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-[#E8E4DF] text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-[#1A1A2E] mb-2">
            Your library is empty
          </h2>
          <p className="text-[#6B7280] mb-6">
            Start exploring our travel guides and unlock your first article!
          </p>
          <Link
            href="/guides"
            className="inline-block px-6 py-3 bg-[#C0392B] text-white rounded-lg hover:bg-[#922B21] transition-colors font-medium"
          >
            Browse Guides
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {unlockedArticles.map((article) => (
            <Link
              key={article.id}
              href={`/guides/${article.slug}`}
              className="group bg-white rounded-xl border border-[#E8E4DF] overflow-hidden hover:shadow-lg transition-shadow"
            >
              {article.cover_image_url && (
                <div className="aspect-video bg-[#E8E4DF] overflow-hidden">
                  <img
                    src={article.cover_image_url}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  {article.category_name && (
                    <span className="px-2 py-1 bg-[#E8E4DF] text-[#6B7280] text-xs font-medium rounded">
                      {article.category_name}
                    </span>
                  )}
                  <span className="px-2 py-1 bg-[#27AE60]/10 text-[#27AE60] text-xs font-medium rounded flex items-center gap-1">
                    ✓ Unlocked
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[#1A1A2E] mb-2 group-hover:text-[#C0392B] transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-[#6B7280] line-clamp-2 mb-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between text-sm text-[#9CA3AF]">
                  <span>
                    {article.read_time_minutes || 5} min read
                  </span>
                  <span>
                    Unlocked {new Date(article.unlocked_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
