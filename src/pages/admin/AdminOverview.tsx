import { useEffect, useState } from 'react';
import { Users, Building2, CalendarDays, MapPin, Star, TrendingUp } from 'lucide-react';
import { apiGet, formatPrice } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';

type Stats = {
  users: number;
  properties: number;
  visits: number;
  universities: number;
  cities: number;
  reviews: number;
  totalCompletedVisits?: number;
  totalRevenue?: number;
  roles: Record<string, number>;
};

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Stats>('/api/analytics?scope=admin')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/40 font-bold">400 ج / عملية</span>
          </div>
          <p className="mt-4 text-3xl font-bold">{formatPrice(stats?.totalRevenue || 0)}</p>
          <p className="text-xs text-emerald-100 mt-1">أرباح المنصة ({stats?.totalCompletedVisits || 0} عملية مكتملة)</p>
        </div>
        <Card icon={Users} label="المستخدمين" value={stats?.users || 0} />
        <Card icon={Building2} label="العقارات" value={stats?.properties || 0} />
        <Card icon={CalendarDays} label="الحجوزات الإجمالية" value={stats?.visits || 0} />
        <Card icon={MapPin} label="المدن والمناطق" value={stats?.cities || 0} />
        <Card icon={Star} label="التقييمات" value={stats?.reviews || 0} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="font-bold text-slate-900 mb-4">Users by role</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(stats?.roles || {}).map(([role, count]) => (
            <div key={role} className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{count}</p>
              <p className="text-xs text-slate-500 capitalize">{role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
