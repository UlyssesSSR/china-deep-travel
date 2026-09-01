import { listUsers } from '@/lib/repo';
import UserActions from '@/components/admin/UserActions';

export default async function AdminUsersPage() {
  const { users, total } = await listUsers({ limit: 30 });

  return (
    <div>
      <h1 className="text-3xl font-bold text-[#1A1A2E] mb-8">Users</h1>

      <div className="bg-white rounded-xl border border-[#E8E4DF] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FAFAF8] border-b border-[#E8E4DF]">
              <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A2E]">User</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A2E]">Email</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-[#1A1A2E]">Role</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-[#1A1A2E]">Points</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-[#1A1A2E]">Verified</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-[#1A1A2E]">Status</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-[#1A1A2E]">Unlocked</th>
              <th className="text-right px-6 py-4 text-sm font-semibold text-[#1A1A2E]">Joined</th>
              <th className="text-center px-6 py-4 text-sm font-semibold text-[#1A1A2E]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id} className="border-b border-[#E8E4DF] last:border-0 hover:bg-[#FAFAF8]/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C0392B] flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-[#1A1A2E]">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-[#6B7280]">
                  {user.email}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-semibold text-[#F1C40F]">{user.current_points}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  {user.email_verified ? (
                    <span className="text-[#27AE60]">✓</span>
                  ) : (
                    <span className="text-[#9CA3AF]">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {user.is_suspended ? (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-[#E74C3C]/10 text-[#E74C3C]">
                      Suspended
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-[#27AE60]/10 text-[#27AE60]">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right text-[#6B7280]">
                  {user.unlocked_count}
                </td>
                <td className="px-6 py-4 text-right text-[#6B7280] text-sm">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-6 py-4">
                  <UserActions
                    userId={user.id}
                    currentPoints={user.current_points}
                    isSuspended={user.is_suspended}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {users.length === 0 && (
          <div className="p-12 text-center text-[#6B7280]">
            No users yet.
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-[#6B7280]">
        Showing {users.length} of {total} users
      </div>
    </div>
  );
}

function getRoleColor(role: string): string {
  switch (role) {
    case 'admin':
      return 'bg-[#C0392B]/10 text-[#C0392B]';
    case 'editor':
      return 'bg-[#E67E22]/10 text-[#E67E22]';
    default:
      return 'bg-[#E8E4DF] text-[#6B7280]';
  }
}
