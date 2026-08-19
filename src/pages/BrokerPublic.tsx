import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  BadgeCheck, QrCode, Star, Copy, Share2, Download, Phone, Check,
  ExternalLink, Sparkles, Building2, ShieldCheck, X, Home, Briefcase
} from 'lucide-react';
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
  profiles?: { first_name: string; last_name: string; phone?: string; email?: string; avatar?: string; role?: string };
  properties?: PropertyCardData[];
};

export default function BrokerPublic() {
  const { slug } = useParams();
  const [broker, setBroker] = useState<Broker | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

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

  if (loading) return <LoadingSpinner label="جاري تحميل الملف الشخصي..." />;
  if (!broker) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <EmptyState title="لم يتم العثور على الحساب" description="قد يكون الرابط أو كود QR غير صحيح أو تم تحديثه." />
      </div>
    );
  }

  const isOwner = broker.profiles?.role === 'owner' || (broker.bio || '').includes('مالك') || (broker.company_name || '').includes('مالك');
  const name = `${broker.profiles?.first_name || ''} ${broker.profiles?.last_name || ''}`.trim() || broker.company_name || (isOwner ? 'صاحب العقار' : 'سمسار عقاري');
  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/b/${broker.slug}` : `https://agarly.com/b/${broker.slug}`;
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('تم إتاحة الرابط: ' + publicUrl);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`شاهد العقارات والشقق المعروضة لدى ${name} (${isOwner ? 'مالك مباشر' : 'سمسار عقاري'}) عبر منصة أجرلي:\n${publicUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleDownloadQR = () => {
    const a = document.createElement('a');
    a.href = qrImgUrl;
    a.download = `Agarly-QR-${broker.slug}.png`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      {/* Profile Banner Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#2B3143] via-[#1E2B4A] to-[#0A1020] rounded-3xl p-6 md:p-8 text-white shadow-xl border border-slate-700/50">
        {/* Subtle decorative glow background */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#FCB431]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Main Info Side */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#FCB431] text-[#000616] flex items-center justify-center text-3xl font-black shadow-lg shrink-0 border-2 border-white/20">
              {broker.profiles?.avatar ? (
                <img src={broker.profiles.avatar} alt={name} className="w-full h-full object-cover rounded-3xl" />
              ) : (
                (name[0] || 'S').toUpperCase()
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">{name}</h1>
                
                {/* Account Type Badge (Owner vs Broker) */}
                {isOwner ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black shadow-sm">
                    <Home className="w-4 h-4 text-emerald-400" /> مالك عقار مباشر
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-black shadow-sm">
                    <Briefcase className="w-4 h-4 text-blue-400" /> سمسار عقاري معتمد
                  </span>
                )}

                {broker.verified_badge && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#FCB431]/20 border border-[#FCB431]/40 text-[#FCB431] text-xs font-bold shadow-sm">
                    <ShieldCheck className="w-4 h-4" /> موثق من أجرلي
                  </span>
                )}
              </div>

              <p className="text-amber-400 font-semibold text-sm mt-1.5 flex items-center gap-1.5">
                {isOwner ? (
                  <>
                    <Home className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>صاحب العقار (تأجير مباشر بدون وسيط)</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{broker.company_name || 'مكتب وساطة عقارية معتمد'}</span>
                  </>
                )}
              </p>

              <p className="mt-2 text-slate-300 text-sm max-w-xl leading-relaxed">
                {broker.bio || (isOwner ? 'مالك عقارات وشقق مخصص للتأجير المباشر للطلاب والعائلات.' : 'وسيط ومؤجر عقاري معتمد في منصة أجرلي لتأجير الشقق والسكن الطلابي.')}
              </p>

              {/* Stats overview */}
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md flex items-center gap-1.5 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>التقييم: {broker.rating || 5}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md font-bold text-slate-200">
                  {broker.review_count || 0} تقييمات
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md font-bold text-slate-200">
                  {isOwner ? 'مالك مسجل' : `خبرة ${broker.experience_years || 1} سنوات`}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive QR Code & Link Card Box */}
          <div className="bg-white/10 dark:bg-[#111A30]/80 backdrop-blur-xl border border-white/15 rounded-2xl p-4 lg:w-72 shrink-0 flex flex-col items-center text-center shadow-lg">
            <div className="relative group cursor-pointer" onClick={() => setShowQrModal(true)}>
              <div className="bg-white p-2.5 rounded-2xl shadow-md border border-slate-200 hover:scale-105 transition-transform duration-300">
                <img src={qrImgUrl} alt="رمز QR للوسيط" className="w-28 h-28 object-contain rounded-lg" />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold bg-white text-slate-900 px-2 py-1 rounded-md shadow">تكبير QR</span>
              </div>
            </div>

            <p className="text-xs font-bold text-amber-300 mt-2.5 flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5" /> رمز QR الخاص بالملف
            </p>

            {/* Display full clickable link */}
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 font-mono text-[11px] dir-ltr text-slate-300 hover:text-amber-400 transition truncate max-w-full block underline"
            >
              /b/{broker.slug}
            </a>

            {/* Quick Action Buttons */}
            <div className="mt-3 flex items-center justify-center gap-2 w-full">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 py-2 px-2.5 rounded-xl bg-[#FCB431] hover:bg-[#EAA01C] text-[#000616] text-xs font-black transition shadow flex items-center justify-center gap-1 active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow flex items-center justify-center gap-1 active:scale-95"
                title="مشاركة عبر الواتساب"
              >
                <Phone className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleDownloadQR}
                className="py-2 px-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition flex items-center justify-center"
                title="تنزيل رمز QR"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Available Broker Listings */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> العقارات والوحدات المتاحة
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              جميع العقارات والشقق المضافة بواسطة {name}
            </p>
          </div>
          {broker.properties && broker.properties.length > 0 && (
            <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold">
              {broker.properties.length} عقارات مضافة
            </span>
          )}
        </div>

        {!broker.properties?.length ? (
          <EmptyState
            title="لا توجد عقارات نشطة حالياً"
            description="لم يقم هذا الوسيط بنشر عقارات متاحة للحجز حالياً."
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {broker.properties.map((p) => (
              <ApartmentCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </div>

      {/* QR Zoom Modal */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-white dark:bg-[#111A30] rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-slate-100 dark:border-[#1E2B4A]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">رمز QR للملف الشخصي</h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-200 inline-block mb-4">
              <img src={qrImgUrl} alt="QR Code Large" className="w-56 h-56 object-contain" />
            </div>

            <p className="font-bold text-sm text-slate-900 dark:text-white">{name}</p>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1 dir-ltr break-all">{publicUrl}</p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 py-2.5 rounded-xl bg-[#FCB431] hover:bg-[#EAA01C] text-[#000616] font-bold text-xs shadow flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadQR}
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-[#0A1020] text-slate-800 dark:text-slate-200 font-bold text-xs shadow flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" /> تنزيل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
