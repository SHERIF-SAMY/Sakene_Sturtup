import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiSend } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';

type City = { id: number; name: string; governorate: string };

export default function AdminCities() {
  const [items, setItems] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [gov, setGov] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    apiGet<City[]>('/api/cities').then(setItems).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await apiSend('/api/cities', 'POST', { name, governorate: gov });
    setName('');
    setGov('');
    load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="bg-white dark:bg-[#111A30] rounded-2xl border border-slate-100 dark:border-[#1E2B4A] p-4 flex flex-col sm:flex-row gap-3 shadow-sm">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم المدينة (مثال: كفر الشيخ)" className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-white dark:bg-[#0A1020] text-slate-900 dark:text-white placeholder:text-slate-400 text-sm outline-none focus:border-amber-500" />
        <input value={gov} onChange={(e) => setGov(e.target.value)} placeholder="المحافظة" className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-white dark:bg-[#0A1020] text-slate-900 dark:text-white placeholder:text-slate-400 text-sm outline-none focus:border-amber-500" />
        <button className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm transition shadow-sm">إضافة مدينة</button>
      </form>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((c) => (
          <div key={c.id} className="bg-white dark:bg-[#111A30] rounded-2xl border border-slate-100 dark:border-[#1E2B4A] p-4 shadow-sm">
            <p className="font-bold text-slate-900 dark:text-white text-base">{c.name}</p>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{c.governorate}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
