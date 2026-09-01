import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { DEMO, demoHistoryTransactions } from '@/lib/demo';

export default async function UserHistoryPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null; // Layout handles redirect
  }

  const transactions = DEMO
    ? demoHistoryTransactions
    : (
        await db.query<any>(
          `SELECT pt.*, 
            CASE 
              WHEN pt.reference_type = 'article' THEN a.title
              WHEN pt.reference_type = 'order' THEN o.order_number
              ELSE NULL
            END AS reference_title,
            CASE 
              WHEN pt.reference_type = 'order' THEN o.amount_usd
              ELSE NULL
            END AS amount_usd
     FROM point_transactions pt
     LEFT JOIN articles a ON pt.reference_type = 'article' AND pt.reference_id = a.id
     LEFT JOIN orders o ON pt.reference_type = 'order' AND pt.reference_id = o.id
     WHERE pt.user_id = ?
     ORDER BY pt.created_at DESC
     LIMIT 20`,
          [user.id]
        )
      ).rows;

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1A1A2E] mb-2">Transaction History</h1>
      <p className="text-[#6B7280] mb-8">
        View your point transaction history
      </p>

      {transactions.length === 0 ? (
        <div className="bg-white rounded-xl p-12 border border-[#E8E4DF] text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-[#1A1A2E] mb-2">
            No transactions yet
          </h2>
          <p className="text-[#6B7280]">
            Your point transaction history will appear here once you start unlocking guides or purchasing points.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E8E4DF] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#FAFAF8] border-b border-[#E8E4DF]">
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A2E]">
                  Date
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A2E]">
                  Description
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-[#1A1A2E]">
                  Points
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-[#1A1A2E]">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => (
                <tr
                  key={tx.id}
                  className={`border-b border-[#E8E4DF] last:border-0 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAF8]/50'
                  }`}
                >
                  <td className="px-6 py-4 text-sm text-[#1A1A2E]">
                    {new Date(tx.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#1A1A2E]">
                    {getTransactionDescription(tx)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-semibold ${
                      tx.points_delta > 0 ? 'text-[#27AE60]' : 'text-[#E74C3C]'
                    }`}>
                      {tx.points_delta > 0 ? '+' : ''}{tx.points_delta}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-[#6B7280]">
                    {tx.balance_after}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function getTransactionDescription(tx: any): string {
  switch (tx.type) {
    case 'purchase':
      return `Purchased ${tx.points_delta} points${tx.amount_usd ? ` ($${tx.amount_usd})` : ''}`;
    case 'unlock':
      return tx.reference_title 
        ? `Unlocked: ${tx.reference_title}` 
        : 'Unlocked article';
    case 'refund':
      return 'Refund processed';
    case 'admin_adjustment':
      return 'Admin adjustment';
    case 'signup_bonus':
      return 'Welcome bonus points';
    default:
      return 'Transaction';
  }
}
