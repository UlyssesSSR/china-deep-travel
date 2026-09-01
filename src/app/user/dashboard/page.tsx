import { getCurrentUser } from '@/lib/auth';
import { getUserPoints } from '@/lib/repo';
import { db } from '@/lib/db';
import { DEMO, demoDashboardData } from '@/lib/demo';
import Link from 'next/link';

export default async function UserDashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null; // Layout handles redirect
  }

  const currentPoints = await getUserPoints(user.id);

  const demo = DEMO ? demoDashboardData : null;
  const unlockedCount = demo
    ? demo.unlockedCount
    : (await db.query<{ count: string }>(
        'SELECT CAST(COUNT(*) AS UNSIGNED) AS count FROM user_unlocked_articles WHERE user_id = ?',
        [user.id]
      )).rows[0]?.count || 0;

  const totalSpentUSD = demo
    ? demo.totalSpentUSD
    : parseFloat(
        (await db.query<{ total: string | null }>(
          `SELECT SUM(amount_usd) AS total FROM orders 
     WHERE user_id = ? AND status = 'completed'`,
          [user.id]
        )).rows[0]?.total || '0'
      );

  const recentTransactions = demo
    ? demo.recentTransactions
    : (
        await db.query<any>(
          `SELECT pt.*, 
            CASE 
              WHEN pt.reference_type = 'article' THEN a.title
              WHEN pt.reference_type = 'order' THEN o.order_number
              ELSE NULL
            END AS reference_title
     FROM point_transactions pt
     LEFT JOIN articles a ON pt.reference_type = 'article' AND pt.reference_id = a.id
     LEFT JOIN orders o ON pt.reference_type = 'order' AND pt.reference_id = o.id
     WHERE pt.user_id = ?
     ORDER BY pt.created_at DESC
     LIMIT 5`,
          [user.id]
        )
      ).rows;

  const pointsByDay = demo
    ? demo.pointsByDay
    : (
        await db.query<{ date: string; points: number }>(
          `SELECT DATE(created_at) AS date,
            SUM(points_delta) AS points
     FROM point_transactions
     WHERE user_id = ? AND created_at >= NOW() - INTERVAL 30 DAY
     GROUP BY 1
     ORDER BY 1 ASC`,
          [user.id]
        )
      ).rows;

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1A1A2E] mb-8">
        Welcome, {user.name}!
      </h1>

      {/* Points Balance Card */}
      <div className="bg-gradient-to-br from-[#F1C40F] via-[#E67E22] to-[#C0392B] rounded-2xl p-8 text-white mb-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-2">Your Balance</p>
            <p className="text-5xl font-bold">{currentPoints.toLocaleString()}</p>
            <p className="text-sm opacity-90 mt-2">CPT Points</p>
          </div>
          <div className="text-8xl">🪙</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-[#E8E4DF] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="text-4xl">📖</div>
            <div>
              <p className="text-sm text-[#6B7280]">Articles Unlocked</p>
              <p className="text-3xl font-bold text-[#1A1A2E]">{unlockedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-[#E8E4DF] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="text-4xl">💳</div>
            <div>
              <p className="text-sm text-[#6B7280]">Total Spent</p>
              <p className="text-3xl font-bold text-[#1A1A2E]">${totalSpentUSD.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-[#E8E4DF] shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-[#1A1A2E] mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Link
            href="/user/points"
            className="px-6 py-3 bg-[#C0392B] text-white rounded-lg hover:bg-[#922B21] transition-colors font-medium"
          >
            Buy Points
          </Link>
          <Link
            href="/guides"
            className="px-6 py-3 bg-[#1A1A2E] text-white rounded-lg hover:bg-black transition-colors font-medium"
          >
            Browse Guides
          </Link>
          <Link
            href="/user/purchased"
            className="px-6 py-3 border border-[#E8E4DF] text-[#1A1A2E] rounded-lg hover:bg-[#FAFAF8] transition-colors font-medium"
          >
            My Library
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 border border-[#E8E4DF] shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-[#1A1A2E] mb-4">Recent Activity</h2>
        {recentTransactions.length === 0 ? (
          <p className="text-[#6B7280]">No activity yet. Unlock your first guide!</p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3 border-b border-[#E8E4DF] last:border-0"
              >
                <div className="flex items-center gap-4">
                  <div className={`text-2xl ${tx.points_delta > 0 ? 'text-[#27AE60]' : 'text-[#E74C3C]'}`}>
                    {tx.points_delta > 0 ? '↑' : '↓'}
                  </div>
                  <div>
                    <p className="font-medium text-[#1A1A2E]">
                      {getTransactionLabel(tx.type, tx.reference_title)}
                    </p>
                    <p className="text-sm text-[#6B7280]">
                      {new Date(tx.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${tx.points_delta > 0 ? 'text-[#27AE60]' : 'text-[#E74C3C]'}`}>
                    {tx.points_delta > 0 ? '+' : ''}{tx.points_delta} pts
                  </p>
                  <p className="text-sm text-[#6B7280]">
                    Balance: {tx.balance_after}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <Link
          href="/user/history"
          className="inline-block mt-4 text-[#C0392B] hover:underline text-sm font-medium"
        >
          View full history →
        </Link>
      </div>

      {/* 30-Day Points Chart */}
      <div className="bg-white rounded-xl p-6 border border-[#E8E4DF] shadow-sm">
        <h2 className="text-lg font-semibold text-[#1A1A2E] mb-4">Points Activity (Last 30 Days)</h2>
        {pointsByDay.length === 0 ? (
          <p className="text-[#6B7280] text-center py-8">No activity in the last 30 days</p>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {pointsByDay.map((day, index) => {
              const maxPoints = Math.max(...pointsByDay.map(d => Math.abs(d.points)), 1);
              const height = Math.abs(day.points) / maxPoints * 100;
              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-1"
                  title={`${day.date}: ${day.points > 0 ? '+' : ''}${day.points} pts`}
                >
                  <div
                    className={`w-full rounded-t ${day.points > 0 ? 'bg-[#27AE60]' : 'bg-[#E74C3C]'}`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function getTransactionLabel(type: string, referenceTitle: string | null): string {
  switch (type) {
    case 'purchase':
      return 'Purchased Points';
    case 'unlock':
      return referenceTitle ? `Unlocked: ${referenceTitle}` : 'Unlocked Article';
    case 'refund':
      return 'Refund';
    case 'admin_adjustment':
      return 'Admin Adjustment';
    case 'signup_bonus':
      return 'Welcome Bonus';
    default:
      return 'Transaction';
  }
}
