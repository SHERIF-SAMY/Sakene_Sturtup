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
      <form onSubmit={add} className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="City name" className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200" />
        <input value={gov} onChange={(e) => setGov(e.target.value)} placeholder="Governorate" className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200" />
        <button className="px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm">Add</button>
      </form>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-slate-100 p-4">
            <p className="font-semibold text-slate-900">{c.name}</p>
            <p className="text-sm text-slate-500">{c.governorate}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
