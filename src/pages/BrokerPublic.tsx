import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BadgeCheck, QrCode, Star } from 'lucide-react';
import { apiGet, apiSend } from '../lib/api';
import ApartmentCard, { type PropertyCardData } from '../components/ApartmentCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

type Broker = {
  id: number;
  company_name: string;
  bio: string;
  rating: number;
  review_count: number;
  verified_badge: boolean;
  slug: string;
  response_time: string;
  experience_years: number;
  profiles?: { first_name: string; last_name: string; phone?: string; email?: string };
  properties?: PropertyCardData[];
};

export default function BrokerPublic() {
  const { slug } = useParams();
  const [broker, setBroker] = useState<Broker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    apiGet<Broker>(`/api/brokers?slug=${slug}`)
      .then(async (b) => {
        setBroker(b);
        try {
          await apiSend('/api/qr', 'PUT', { code_value: slug });
        } catch {
        /* empty */
      }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSpinner />;
  if (!broker) return <EmptyState title="Broker not found" description="This QR or link may be invalid." />;

  const name = `${broker.profiles?.first_name || ''} ${broker.profiles?.last_name || ''}`.trim();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-br from-brand-600 to-blue-500 rounded-3xl p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center text-3xl font-bold">
            {(name[0] || 'B').toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold">{name}</h1>
              {broker.verified_badge && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/15 text-sm">
                  <BadgeCheck className="w-4 h-4" /> Verified
                </span>
              )}
            </div>
            <p className="text-blue-100 mt-1">{broker.company_name}</p>
            <p className="mt-3 text-blue-50 max-w-2xl">{broker.bio}</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 min-w-[140px] text-center">
            <QrCode className="w-8 h-8 mx-auto mb-2" />
            <p className="text-xs text-blue-100">QR profile</p>
            <p className="font-mono text-sm font-semibold">/{broker.slug}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 max-w-md">
          <Stat label="Rating" value={String(broker.rating)} icon={<Star className="w-3.5 h-3.5" />} />
          <Stat label="Reviews" value={String(broker.review_count)} />
          <Stat label="Experience" value={`${broker.experience_years}y`} />
        </div>
      </div>

      <h2 className="mt-10 text-xl font-bold text-slate-900 mb-4">Available listings</h2>
      {!broker.properties?.length ? (
        <EmptyState title="No active listings" description="This broker has no published properties right now." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {broker.properties.map((p) => (
            <ApartmentCard key={p.id} property={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/10 p-3 text-center">
      <p className="font-bold text-lg inline-flex items-center gap-1 justify-center">{icon}{value}</p>
      <p className="text-xs text-blue-100">{label}</p>
    </div>
  );
}
