import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiSend } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Profile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_verified: boolean;
  status: string;
  phone?: string;
};

const PAGE_SIZE = 25;

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    apiGet<Profile[]>('/api/profiles')
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleVerify = async (u: Profile) => {
    await apiSend('/api/profiles', 'PUT', { id: u.id, is_verified: !u.is_verified });
    load();
  };

  const setStatus = async (u: Profile, status: string) => {
    await apiSend('/api/profiles', 'PUT', { id: u.id, status });
    load();
  };

  const deleteUser = async (u: Profile) => {
    if (!window.confirm(`Are you sure you want to completely delete ${u.first_name} ${u.last_name}?`)) return;
    try {
      await apiSend('/api/profiles', 'DELETE', { id: u.id });
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner />;

  // Filter users by search term and role
  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="ابحث بالاسم أو البريد الإلكتروني…"
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-white dark:bg-[#111A30] text-slate-900 dark:text-white placeholder:text-slate-400 text-sm outline-none focus:border-amber-500 shadow-sm"
        />
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-white dark:bg-[#111A30] text-slate-900 dark:text-white text-sm outline-none shadow-sm"
        >
          <option value="">جميع الأدوار</option>
          <option value="tenant">مستأجر (Tenant)</option>
          <option value="student">طالب (Student)</option>
          <option value="owner">مالك (Owner)</option>
          <option value="broker">سمسار (Broker)</option>
          <option value="admin">أدمن (Admin)</option>
          <option value="super_admin">سوبر أدمن (Super Admin)</option>
        </select>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
        عرض {paginated.length} من أصل {filtered.length} مستخدم (الإجمالي: {users.length})
      </p>

      <div className="bg-white dark:bg-[#111A30] rounded-2xl border border-slate-100 dark:border-[#1E2B4A] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead className="bg-slate-50 dark:bg-[#0A1020] text-start text-xs uppercase text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-[#1E2B4A]">
              <tr>
                <th className="px-4 py-3 text-start">المستخدم</th>
                <th className="px-4 py-3 text-start">نوع الحساب</th>
                <th className="px-4 py-3 text-start">الحالة</th>
                <th className="px-4 py-3 text-start">موثق</th>
                <th className="px-4 py-3 text-start">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1E2B4A]">
              {paginated.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-[#0A1020]/50 transition">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900 dark:text-white">{u.first_name} {u.last_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={async (e) => {
                        const newRole = e.target.value;
                        await apiSend('/api/profiles', 'PUT', { id: u.id, role: newRole });
                        load();
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#1E2B4A] text-xs font-semibold capitalize bg-slate-50 dark:bg-[#0A1020] text-slate-900 dark:text-white"
                    >
                      <option value="tenant">tenant</option>
                      <option value="student">student</option>
                      <option value="owner">owner</option>
                      <option value="broker">broker</option>
                      <option value="admin">admin</option>
                      <option value="super_admin">super_admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 capitalize font-semibold text-slate-700 dark:text-slate-300">{u.status}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{u.is_verified ? 'نعم' : 'لا'}</td>
                  <td className="px-4 py-3 space-x-2 space-x-reverse">
                    <button onClick={() => toggleVerify(u)} className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
                      {u.is_verified ? 'إلغاء التوثيق' : 'توثيق'}
                    </button>
                    {u.status === 'active' ? (
                      <button onClick={() => setStatus(u, 'suspended')} className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline">حظر</button>
                    ) : (
                      <button onClick={() => setStatus(u, 'active')} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">تفعيل</button>
                    )}
                    <button onClick={() => deleteUser(u)} className="text-xs font-bold text-red-500 hover:underline">حذف</button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500 text-sm">لا يوجد مستخدمين مطابقين.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-white dark:bg-[#111A30] text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-[#0A1020] disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-600 dark:text-slate-400 font-bold">
            صفحة {currentPage} من {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-white dark:bg-[#111A30] text-slate-700 dark:text-slate-300 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-[#0A1020] disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
