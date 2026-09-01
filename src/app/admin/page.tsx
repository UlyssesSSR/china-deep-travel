import { getStats } from '@/lib/repo';

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1A1A2E] mb-8">Admin Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-[#E8E4DF] shadow-sm">
          <p className="text-sm text-[#6B7280] mb-2">Total Users</p>
          <p className="text-3xl font-bold text-[#1A1A2E]">{stats.totalUsers.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-[#E8E4DF] shadow-sm">
          <p className="text-sm text-[#6B7280] mb-2">Total Articles</p>
          <p className="text-3xl font-bold text-[#1A1A2E]">{stats.totalArticles.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-[#E8E4DF] shadow-sm">
          <p className="text-sm text-[#6B7280] mb-2">Points in Circulation</p>
          <p className="text-3xl font-bold text-[#F1C40F]">{stats.pointsInCirculation.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-[#E8E4DF] shadow-sm">
          <p className="text-sm text-[#6B7280] mb-2">Revenue This Month</p>
          <p className="text-3xl font-bold text-[#27AE60]">${stats.revenueThisMonthUSD.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-[#E8E4DF] shadow-sm">
          <p className="text-sm text-[#6B7280] mb-2">Total Orders</p>
          <p className="text-3xl font-bold text-[#1A1A2E]">{stats.totalOrders.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-[#E8E4DF] shadow-sm">
          <p className="text-sm text-[#6B7280] mb-2">Points Spent on Unlocks</p>
          <p className="text-3xl font-bold text-[#C0392B]">{stats.pointsSpentOnUnlocks.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Revenue by Day Chart */}
        <div className="bg-white rounded-xl p-6 border border-[#E8E4DF] shadow-sm">
          <h2 className="text-lg font-semibold text-[#1A1A2E] mb-4">Revenue (Last 30 Days)</h2>
          {stats.revenueByDay.length === 0 ? (
            <p className="text-[#6B7280] text-center py-8">No revenue data yet</p>
          ) : (
            <div className="flex items-end gap-1 h-40">
              {stats.revenueByDay.slice(0, 30).reverse().map((day, index) => {
                const maxRevenue = Math.max(...stats.revenueByDay.map(d => d.revenue), 1);
                const height = (day.revenue / maxRevenue) * 100;
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-1"
                    title={`${day.date}: $${day.revenue.toFixed(2)} (${day.orders} orders)`}
                  >
                    <div
                      className="w-full bg-[#27AE60] rounded-t hover:bg-[#27AE60]/80 transition-colors cursor-pointer"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* New Users Chart */}
        <div className="bg-white rounded-xl p-6 border border-[#E8E4DF] shadow-sm">
          <h2 className="text-lg font-semibold text-[#1A1A2E] mb-4">New Users (Last 30 Days)</h2>
          {stats.newUsersByDay.length === 0 ? (
            <p className="text-[#6B7280] text-center py-8">No user data yet</p>
          ) : (
            <div className="flex items-end gap-1 h-40">
              {stats.newUsersByDay.slice(0, 30).reverse().map((day, index) => {
                const maxUsers = Math.max(...stats.newUsersByDay.map(d => d.users), 1);
                const height = (day.users / maxUsers) * 100;
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-1"
                    title={`${day.date}: ${day.users} users`}
                  >
                    <div
                      className="w-full bg-[#C0392B] rounded-t hover:bg-[#C0392B]/80 transition-colors cursor-pointer"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Articles */}
      <div className="mt-8 bg-white rounded-xl p-6 border border-[#E8E4DF] shadow-sm">
        <h2 className="text-lg font-semibold text-[#1A1A2E] mb-4">Top Articles</h2>
        {stats.topArticles.length === 0 ? (
          <p className="text-[#6B7280] text-center py-4">No articles yet</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E4DF]">
                <th className="text-left py-3 text-sm font-semibold text-[#1A1A2E]">Title</th>
                <th className="text-right py-3 text-sm font-semibold text-[#1A1A2E]">Unlocks</th>
                <th className="text-right py-3 text-sm font-semibold text-[#1A1A2E]">Views</th>
              </tr>
            </thead>
            <tbody>
              {stats.topArticles.map((article, index) => (
                <tr key={index} className="border-b border-[#E8E4DF] last:border-0">
                  <td className="py-3 text-[#1A1A2E]">{article.title}</td>
                  <td className="py-3 text-right text-[#27AE60] font-medium">{article.unlockCount}</td>
                  <td className="py-3 text-right text-[#6B7280]">{article.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Top Articles by Points Consumed */}
      <div className="mt-8 bg-white rounded-xl p-6 border border-[#E8E4DF] shadow-sm">
        <h2 className="text-lg font-semibold text-[#1A1A2E] mb-4">Top Articles by Points Consumed</h2>
        {stats.topArticlesByPoints.length === 0 ? (
          <p className="text-[#6B7280] text-center py-4">No unlocks yet</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E4DF]">
                <th className="text-left py-3 text-sm font-semibold text-[#1A1A2E]">Title</th>
                <th className="text-right py-3 text-sm font-semibold text-[#1A1A2E]">Points Consumed</th>
                <th className="text-right py-3 text-sm font-semibold text-[#1A1A2E]">Unlocks</th>
              </tr>
            </thead>
            <tbody>
              {stats.topArticlesByPoints.map((article, index) => (
                <tr key={index} className="border-b border-[#E8E4DF] last:border-0">
                  <td className="py-3 text-[#1A1A2E]">{article.title}</td>
                  <td className="py-3 text-right text-[#C0392B] font-medium">{article.pointsConsumed}</td>
                  <td className="py-3 text-right text-[#6B7280]">{article.unlocks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
