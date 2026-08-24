import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiGet, apiSend } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';

type Prop = {
  id: number;
  title: string;
  district: string;
  status: string;
  property_number?: number;
  is_featured?: boolean;
  cities?: { name: string };
  broker_profiles?: { company_name?: string };
};

export default function AdminProperties() {
  const { profile } = useAuth();
  const [items, setItems] = useState<Prop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'pending' | 'active' | 'archived'>('all');

  const load = useCallback(() => {
    setLoading(true);
    apiGet<Prop[]>('/api/properties?status=all')
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id: number, status: string, rejection_reason?: string | null) => {
    await apiSend('/api/properties', 'PUT', { id, status, admin_action: true, rejection_reason });
    load();
  };

  const deleteProperty = async (id: number) => {
    if (!window.confirm('هل أنت تأكد من رغبتك في حذف هذا العقار نهائياً؟')) return;
    try {
      await apiSend('/api/properties', 'DELETE', { id });
      load();
    } catch (e: any) {
      alert(e.message || 'فشل حذف العقار');
    }
  };

  const toggleFeatured = async (id: number, current: boolean) => {
    await apiSend('/api/properties', 'PUT', { id, is_featured: !current, admin_action: true });
    load();
  };

  const handleReject = (id: number) => {
    const reason = window.prompt('سبب رفض العقار للوسيط/المالك:');
    if (reason !== null && reason.trim() !== '') {
      setStatus(id, 'rejected', reason.trim());
    }
  };

  if (loading) return <LoadingSpinner label="جاري تحميل عقارات المنصة..." />;

  const pendingCount = items.filter((p) => p.status === 'pending').length;
  const activeCount = items.filter((p) => p.status === 'active').length;
  const archivedCount = items.filter((p) => p.status === 'archived').length;

  const filtered = items.filter((p) => {
    if (tab === 'pending' && p.status !== 'pending') return false;
    if (tab === 'active' && p.status !== 'active') return false;
    if (tab === 'archived' && p.status !== 'archived') return false;
    
    if (search) {
      const s = search.toLowerCase().trim().replace('#', '');
      const propNumStr = String(p.property_number || '');
      const propIdStr = String(p.id);
      const titleMatch = p.title.toLowerCase().includes(s);
      const districtMatch = (p.district || '').toLowerCase().includes(s);
      const cityMatch = (p.cities?.name || '').toLowerCase().includes(s);
      const numMatch = propNumStr === s || propIdStr === s;

      if (!titleMatch && !districtMatch && !cityMatch && !numMatch) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="flex gap-2 mb-4 border-b border-slate-200 dark:border-[#1E2B4A] pb-2 overflow-x-auto scrollbar-none">
        <button onClick={() => setTab('all')} className={`px-4 py-2 text-sm font-semibold rounded-t-lg whitespace-nowrap transition ${tab === 'all' ? 'text-amber-500 dark:text-amber-400 border-b-2 border-amber-500 font-bold bg-amber-500/10' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#111A30]'}`}>الكل ({items.length})</button>
        <button onClick={() => setTab('pending')} className={`px-4 py-2 text-sm font-semibold rounded-t-lg whitespace-nowrap transition ${tab === 'pending' ? 'text-amber-500 dark:text-amber-400 border-b-2 border-amber-500 font-bold bg-amber-500/10' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#111A30]'}`}>قيد الانتظار والمراجعة ({pendingCount})</button>
        <button onClick={() => setTab('active')} className={`px-4 py-2 text-sm font-semibold rounded-t-lg whitespace-nowrap transition ${tab === 'active' ? 'text-amber-500 dark:text-amber-400 border-b-2 border-amber-500 font-bold bg-amber-500/10' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#111A30]'}`}>نشطة ومتاحة ({activeCount})</button>
        <button onClick={() => setTab('archived')} className={`px-4 py-2 text-sm font-semibold rounded-t-lg whitespace-nowrap transition ${tab === 'archived' ? 'text-amber-500 dark:text-amber-400 border-b-2 border-amber-500 font-bold bg-amber-500/10' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#111A30]'}`}>الأرشيف ({archivedCount})</button>
      </div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="ابحث برقم الشقة المميز (#)، العنوان، المنطقة أو المدينة…"
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-white dark:bg-[#111A30] text-slate-900 dark:text-white placeholder:text-slate-400 text-sm outline-none focus:border-amber-500 mb-3 shadow-sm"
      />
      {filtered.map((p) => (
        <div key={p.id} className="bg-white dark:bg-[#111A30] rounded-2xl border border-slate-100 dark:border-[#1E2B4A] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <Link to={`/properties/${p.id}`} target="_blank" className="font-bold text-slate-900 dark:text-white hover:text-amber-500">
                {p.title}
              </Link>
              {p.property_number && (
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black border border-amber-500/20">
                  شقة رقم #{p.property_number}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{p.district} · {p.cities?.name} · {p.broker_profiles?.company_name || 'مالك مباشر'}</p>
            <p className={`text-xs capitalize mt-1 font-bold ${
              p.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' :
              p.status === 'pending' ? 'text-amber-600 dark:text-amber-400' :
              p.status === 'rejected' ? 'text-rose-600 dark:text-rose-400' :
              'text-slate-500 dark:text-slate-400'
            }`}>
              حالة الشقة: {p.status === 'active' ? 'نشطة ومتاحة' : p.status === 'pending' ? 'قيد الانتظار' : p.status === 'archived' ? 'مؤرشفة' : p.status} 
              {p.is_featured && <span className="mr-2 px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-bold">★ شقة خاصة مميزة</span>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Preview Button */}
            <Link
              to={`/properties/${p.id}`}
              target="_blank"
              className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-bold border border-blue-200 dark:border-blue-800 transition"
            >
              معاينة الشقة والتفاصيل
            </Link>

            {p.status === 'pending' && (
              <>
                <button onClick={() => setStatus(p.id, 'active', null)} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-sm">موافقة وتفعيل</button>
                <button onClick={() => handleReject(p.id)} className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 border border-rose-200 dark:border-rose-800 transition">رفض</button>
              </>
            )}
            {p.status !== 'pending' && (
              <>
                {p.status !== 'active' && <button onClick={() => setStatus(p.id, 'active', null)} className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition">تفعيل الشقة</button>}
                {p.status === 'active' && <button onClick={() => setStatus(p.id, 'inactive')} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#0A1020] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-[#1E2B4A] border border-slate-200 dark:border-[#1E2B4A] transition">إيقاف مؤقت</button>}
                {p.status !== 'archived' && <button onClick={() => setStatus(p.id, 'archived')} className="px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#0A1020] text-xs font-bold hover:bg-slate-100 border border-slate-200 dark:border-[#1E2B4A] transition">أرشفة</button>}
                <button onClick={() => toggleFeatured(p.id, p.is_featured || false)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${p.is_featured ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30' : 'bg-slate-50 dark:bg-[#0A1020] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E2B4A] border-slate-200 dark:border-[#1E2B4A]'}`}>
                  {p.is_featured ? 'إلغاء التمييز' : 'تمييز كشقة خاصة'}
                </button>
              </>
            )}

            {/* Delete button */}
            <button
              onClick={() => deleteProperty(p.id)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition shadow-sm"
            >
              حذف نهائي
            </button>
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <p className="text-center text-slate-400 dark:text-slate-500 py-8 text-sm font-semibold">لا توجد عقارات مطابقة للبحث.</p>
      )}
    </div>
  );
}
