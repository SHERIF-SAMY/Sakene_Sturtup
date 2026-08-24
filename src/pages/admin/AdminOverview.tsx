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
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-slate-950/10 text-slate-950 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-950/20 font-black">إجمالي النشاط</span>
          </div>
          <p className="mt-4 text-3xl font-black">{stats?.totalCompletedVisits || 0}</p>
          <p className="text-xs font-bold text-slate-900 mt-1">حجوزات وعمليات إيجار مكتملة بنجاح</p>
        </div>
        <Card icon={Users} label="المستخدمين" value={stats?.users || 0} />
        <Card icon={Building2} label="العقارات" value={stats?.properties || 0} />
        <Card icon={CalendarDays} label="الحجوزات الإجمالية" value={stats?.visits || 0} />
        <Card icon={MapPin} label="المدن والمناطق" value={stats?.cities || 0} />
        <Card icon={Star} label="التقييمات" value={stats?.reviews || 0} />
      </div>

      <div className="bg-white dark:bg-[#111A30] rounded-2xl border border-slate-100 dark:border-[#1E2B4A] p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">المستخدمين حسب نوع الحساب</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(stats?.roles || {}).map(([role, count]) => (
            <div key={role} className="rounded-xl bg-slate-50 dark:bg-[#0A1020] p-4 text-center border border-slate-100 dark:border-[#1E2B4A]">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{count}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-1 font-semibold">{role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-[#111A30] rounded-2xl border border-slate-100 dark:border-[#1E2B4A] p-5 shadow-sm">
      <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}
