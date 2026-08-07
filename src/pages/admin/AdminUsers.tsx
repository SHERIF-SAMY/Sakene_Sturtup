import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiSend } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';

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

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <LoadingSpinner />;

  return (
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
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-900">{u.first_name} {u.last_name}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </td>
                <td className="px-4 py-3 capitalize">{u.role}</td>
                <td className="px-4 py-3 capitalize">{u.status}</td>
                <td className="px-4 py-3">{u.is_verified ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3 space-x-2">
                  <button onClick={() => toggleVerify(u)} className="text-xs font-semibold text-brand-600">
                    {u.is_verified ? 'Unverify' : 'Verify'}
                  </button>
                  {u.status === 'active' ? (
                    <button onClick={() => setStatus(u, 'suspended')} className="text-xs font-semibold text-red-600">Suspend</button>
                  ) : (
                    <button onClick={() => setStatus(u, 'active')} className="text-xs font-semibold text-emerald-600">Activate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
