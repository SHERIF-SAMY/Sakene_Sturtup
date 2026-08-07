import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, CalendarDays, QrCode, Star, TrendingUp } from 'lucide-react';
import { apiGet } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

type Broker = { id: number; slug: string; company_name: string };
type Stats = {
  properties: number;
  activeProperties: number;
  visits: number;
  pendingVisits: number;
  confirmedVisits: number;
  completedVisits: number;
  reviews: number;
  avgRating: number;
  qrScans: number;
  conversionRate: number;
};

export default function BrokerOverview() {
  const { user } = useAuth();
  const [broker, setBroker] = useState<Broker | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const b = await apiGet<Broker>(`/api/brokers?user_id=${user.id}`);
        setBroker(b);
        const s = await apiGet<Stats>(`/api/analytics?scope=broker&broker_id=${b.id}`);
        setStats(s);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{broker?.company_name || 'Your agency'}</h2>
          <p className="text-sm text-slate-500 mt-1">Public page: /b/{broker?.slug}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/b/${broker?.slug}`} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold">
            View public page
          </Link>
          <Link to="/broker/add" className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold">
            Add property
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Properties" value={stats?.properties || 0} sub={`${stats?.activeProperties || 0} active`} />
        <StatCard icon={CalendarDays} label="Visits" value={stats?.visits || 0} sub={`${stats?.pendingVisits || 0} pending`} />
        <StatCard icon={Star} label="Avg rating" value={stats?.avgRating || 0} sub={`${stats?.reviews || 0} reviews`} />
        <StatCard icon={QrCode} label="QR scans" value={stats?.qrScans || 0} sub={`${stats?.conversionRate || 0}% conversion`} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center gap-2 font-bold text-slate-900 mb-4">
          <TrendingUp className="w-5 h-5 text-brand-600" /> Visit pipeline
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Pipe label="Pending" value={stats?.pendingVisits || 0} color="bg-amber-500" />
          <Pipe label="Confirmed" value={stats?.confirmedVisits || 0} color="bg-brand-500" />
          <Pipe label="Completed" value={stats?.completedVisits || 0} color="bg-emerald-500" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}

function Pipe({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 text-center">
      <div className={`w-2 h-2 rounded-full ${color} mx-auto mb-2`} />
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
