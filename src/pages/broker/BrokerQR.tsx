import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, ExternalLink, QrCode, Download, Phone, Check, BarChart3 } from 'lucide-react';
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

  if (loading) return <LoadingSpinner label="جاري تحميل رمز QR الخاص بك..." />;

  const url = `${window.location.origin}/b/${slug}`;
  const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('الرابط: ' + url);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`تفضل بزيارة ملفي العقاري على منصة أجرلي لمشاهدة كافة الشقق المتاحة:\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleDownloadQR = () => {
    const a = document.createElement('a');
    a.href = qrImg;
    a.download = `Agarly-QR-${slug}.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* QR Code Display & Share Box */}
      <div className="bg-white dark:bg-[#111A30] rounded-3xl border border-slate-100 dark:border-[#1E2B4A] p-6 text-center shadow-sm">
        <div className="inline-flex items-center gap-2 text-sm font-bold text-amber-500 mb-4 bg-amber-500/10 px-3.5 py-1.5 rounded-full">
          <QrCode className="w-4 h-4" /> رمز QR ورابط الملف الشخصي
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-inner border border-slate-200 inline-block my-2">
          <img src={qrImg} alt="رمز QR للوسيط" className="w-52 h-52 object-contain" />
        </div>

        <p className="mt-3 text-xs font-mono text-slate-600 dark:text-slate-300 break-all dir-ltr bg-slate-50 dark:bg-[#0A1020] p-2.5 rounded-xl border border-slate-200/60 dark:border-[#1E2B4A]">
          {url}
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2.5">
          <button
            onClick={copy}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FCB431] hover:bg-[#EAA01C] text-[#000616] text-xs font-black transition shadow active:scale-95"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span>مشاركة واتساب</span>
          </button>

          <button
            onClick={handleDownloadQR}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#0A1020] text-slate-800 dark:text-slate-200 text-xs font-bold transition border border-slate-200 dark:border-[#1E2B4A] active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>تنزيل QR</span>
          </button>

          <Link
            to={`/b/${slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-[#0A1020] transition"
          >
            <ExternalLink className="w-4 h-4" /> معاينة البروفايل
          </Link>
        </div>

        <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
          قم بصلح أو طباعة رمز QR هذا على البوسترات والمطبوعات بالقرب من الكليات والجامعات لجذب الطلاب مباشرة لشققك.
        </p>
      </div>

      {/* Analytics Box */}
      <div className="bg-white dark:bg-[#111A30] rounded-3xl border border-slate-100 dark:border-[#1E2B4A] p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-500" /> إحصائيات المسح والزيارات (QR Analytics)
        </h3>
        <div className="space-y-3">
          {codes.map((c) => (
            <div key={c.id} className="rounded-2xl bg-slate-50 dark:bg-[#0A1020] border border-slate-100 dark:border-[#1E2B4A] p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm capitalize">رمز QR: {c.code_type}</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5 dir-ltr">{c.code_value}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-amber-500">{c.scan_count}</p>
                <p className="text-[10px] text-slate-400">مرات المسح</p>
              </div>
            </div>
          ))}
          {!codes.length && (
            <div className="text-center py-10">
              <QrCode className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">لا توجد عمليات مسح مسجلة بعد.</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">بمجرد قيام العملاء بمسح كود QR الخاص بك ستظهر الإحصائيات هنا.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
