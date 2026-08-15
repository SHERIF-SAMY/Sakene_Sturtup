import { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { apiGet, apiSend } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

type Notif = {
  id: number;
  title: string;
  body?: string;
  message?: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export default function AdminNotifications() {
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

  if (loading) return <LoadingSpinner label="جاري تحميل الإشعارات..." />;

  const unreadCount = items.filter((i) => !i.is_read).length;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-600" /> إشعارات النظام والأدمن
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">تابع التنبيهات والطلبات التي تتطلب اتخاذ إجراء</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 text-xs font-semibold hover:bg-brand-100 transition"
          >
            <CheckCheck className="w-4 h-4" /> تحديد الكل كقروء ({unreadCount})
          </button>
        )}
      </div>

      {!items.length ? (
        <EmptyState title="لا توجد إشعارات حالياً" description="سيتم إخطارك بأي طلبات حجز جديدة أو تحديثات على العقارات هنا." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => !item.is_read && markOne(item.id)}
              className={`p-4 rounded-2xl border transition cursor-pointer ${
                item.is_read
                  ? 'bg-slate-50/50 border-slate-100 text-slate-600'
                  : 'bg-brand-50/30 border-brand-200 text-slate-900 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    {!item.is_read && <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />}
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.body || item.message}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(item.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
