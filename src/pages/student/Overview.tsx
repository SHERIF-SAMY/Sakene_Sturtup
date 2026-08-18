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
      <div className="bg-[#2B3143] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-[#3D455C] shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FCB431]/15 rounded-full blur-3xl pointer-events-none" />
        <h2 className="text-2xl font-black relative z-10">
          مرحباً بك، {profile?.first_name || 'طالبنا العزيز'}
        </h2>
        <p className="text-slate-300 mt-1 text-sm relative z-10">جاهز لاختيار سكنك القادم بالقرب من كليتك؟</p>
        <Link
          to="/search"
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FCB431] hover:bg-[#EAA01C] text-[#000616] font-black text-xs transition shadow-md relative z-10"
        >
          <Search className="w-4 h-4" /> تصفح الشقق المتاحة
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card icon={Heart} label="الشقق المحفوظة" value={stats.favorites} to="/dashboard/favorites" color="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400" />
        <Card icon={CalendarDays} label="إجمالي الحجوزات" value={stats.bookings} to="/dashboard/bookings" color="bg-[#FFF8EB] dark:bg-[#1E2B4A] text-[#FCB431]" />
        <Card icon={CalendarDays} label="المعاينات القادمة" value={stats.upcoming} to="/dashboard/bookings" color="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400" />
        <Card icon={Bell} label="إشعارات غير مقروءة" value={stats.unread} to="/dashboard/notifications" color="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400" />
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
    <Link to={to} className="bg-white dark:bg-[#111A30] rounded-2xl border border-slate-200/80 dark:border-[#1E2B4A] p-5 hover:shadow-md hover:border-[#FCB431] transition">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="mt-4 text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</p>
    </Link>
  );
}
