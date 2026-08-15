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
          placeholder="Search by name or email…"
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-brand-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm"
        >
          <option value="">All roles</option>
          <option value="tenant">Tenant</option>
          <option value="student">Student</option>
          <option value="owner">Owner</option>
          <option value="broker">Broker</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      <p className="text-xs text-slate-400">
        Showing {paginated.length} of {filtered.length} users (total: {users.length})
      </p>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{u.first_name} {u.last_name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={async (e) => {
                        const newRole = e.target.value;
                        await apiSend('/api/profiles', 'PUT', { id: u.id, role: newRole });
                        load();
                      }}
                      className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold capitalize bg-slate-50"
                    >
                      <option value="tenant">tenant</option>
                      <option value="student">student</option>
                      <option value="owner">owner</option>
                      <option value="broker">broker</option>
                      <option value="admin">admin</option>
                      <option value="super_admin">super_admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 capitalize">{u.status}</td>
                  <td className="px-4 py-3">{u.is_verified ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => toggleVerify(u)} className="text-xs font-semibold text-brand-600">
                      {u.is_verified ? 'Unverify' : 'Verify'}
                    </button>
                    {u.status === 'active' ? (
                      <button onClick={() => setStatus(u, 'suspended')} className="text-xs font-semibold text-orange-600">Suspend</button>
                    ) : (
                      <button onClick={() => setStatus(u, 'active')} className="text-xs font-semibold text-emerald-600">Activate</button>
                    )}
                    <button onClick={() => deleteUser(u)} className="text-xs font-semibold text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">No users found.</td>
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
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-600 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
