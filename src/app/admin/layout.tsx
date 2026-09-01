import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'admin') {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Top Bar */}
      <div className="bg-[#1A1A2E] text-white px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold">🏔 China Deep Travel</span>
            <span className="px-3 py-1 bg-[#C0392B] text-sm font-medium rounded">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-75">{user.name}</span>
            <div className="w-8 h-8 rounded-full bg-[#C0392B] flex items-center justify-center text-white font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-56px)] bg-white border-r border-[#E8E4DF] p-6">
          <nav className="space-y-2">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#1A1A2E] hover:bg-[#FAFAF8] transition-colors"
            >
              <span className="text-xl">📊</span>
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/articles"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#1A1A2E] hover:bg-[#FAFAF8] transition-colors"
            >
              <span className="text-xl">📝</span>
              <span>Articles</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#1A1A2E] hover:bg-[#FAFAF8] transition-colors"
            >
              <span className="text-xl">👥</span>
              <span>Users</span>
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#1A1A2E] hover:bg-[#FAFAF8] transition-colors"
            >
              <span className="text-xl">💳</span>
              <span>Orders</span>
            </Link>
            <Link
              href="/admin/ads"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#1A1A2E] hover:bg-[#FAFAF8] transition-colors"
            >
              <span className="text-xl">📢</span>
              <span>Ads</span>
            </Link>
          </nav>

          <div className="mt-8 pt-8 border-t border-[#E8E4DF]">
            <Link
              href="/guides"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#6B7280] hover:bg-[#FAFAF8] transition-colors text-sm"
            >
              <span>←</span>
              <span>Back to Site</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
