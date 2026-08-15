import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiSend, formatPrice } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { DollarSign, RefreshCw, ShieldCheck, CheckCircle, Calendar, TrendingUp } from 'lucide-react';

type AdminStat = {
  id: string;
  name: string;
  role: string;
  totalEarnings: number;
  completedCount: number;
};

type CompletedVisit = { id: number; created_at: string; visit_date?: string };
type EarningItem = { id: number; admin_id: string; visit_id: number; amount: number; operation: string; created_at: string };

type Stats = {
  users: number;
  properties: number;
  visits: number;
  reviews: number;
  recentVisits: { status: string; visit_date: string; created_at: string }[];
  completedVisits?: CompletedVisit[];
  earnings?: EarningItem[];
  totalCompletedVisits?: number;
  totalRevenue?: number;
  adminStats?: AdminStat[];
};

const ARABIC_MONTHS: Record<string, string> = {
  '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'أبريل',
  '05': 'مايو', '06': 'يونيو', '07': 'يوليو', '08': 'أغسطس',
  '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر',
};

function formatMonthYear(monthStr: string): string {
  if (monthStr === 'all') return 'جميع الأوقات الإجمالية';
  const [year, month] = monthStr.split('-');
  const monthName = ARABIC_MONTHS[month] || month;
  return `${monthName} ${year}`;
}

