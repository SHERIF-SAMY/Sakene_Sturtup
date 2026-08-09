import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet, apiSend, formatPrice } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

type Prop = {
  id: number;
  title: string;
  district: string;
  status: string;
  property_images?: { image_url: string; is_cover?: boolean }[];
  listings?: { price: number; status: string }[];
  rejection_reason?: string;
};

export default function BrokerProperties() {
  const { user } = useAuth();
  const [items, setItems] = useState<Prop[]>([]);
  const [loading, setLoading] = useState(true);
  const [brokerId, setBrokerId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const b = await apiGet<{ id: number }>(`/api/brokers?user_id=${user.id}`);
      setBrokerId(b.id);
      const props = await apiGet<Prop[]>(`/api/properties?broker_id=${b.id}`);
      setItems(props);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (id: number, status: string) => {
    await apiSend('/api/properties', 'PUT', { id, status });
    load();
  };

  if (loading) return <LoadingSpinner />;
  if (!items.length) {
    return (
      <EmptyState
        title="No properties yet"
        description="Add your first student housing listing."
        action={
          <Link to="/broker/add" className="px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm">
            Add property
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((p) => {
        const img =
          p.property_images?.find((i) => i.is_cover)?.image_url ||
          p.property_images?.[0]?.image_url ||
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80';
        const price = Math.min(...(p.listings || []).map((l) => l.price).concat([0]));
        return (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex gap-4 items-start">
            <img src={img} alt="" className="w-24 h-20 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <Link to={`/properties/${p.id}`} className="font-semibold text-slate-900 hover:text-brand-600 line-clamp-1">
                {p.title}
              </Link>
              <p className="text-sm text-slate-500">{p.district}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm font-medium text-brand-700">
                  from {price ? formatPrice(price) : '—'}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                  p.status === 'active' ? 'bg-green-100 text-green-700' :
                  p.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  p.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {p.status}
                </span>
              </div>
              {p.status === 'rejected' && p.rejection_reason && (
                <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded-lg">
                  <span className="font-semibold">Admin feedback:</span> {p.rejection_reason}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              {p.status === 'active' && (
                <button onClick={() => setStatus(p.id, 'inactive')} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">
                  Pause
                </button>
              )}
              {p.status === 'inactive' && (
                <button onClick={() => setStatus(p.id, 'active')} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100">
                  Activate
                </button>
              )}
              <Link to={`/broker/edit/${p.id}`} className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-600 bg-slate-50 text-center hover:bg-slate-100">
                Edit
              </Link>
              <button onClick={() => setStatus(p.id, 'archived')} className="text-xs font-semibold px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50">
                Archive
              </button>
            </div>
          </div>
        );
      })}
      {brokerId && null}
    </div>
  );
}
