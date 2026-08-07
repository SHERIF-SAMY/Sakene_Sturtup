import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet, apiSend } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';

type Prop = {
  id: number;
  title: string;
  district: string;
  status: string;
  cities?: { name: string };
  broker_profiles?: { company_name?: string };
};

export default function AdminProperties() {
  const [items, setItems] = useState<Prop[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    // fetch all by requesting without default active filter via broker-less with status empty - use multiple
    Promise.all([
      apiGet<Prop[]>('/api/properties?status=active'),
      apiGet<Prop[]>('/api/properties?status=inactive'),
      apiGet<Prop[]>('/api/properties?status=archived'),
    ])
      .then(([a, b, c]) => setItems([...a, ...b, ...c]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id: number, status: string) => {
    await apiSend('/api/properties', 'PUT', { id, status });
    load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-3">
      {items.map((p) => (
        <div key={p.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <Link to={`/properties/${p.id}`} className="font-semibold text-slate-900 hover:text-brand-600">{p.title}</Link>
            <p className="text-sm text-slate-500">{p.district} · {p.cities?.name} · {p.broker_profiles?.company_name}</p>
            <p className="text-xs capitalize mt-1 text-slate-400">{p.status}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStatus(p.id, 'active')} className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-semibold">Activate</button>
            <button onClick={() => setStatus(p.id, 'inactive')} className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold">Pause</button>
            <button onClick={() => setStatus(p.id, 'archived')} className="px-3 py-1.5 rounded-lg text-red-600 text-xs font-semibold">Archive</button>
          </div>
        </div>
      ))}
    </div>
  );
}
