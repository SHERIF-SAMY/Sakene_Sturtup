import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Heart, Bell, Search } from 'lucide-react';
import { apiGet } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function StudentOverview() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ favorites: 0, bookings: 0, upcoming: 0, unread: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    apiGet<typeof stats>(`/api/analytics?scope=student&user_id=${user.id}`)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-brand-600 to-blue-500 rounded-3xl p-6 text-white">
        <h2 className="text-xl font-bold">Hi {profile?.first_name || 'there'} 👋</h2>
        <p className="text-blue-100 mt-1">Ready to find your next student home?</p>
        <Link
          to="/search"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-brand-700 font-semibold text-sm"
        >
          <Search className="w-4 h-4" /> Browse housing
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card icon={Heart} label="Saved" value={stats.favorites} to="/dashboard/favorites" color="bg-rose-50 text-rose-600" />
        <Card icon={CalendarDays} label="Bookings" value={stats.bookings} to="/dashboard/bookings" color="bg-brand-50 text-brand-600" />
        <Card icon={CalendarDays} label="Upcoming" value={stats.upcoming} to="/dashboard/bookings" color="bg-amber-50 text-amber-600" />
        <Card icon={Bell} label="Unread" value={stats.unread} to="/dashboard/notifications" color="bg-violet-50 text-violet-600" />
      </div>
    </div>
  );
}

function Card({
  icon: Icon, label, value, to, color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  to: string;
  color: string;
}) {
  return (
    <Link to={to} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-sm transition">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </Link>
  );
}