export default function AdminAnalytics() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [msg, setMsg] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const isSuperAdmin = profile?.role === 'super_admin';

  const loadData = () => {
    setLoading(true);
    apiGet<Stats>('/api/analytics?scope=admin')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute available months list dynamically
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    (stats?.completedVisits || []).forEach((v) => {
      const d = v.created_at || v.visit_date || '';
      if (d.length >= 7) monthsSet.add(d.slice(0, 7));
    });
    (stats?.earnings || []).forEach((e) => {
      if (e.created_at && e.created_at.length >= 7) monthsSet.add(e.created_at.slice(0, 7));
    });
    const currentMonth = new Date().toISOString().slice(0, 7);
    monthsSet.add(currentMonth);
    return Array.from(monthsSet).sort().reverse();
  }, [stats]);

  // Filter completed visits and earnings by selected month
  const filteredCompletedVisits = useMemo(() => {
    const visits = stats?.completedVisits || [];
    if (selectedMonth === 'all') return visits;
    return visits.filter((v) => {
      const d = v.created_at || v.visit_date || '';
      return d.startsWith(selectedMonth);
    });
  }, [stats, selectedMonth]);

  const filteredEarnings = useMemo(() => {
    const items = stats?.earnings || [];
    if (selectedMonth === 'all') return items;
    return items.filter((e) => e.created_at && e.created_at.startsWith(selectedMonth));
  }, [stats, selectedMonth]);

  // Revenue for selected period (400 EGP per completed operation)
  const periodRevenue = filteredCompletedVisits.length * 400;

  // Per-admin breakdown for selected month
  const adminMonthlyStats = useMemo(() => {
    const admins = stats?.adminStats || [];
    return admins.map((adm) => {
      const admVisits = filteredCompletedVisits.filter((v) => (v as any).processed_by_admin_id === adm.id);
      const admEarnings = filteredEarnings.filter((e) => e.admin_id === adm.id);
      let count = Math.max(admVisits.length, admEarnings.length);

      // If count is 0 and only 1 admin/super_admin exists, attribute the completed visits to them
      if (count === 0 && (adm.role === 'super_admin' || admins.length === 1)) {
        count = filteredCompletedVisits.length;
      }

      return {
        ...adm,
        periodCompletedCount: count,
        periodEarnings: count * 400,
      };
    });
  }, [stats, filteredCompletedVisits, filteredEarnings]);

  const handleResetEarnings = async (adminId?: string) => {
    if (!confirm(adminId ? 'هل أنت تأكد من تصفير أرباح هذا الأدمن؟' : 'هل أنت تأكد من تصفير كافة أرباح المسؤولين؟')) {
      return;
    }
    setResetting(true);
    setMsg('');
    try {
      const url = adminId
        ? `/api/analytics?scope=admin&action=reset_earnings&admin_id=${adminId}`
        : `/api/analytics?scope=admin&action=reset_earnings`;
      await apiSend(url, 'POST', {});
      setMsg('تم تصفير الأرباح بنجاح');
      loadData();
    } catch (e: any) {
      alert(e.message || 'فشل التصفير');
    } finally {
      setResetting(false);
    }
  };

  if (loading) return <LoadingSpinner label="جاري تحميل إحصائيات وأرباح Agarly..." />;

  const byStatus: Record<string, number> = {};
  (stats?.recentVisits || []).forEach((v) => {
    byStatus[v.status] = (byStatus[v.status] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-semibold">
          {msg}
        </div>
      )}

      {/* Header Month Filter Bar */}
      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base">فلترة الأرباح والحسابات بالشهر</h2>
            <p className="text-xs text-slate-500 mt-0.5">اختر الشهر لعرض صافي أرباح المنصة وحسابات العمليات المكتملة</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">الفترة المالية:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-800 outline-none focus:border-brand-600 cursor-pointer"
          >
            <option value="all">كل الأوقات (الإجمالي التراكمي)</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {formatMonthYear(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-100">أرباح المنصة ({formatMonthYear(selectedMonth)})</span>
            <TrendingUp className="w-5 h-5 text-emerald-200" />
          </div>
          <p className="text-2xl md:text-3xl font-bold mt-2">{formatPrice(periodRevenue)}</p>
          <p className="text-[11px] text-emerald-200 mt-1">400 ج مصري لكل عملية ناجحة (200ج مستأجر + 200ج مالك)</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
          <span className="text-xs font-medium text-slate-500">العمليات المكتملة</span>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">{filteredCompletedVisits.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">عملية مؤكدة ومكتملة بالفترة</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
          <span className="text-xs font-medium text-slate-500">إجمالي العقارات</span>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">{stats?.properties || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">عقار مدرج بالنظام</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
          <span className="text-xs font-medium text-slate-500">إجمالي المستخدمين</span>
          <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">{stats?.users || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">مستأجر ومالك ووسيط</p>
        </div>
      </div>

      {/* Super Admin Dashboard Section */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-5 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-brand-400" />
                <h2 className="text-xl font-bold">لوحة أرباح وحسابات الأدمنز ({formatMonthYear(selectedMonth)})</h2>
              </div>
              <p className="text-slate-400 text-xs mt-1">تفاصيل أرباح وعدد العمليات المنفذة بواسطة كل أدمن بالفترة المختارة.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-400">إجمالي أرباح الفترة</p>
                <p className="text-xl font-bold text-emerald-400">{formatPrice(periodRevenue)}</p>
              </div>
              <button
                onClick={() => handleResetEarnings()}
                disabled={resetting}
                className="px-3.5 py-2 bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
                تصفير العدادات
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminMonthlyStats.map((adm) => (
              <div key={adm.id} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-100 text-base">{adm.name}</span>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                      {adm.role}
                    </span>
                  </div>
                  <div className="space-y-1.5 mt-3 text-xs text-slate-300">
                    <p className="flex justify-between">
                      <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> عمليات الفترة المكتملة:</span>
                      <span className="font-bold text-white">{adm.periodCompletedCount}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-amber-400" /> عمولات الفترة (400ج/عملية):</span>
                      <span className="font-bold text-emerald-400">{formatPrice(adm.periodEarnings)}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleResetEarnings(adm.id)}
                  disabled={resetting}
                  className="mt-4 w-full py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold rounded-lg transition"
                >
                  تصفير عداد الأدمن
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking status stats */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4">حالات الحجوزات الكلية بالنظام</h3>
        <div className="space-y-3">
          {Object.entries(byStatus).map(([status, count]) => {
            const pct = stats?.recentVisits?.length ? Math.round((count / stats.recentVisits.length) * 100) : 0;
            return (
              <div key={status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="capitalize font-medium text-slate-700">
                    {status === 'pending' ? 'قيد الانتظار' : status === 'confirmed' ? 'مؤكد' : status === 'completed' ? 'مكتمل' : status}
                  </span>
                  <span className="text-slate-500">{count} ({pct}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          {!Object.keys(byStatus).length && <p className="text-sm text-slate-500">لا توجد بيانات حجوزات حالياً.</p>}
        </div>
      </div>
    </div>
  );
}
