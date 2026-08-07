import { useEffect, useState } from 'react';
import { Users, Building2, CalendarDays, GraduationCap, MapPin, Star } from 'lucide-react';
import { apiGet } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';

type Stats = {
  users: number;
  properties: number;
  visits: number;
  universities: number;
  cities: number;
  reviews: number;
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
        <Card icon={Users} label="Users" value={stats?.users || 0} />
        <Card icon={Building2} label="Properties" value={stats?.properties || 0} />
        <Card icon={CalendarDays} label="Visits" value={stats?.visits || 0} />
        <Card icon={GraduationCap} label="Universities" value={stats?.universities || 0} />
        <Card icon={MapPin} label="Cities" value={stats?.cities || 0} />
        <Card icon={Star} label="Reviews" value={stats?.reviews || 0} />
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
