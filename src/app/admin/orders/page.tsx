import Link from 'next/link';
import { getAdminOrders } from '@/lib/repo';
import OrderRefundButton from '@/components/admin/OrderRefundButton';

export default async function AdminOrdersPage() {
  const { orders } = await getAdminOrders({ limit: 100, offset: 0 });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#1A1A2E]">Orders</h1>
        <Link
          href="/api/admin/orders/export"
          className="px-5 py-3 bg-[#1A1A2E] text-white rounded-lg hover:bg-[#2c2c4a] transition-colors font-medium text-sm"
        >
          ⬇ Export CSV
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[#E8E4DF] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FAFAF8] border-b border-[#E8E4DF]">
              <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A2E]">Order #</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A2E]">User</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-[#1A1A2E]">Amount</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-[#1A1A2E]">Points</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A2E]">Status</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-[#1A1A2E]">Paid At</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-[#1A1A2E]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order: any) => (
              <tr key={order.id} className="border-b border-[#E8E4DF] last:border-0 hover:bg-[#FAFAF8]/50">
                <td className="px-6 py-4">
                  <span className="font-mono text-sm text-[#1A1A2E]">{order.order_number}</span>
                </td>
                <td className="px-6 py-4 text-[#6B7280]">
                  {order.user_email || '—'}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-semibold text-[#1A1A2E]">
                    ${Number(order.amount_usd).toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-[#F1C40F] font-medium">
                  {order.points_awarded}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-[#6B7280] text-sm">
                  {order.paid_at
                    ? new Date(order.paid_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    {order.status === 'completed' && (
                      <OrderRefundButton orderId={order.id} orderNumber={order.order_number} />
                    )}
                    {order.status !== 'completed' && (
                      <span className="text-[#9CA3AF] text-sm">—</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="p-12 text-center text-[#6B7280]">
            No orders yet.
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-[#6B7280]">
        Showing {orders.length} orders
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-[#27AE60]/10 text-[#27AE60]';
    case 'pending':
      return 'bg-[#F39C12]/10 text-[#F39C12]';
    case 'failed':
      return 'bg-[#E74C3C]/10 text-[#E74C3C]';
    case 'refunded':
      return 'bg-[#9CA3AF]/10 text-[#9CA3AF]';
    default:
      return 'bg-[#E8E4DF] text-[#6B7280]';
  }
}
