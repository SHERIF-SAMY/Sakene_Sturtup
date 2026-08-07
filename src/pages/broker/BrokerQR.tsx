import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, ExternalLink, QrCode } from 'lucide-react';
import { apiGet } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

type QR = {
  id: number;
  code_type: string;
  code_value: string;
  scan_count: number;
};

export default function BrokerQR() {
  const { user } = useAuth();
  const [slug, setSlug] = useState('');
  const [codes, setCodes] = useState<QR[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const b = await apiGet<{ id: number; slug: string }>(`/api/brokers?user_id=${user.id}`);
        setSlug(b.slug);
        const q = await apiGet<QR[]>(`/api/qr?broker_id=${b.id}`);
        setCodes(q);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <LoadingSpinner />;

  const url = `${window.location.origin}/b/${slug}`;
  const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-3xl border border-slate-100 p-6 text-center">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 mb-4">
          <QrCode className="w-4 h-4" /> Your broker QR
        </div>
        <img src={qrImg} alt="Broker QR" className="mx-auto rounded-2xl border border-slate-100" />
        <p className="mt-4 text-sm text-slate-600 break-all">{url}</p>
        <div className="mt-4 flex justify-center gap-2">
          <button onClick={copy} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold">
            <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy link'}
          </button>
          <Link to={`/b/${slug}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold">
            <ExternalLink className="w-4 h-4" /> Open
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-400">Print this QR on flyers near universities to drive traffic to your listings.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-6">
        <h3 className="font-bold text-slate-900 mb-4">QR analytics</h3>
        <div className="space-y-3">
          {codes.map((c) => (
            <div key={c.id} className="rounded-2xl bg-slate-50 p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800 capitalize">{c.code_type} QR</p>
                <p className="text-xs text-slate-500 font-mono">{c.code_value}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-brand-700">{c.scan_count}</p>
                <p className="text-xs text-slate-400">scans</p>
              </div>
            </div>
          ))}
          {!codes.length && <p className="text-sm text-slate-500">No QR records yet.</p>}
        </div>
      </div>
    </div>
  );
}
