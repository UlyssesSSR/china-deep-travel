import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';
import LogoutButton from '@/components/layout/LogoutButton';

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white border-r border-[#E8E4DF] p-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#C0392B] flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-[#1A1A2E]">{user.name}</p>
                <p className="text-sm text-[#6B7280]">{user.email}</p>
              </div>
            </div>
            <div className="mt-4 bg-gradient-to-r from-[#F1C40F] to-[#E67E22] rounded-lg p-3 text-white">
              <p className="text-xs opacity-90">Your Balance</p>
              <p className="text-2xl font-bold">{user.current_points} pts</p>
            </div>
          </div>

          <nav className="space-y-2">
            <Link
              href="/user/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#1A1A2E] hover:bg-[#FAFAF8] transition-colors"
            >
              <span className="text-xl">📊</span>
              <span>Dashboard</span>
            </Link>
            <Link
              href="/user/points"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#1A1A2E] hover:bg-[#FAFAF8] transition-colors"
            >
              <span className="text-xl">🪙</span>
              <span>My Points</span>
            </Link>
            <Link
              href="/user/purchased"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#1A1A2E] hover:bg-[#FAFAF8] transition-colors"
            >
              <span className="text-xl">📚</span>
              <span>My Library</span>
            </Link>
            <Link
              href="/user/history"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#1A1A2E] hover:bg-[#FAFAF8] transition-colors"
            >
              <span className="text-xl">📋</span>
              <span>History</span>
            </Link>
          </nav>

          <div className="mt-8 pt-8 border-t border-[#E8E4DF]">
            <LogoutButton />
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
