import { useEffect, useState } from 'react';
import { apiGet } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';

type Stats = {
  users: number;
  properties: number;
  visits: number;
  reviews: number;
  recentVisits: { status: string; visit_date: string; created_at: string }[];
};

export default function AdminAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Stats>('/api/analytics?scope=admin')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const byStatus: Record<string, number> = {};
  (stats?.recentVisits || []).forEach((v) => {
    byStatus[v.status] = (byStatus[v.status] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          ['Users', stats?.users],
          ['Properties', stats?.properties],
          ['Visits', stats?.visits],
          ['Reviews', stats?.reviews],
        ].map(([l, v]) => (
          <div key={String(l)} className="bg-white rounded-2xl border border-slate-100 p-5">
            <p className="text-2xl font-bold text-slate-900">{v as number}</p>
            <p className="text-sm text-slate-500">{l as string}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="font-bold text-slate-900 mb-4">Recent visit statuses</h3>
        <div className="space-y-3">
          {Object.entries(byStatus).map(([status, count]) => {
            const pct = stats?.recentVisits?.length ? Math.round((count / stats.recentVisits.length) * 100) : 0;
            return (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize font-medium text-slate-700">{status}</span>
                  <span className="text-slate-500">{count} ({pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          {!Object.keys(byStatus).length && <p className="text-sm text-slate-500">No visit data yet.</p>}
        </div>
      </div>
    </div>
  );
}
