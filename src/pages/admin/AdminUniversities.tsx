import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiSend } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';

type Uni = { id: number; name: string; city_id: number; cities?: { name: string } };
type City = { id: number; name: string };

export default function AdminUniversities() {
  const [items, setItems] = useState<Uni[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [cityId, setCityId] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([apiGet<Uni[]>('/api/universities'), apiGet<City[]>('/api/cities')])
      .then(([u, c]) => {
        setItems(u);
        setCities(c);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cityId) return;
    await apiSend('/api/universities', 'POST', { name, city_id: Number(cityId) });
    setName('');
    load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="bg-white dark:bg-[#111A30] rounded-2xl border border-slate-100 dark:border-[#1E2B4A] p-4 flex flex-col sm:flex-row gap-3 shadow-sm">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم الجامعة (مثال: جامعة كفر الشيخ)" className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-white dark:bg-[#0A1020] text-slate-900 dark:text-white placeholder:text-slate-400 text-sm outline-none focus:border-amber-500" />
        <select value={cityId} onChange={(e) => setCityId(e.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-white dark:bg-[#0A1020] text-slate-900 dark:text-white text-sm outline-none focus:border-amber-500">
          <option value="">اختر المدينة</option>
          {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm transition shadow-sm">إضافة جامعة</button>
      </form>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((u) => (
          <div key={u.id} className="bg-white dark:bg-[#111A30] rounded-2xl border border-slate-100 dark:border-[#1E2B4A] p-4 shadow-sm">
            <p className="font-bold text-slate-900 dark:text-white text-base">{u.name}</p>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{u.cities?.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
