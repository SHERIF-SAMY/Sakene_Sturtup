import { useCallback, useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { apiGet, apiSend } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

type Notif = {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export default function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    apiGet<Notif[]>(`/api/notifications?user_id=${user.id}`)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const markAll = async () => {
    if (!user) return;
    await apiSend('/api/notifications', 'PUT', { user_id: user.id, mark_all: true });
    load();
  };

  const markOne = async (id: number) => {
    await apiSend('/api/notifications', 'PUT', { id });
    load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg text-slate-900">Notifications</h2>
        {items.some((n) => !n.is_read) && (
          <button onClick={markAll} className="text-sm font-semibold text-brand-600">Mark all read</button>
        )}
      </div>
      {!items.length ? (
        <EmptyState title="No notifications" description="Updates about visits and account activity will show here." />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.is_read && markOne(n.id)}
              className={`w-full text-left rounded-2xl border p-4 transition ${
                n.is_read ? 'bg-white border-slate-100' : 'bg-brand-50/50 border-brand-100'
              }`}
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-brand-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{n.title}</p>
                  <p className="text-sm text-slate-600 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
