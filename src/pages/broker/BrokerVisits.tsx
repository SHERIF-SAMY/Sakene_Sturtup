import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiSend } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

type Visit = {
  id: number;
  visit_date: string;
  visit_time: string;
  status: string;
  notes: string;
  student?: { first_name: string; last_name: string; phone?: string; email?: string };
  listings?: { properties?: { title: string } };
};

export default function BrokerVisits() {
  const { user } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    apiGet<Visit[]>(`/api/visits?broker_id=${user.id}`)
      .then(setVisits)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const update = async (id: number, status: string) => {
    await apiSend('/api/visits', 'PUT', { id, status });
    load();
  };

  if (loading) return <LoadingSpinner />;
  if (!visits.length) return <EmptyState title="No visits yet" description="When students book tours, they appear here." />;

  return (
    <div className="space-y-3">
      {visits.map((v) => (
        <div key={v.id} className="bg-white rounded-2xl border border-slate-100 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-900">{v.listings?.properties?.title || 'Listing visit'}</p>
              <p className="text-sm text-slate-500 mt-0.5">
                {v.student?.first_name} {v.student?.last_name} · {v.student?.phone || v.student?.email}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {v.visit_date} at {v.visit_time} · <span className="capitalize font-medium">{v.status}</span>
              </p>
              {v.notes && <p className="text-xs text-slate-400 mt-1">{v.notes}</p>}
            </div>
            {['pending', 'confirmed'].includes(v.status) && (
              <div className="flex flex-wrap gap-2">
                {v.status === 'pending' && (
                  <button onClick={() => update(v.id, 'confirmed')} className="px-3 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold">
                    Confirm
                  </button>
                )}
                <button onClick={() => update(v.id, 'completed')} className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold">
                  Complete
                </button>
                <button onClick={() => update(v.id, 'cancelled')} className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
