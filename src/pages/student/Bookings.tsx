import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { apiGet, apiSend, formatPrice, listingTypeLabel } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

type Visit = {
  id: number;
  visit_date: string;
  visit_time: string;
  status: string;
  booking_fee: number;
  notes: string;
  listings?: {
    listing_type: string;
    price: number;
    properties?: {
      id: number;
      title: string;
      district: string;
      address?: string;
      property_images?: { image_url: string; is_cover?: boolean }[];
    };
  };
};

const statusColor: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-brand-50 text-brand-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-600',
  no_show: 'bg-red-50 text-red-700',
};

export default function Bookings() {
  const { user } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    apiGet<Visit[]>(`/api/visits?student_id=${user.id}`)
      .then(setVisits)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = async (id: number) => {
    await apiSend('/api/visits', 'PUT', { id, status: 'cancelled' });
    load();
  };

  if (loading) return <LoadingSpinner />;
  if (!visits.length) {
    return (
      <EmptyState
        title="No bookings yet"
        description="Book a visit from any property page to see it here."
        action={
          <Link to="/search" className="px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm">
            Find apartments
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {visits.map((v) => {
        const prop = v.listings?.properties;
        const img =
          prop?.property_images?.find((i) => i.is_cover)?.image_url ||
          prop?.property_images?.[0]?.image_url ||
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80';
        return (
          <div key={v.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col sm:flex-row">
            <img src={img} alt="" className="sm:w-40 h-36 sm:h-auto object-cover" />
            <div className="p-4 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link to={prop ? `/properties/${prop.id}` : '#'} className="font-semibold text-slate-900 hover:text-brand-600">
                    {prop?.title || 'Property'}
                  </Link>
                  <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {prop?.district || prop?.address}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${statusColor[v.status] || statusColor.pending}`}>
                  {v.status}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4 text-brand-600" />{v.visit_date}</span>
                <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4 text-brand-600" />{v.visit_time}</span>
                {v.listings && (
                  <span>{listingTypeLabel(v.listings.listing_type)} · {formatPrice(v.listings.price)}/mo</span>
                )}
              </div>
              {['pending', 'confirmed'].includes(v.status) && (
                <button
                  onClick={() => cancel(v.id)}
                  className="mt-3 text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  Cancel visit
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
