import { listArticlesAdmin, getCategories } from '@/lib/repo';
import Link from 'next/link';
import ArticleStatusToggle from '@/components/admin/ArticleStatusToggle';

export default async function AdminArticlesPage() {
  const { articles, total } = await listArticlesAdmin({ limit: 20, offset: 0 });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1A1A2E]">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="px-6 py-3 bg-[#C0392B] text-white rounded-lg hover:bg-[#922B21] transition-colors font-medium"
        >
          + New Article
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[#E8E4DF] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FAFAF8] border-b border-[#E8E4DF]">
              <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A2E]">Title</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A2E]">Category</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A2E]">Status</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-[#1A1A2E]">Points</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-[#1A1A2E]">Free</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-[#1A1A2E]">Views</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-[#1A1A2E]">Updated</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-[#1A1A2E]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article: any) => (
              <tr key={article.id} className="border-b border-[#E8E4DF] last:border-0 hover:bg-[#FAFAF8]/50">
                <td className="px-6 py-4">
                  <p className="font-medium text-[#1A1A2E] line-clamp-1">{article.title}</p>
                </td>
                <td className="px-6 py-4 text-[#6B7280]">
                  {article.category_name || '—'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(article.status)}`}>
                    {article.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-[#1A1A2E]">
                  {article.point_cost}
                </td>
                <td className="px-6 py-4 text-center">
                  {article.is_free ? (
                    <span className="text-[#27AE60]">✓</span>
                  ) : (
                    <span className="text-[#9CA3AF]">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right text-[#6B7280]">
                  {article.view_count}
                </td>
                <td className="px-6 py-4 text-right text-[#6B7280] text-sm">
                  {new Date(article.updated_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="px-3 py-1.5 text-sm border border-[#E8E4DF] rounded hover:bg-[#FAFAF8] transition-colors"
                    >
                      Edit
                    </Link>
                    <ArticleStatusToggle articleId={article.id} currentStatus={article.status} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {articles.length === 0 && (
          <div className="p-12 text-center text-[#6B7280]">
            No articles yet. Click "New Article" to create your first guide.
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-[#6B7280]">
        Showing {articles.length} of {total} articles
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'published':
      return 'bg-[#27AE60]/10 text-[#27AE60]';
    case 'draft':
      return 'bg-[#6B7280]/10 text-[#6B7280]';
    case 'pending_review':
      return 'bg-[#F39C12]/10 text-[#F39C12]';
    case 'archived':
      return 'bg-[#9CA3AF]/10 text-[#9CA3AF]';
    default:
      return 'bg-[#E8E4DF] text-[#6B7280]';
  }
}
