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
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'pending' | 'active' | 'all'>('pending');

  const load = useCallback(() => {
    setLoading(true);
    // Fetch all properties in a single call using status=all
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

  const handleReject = (id: number) => {
    const reason = window.prompt('Enter rejection reason for the broker:');
    if (reason !== null && reason.trim() !== '') {
      setStatus(id, 'rejected', reason.trim());
    }
  };

  if (loading) return <LoadingSpinner />;

  const filtered = items.filter((p) => {
    if (tab === 'pending' && p.status !== 'pending') return false;
    if (tab === 'active' && p.status !== 'active') return false;
    
    if (search) {
      const s = search.toLowerCase();
      if (!p.title.toLowerCase().includes(s) &&
          !(p.district || '').toLowerCase().includes(s) &&
          !(p.cities?.name || '').toLowerCase().includes(s)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-3">
      <div className="flex gap-2 mb-4 border-b border-slate-200 pb-2">
        <button onClick={() => setTab('pending')} className={`px-4 py-2 text-sm font-semibold rounded-t-lg ${tab === 'pending' ? 'text-brand-700 border-b-2 border-brand-600' : 'text-slate-500 hover:bg-slate-50'}`}>Pending Review</button>
        <button onClick={() => setTab('active')} className={`px-4 py-2 text-sm font-semibold rounded-t-lg ${tab === 'active' ? 'text-brand-700 border-b-2 border-brand-600' : 'text-slate-500 hover:bg-slate-50'}`}>Active</button>
        <button onClick={() => setTab('all')} className={`px-4 py-2 text-sm font-semibold rounded-t-lg ${tab === 'all' ? 'text-brand-700 border-b-2 border-brand-600' : 'text-slate-500 hover:bg-slate-50'}`}>All Properties</button>
      </div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by title, district or city…"
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-brand-500 mb-3"
      />
      {filtered.map((p) => (
        <div key={p.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <Link to={`/properties/${p.id}`} className="font-semibold text-slate-900 hover:text-brand-600">{p.title}</Link>
            <p className="text-sm text-slate-500">{p.district} · {p.cities?.name} · {p.broker_profiles?.company_name}</p>
            <p className={`text-xs capitalize mt-1 font-medium ${
              p.status === 'active' ? 'text-green-600' :
              p.status === 'pending' ? 'text-amber-600' :
              p.status === 'rejected' ? 'text-red-600' :
              'text-slate-500'
            }`}>{p.status}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {p.status === 'pending' && (
              <>
                <button onClick={() => setStatus(p.id, 'active', null)} className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700">Approve</button>
                <button onClick={() => handleReject(p.id)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100">Reject</button>
              </>
            )}
            {p.status !== 'pending' && (
              <>
                {p.status !== 'active' && <button onClick={() => setStatus(p.id, 'active', null)} className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-semibold hover:bg-brand-100">Activate</button>}
                {p.status === 'active' && <button onClick={() => setStatus(p.id, 'inactive')} className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold hover:bg-slate-200">Pause</button>}
                {p.status !== 'archived' && <button onClick={() => setStatus(p.id, 'archived')} className="px-3 py-1.5 rounded-lg text-red-600 text-xs font-semibold hover:bg-red-50">Archive</button>}
              </>
            )}
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <p className="text-center text-slate-400 py-8 text-sm">No properties found.</p>
      )}
    </div>
  );
}
