import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShieldCheck, CalendarCheck, ArrowRight,
  GraduationCap, Star, MapPin, Sparkles, Home, Building2,
  CheckCircle2, MessageSquare, Facebook, Phone, ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiGet, apiSend } from '../lib/api';
import ApartmentCard, { type PropertyCardData } from '../components/ApartmentCard';
import LoadingSpinner from '../components/LoadingSpinner';

type Uni = { id: number; name: string; cities?: { name: string } | null };

// ─── Contact modal ─────────────────────────────────────────────────────────────
function ContactModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !msg.trim()) { setErr('الاسم والرسالة مطلوبان'); return; }
    setSending(true); setErr('');
    try {
      await apiSend('/api/contact', 'POST', { name, phone, message: msg });
      setSent(true);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'فشل الإرسال');
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', damping: 22 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-brand-600 to-blue-500 px-6 py-5 text-white">
            <h3 className="text-xl font-bold">تواصل معنا</h3>
            <p className="text-sm text-white/80 mt-0.5">فريق Agarly موجود دائماً لمساعدتك</p>
          </div>

          <div className="p-6">
            {/* WhatsApp buttons */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-3">تواصل مباشر</p>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://wa.me/201016024660"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 justify-center py-3 px-3 rounded-2xl bg-green-50 border border-green-200 text-green-700 font-semibold text-sm hover:bg-green-100 transition"
                >
                  <Phone className="w-4 h-4" /> واتساب 1
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61593318657572"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 justify-center py-3 px-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition"
                >
                  <Facebook className="w-4 h-4" /> فيسبوك
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-xs text-slate-400 font-medium">أو أرسل رسالة</span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="font-bold text-slate-900 text-lg">تم إرسال رسالتك!</p>
                <p className="text-sm text-slate-500 mt-1">سيتواصل معك فريقنا في أقرب وقت.</p>
                <button
                  onClick={onClose}
                  className="mt-5 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition"
                >
                  حسناً
                </button>
              </motion.div>
            ) : (
              <form onSubmit={send} className="space-y-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اسمك *"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="رقم الهاتف (اختياري)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                />
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="رسالتك *"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
                />
                {err && <p className="text-xs text-red-600">{err}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition disabled:opacity-60"
                >
                  {sending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl md:text-4xl font-black text-white">{value}</p>
      <p className="text-sm text-white/70 mt-1">{label}</p>
    </div>
  );
}

// ─── How it works step ────────────────────────────────────────────────────────
function Step({ num, icon: Icon, title, desc }: { num: string; icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Number(num) * 0.1 }}
      className="relative bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition"
    >
      <span className="text-6xl font-black text-brand-50 absolute -top-2 right-4 select-none">{num}</span>
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-blue-400 text-white flex items-center justify-center mb-4 shadow-sm">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900 relative">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 relative leading-relaxed">{desc}</p>
    </motion.div>
  );
}

// ─── Testimonial ─────────────────────────────────────────────────────────────
function Testimonial({ name, text, stars = 5 }: { name: string; text: string; stars?: number }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: stars }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-slate-100 text-sm leading-relaxed">"{text}"</p>
      <p className="mt-3 text-sm font-semibold text-brand-200">— {name}</p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const [uniId, setUniId] = useState('');
  const [unis, setUnis] = useState<Uni[]>([]);
  const [featured, setFeatured] = useState<PropertyCardData[]>([]);
  const [recent, setRecent] = useState<PropertyCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    Promise.all([
      apiGet<Uni[]>('/api/universities'),
      apiGet<PropertyCardData[]>('/api/properties?featured=true&status=active'),
      apiGet<PropertyCardData[]>('/api/properties?status=active'),
    ])
      .then(([u, f, r]) => {
        setUnis(u);
        setFeatured(f.slice(0, 3));
        const featuredIds = new Set((f || []).map((p) => p.id));
        const nonFeatured = (r || []).filter((p) => !featuredIds.has(p.id));
        setRecent(nonFeatured.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div>
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-600 to-blue-500 text-white min-h-[560px] flex items-center">
        {/* decorative circles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-white/[0.03] blur-2xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 text-sm font-medium mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-amber-300" />
              منصة Agarly — عقارات وسكن للطلاب والعائلات وكل الفئات بكفر الشيخ
            </span>

            <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
              ابحث عن شقتك<br />
              <span className="text-amber-300">بكل سهولة وأمان</span>
            </h1>
            <p className="mt-5 text-lg md:text-xl text-white/80 max-w-xl leading-relaxed">
              منصة متخصصة في تأجير العقارات بكفر الشيخ (طلاب، عائلات، أفراد). تواصل مع ملاك موثوقين وسماسرة معتمدين، واحجز معاينتك بضغطة واحدة.
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.form
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            onSubmit={search}
            className="mt-8 bg-white rounded-2xl p-2 shadow-2xl shadow-brand-900/30 flex flex-col sm:flex-row gap-2 max-w-xl"
          >
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 flex-1">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث بالنص، الحي، أو المنطقة..."
                className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-sm"
              />
            </div>
            <button
              type="submit"
              className="px-7 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center justify-center gap-2 shrink-0 transition"
            >
              بحث <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>

          {/* Quick trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex flex-wrap gap-4 text-sm text-white/75"
          >
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-green-300" /> سماسرة وملاك موثوقون</span>
            <span className="flex items-center gap-1.5"><CalendarCheck className="w-4 h-4 text-amber-300" /> حجز معاينة فوري</span>
            <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-300" /> خيارات تناسب الجميع</span>
          </motion.div>
        </div>
      </section>

      {/* ── USP Cards ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900">{t('landing.usp_title', 'لماذا Agarly؟')}</h2>
          <p className="text-slate-500 mt-2">كل ما تحتاجه في مكان واحد</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: ShieldCheck, title: 'موثوقية تامة', desc: 'كل الوسطاء والملاك خضعوا للتحقق قبل النشر', color: 'from-green-500 to-emerald-400' },
            { icon: CalendarCheck, title: 'حجز سريع', desc: 'احجز معاينتك في ثوانٍ بدون تعقيدات', color: 'from-brand-500 to-blue-400' },
            { icon: Home, title: 'لكل الفئات', desc: 'شقق وسكن مناسب للطلاب والعائلات والأفراد', color: 'from-violet-500 to-purple-400' },
            { icon: MapPin, title: 'تغطية شاملة', desc: 'شقق في جميع أحياء ومناطق كفر الشيخ', color: 'from-amber-500 to-orange-400' },
          ].map((f) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition group"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900">{f.title}</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Universities ─────────────────────────────────────────── */}
      {unis.length > 0 && (
        <section className="bg-slate-50 border-y border-slate-100 py-14">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">{t('landing.popular_unis')}</h2>
                <p className="text-slate-500 mt-1">ابحث عن شقة قريبة من جامعتك</p>
              </div>
              <Link to="/search" className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                عرض الكل <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {unis.slice(0, 6).map((u) => (
                <Link
                  key={u.id}
                  to={`/search?university_id=${u.id}`}
                  className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-brand-200 hover:shadow-sm transition text-center group"
                >
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-brand-500 to-blue-400 text-white flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform shadow-sm">
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                  <p className="font-semibold text-sm text-slate-800 line-clamp-2">{u.name}</p>
                  {u.cities?.name && <p className="text-xs text-slate-400 mt-1">{u.cities.name}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Properties ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 mb-2 inline-block">
              ⭐ خيارات ممتازة خاصة
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">{t('landing.featured_apartments', 'الشقق المميزة')}</h2>
            <p className="text-slate-500 mt-1">عقارات موصى بها من الإدارة وتم التحقق منها</p>
          </div>
          <Link to="/search" className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
            {t('landing.see_more')} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : featured.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
            <Building2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">لا توجد شقق مميزة حالياً</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((p) => (
              <ApartmentCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>

      {/* ── Recent / All Properties Section ──────────────────────── */}
      {recent.length > 0 && (
        <section className="bg-slate-50 border-y border-slate-100 py-14">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-brand-100 text-brand-800 mb-2 inline-block">
                  🏡 احدث العقارات
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900">أحدث الشقق المتاحة للجميع</h2>
                <p className="text-slate-500 mt-1">شقق وإيجارات مضافة مؤخراً في مختلف أحياء ومناطق كفر الشيخ</p>
              </div>
              <Link
                to="/search"
                className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                تصفح كافة الشقق والفلاتر <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recent.map((p) => (
                <ApartmentCard key={p.id} property={p} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold text-sm hover:bg-slate-50 hover:border-brand-300 transition shadow-sm"
              >
                عرض باقي الشقق واستخدام الفلاتر (مفروش / طلبة / عائلات) <ChevronRight className="w-4 h-4 text-brand-600" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ─────────────────────────────────────────── */}
      <section className="bg-slate-50 border-y border-slate-100 py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">{t('landing.how_it_works')}</h2>
            <p className="text-slate-500 mt-2">ثلاث خطوات بسيطة للحصول على شقتك</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <Step num="1" icon={Search} title={t('landing.step_1_title')} desc={t('landing.step_1_desc')} />
            <Step num="2" icon={CalendarCheck} title={t('landing.step_2_title')} desc={t('landing.step_2_desc')} />
            <Step num="3" icon={Home} title={t('landing.step_3_title')} desc={t('landing.step_3_desc')} />
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="md:grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm text-white/80 border border-white/20 mb-4">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> آراء مستخدمينا
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white">عملاؤنا يثقون في Agarly</h2>
              <p className="mt-3 text-white/60 leading-relaxed">
                مستأجرون وعائلات وطاب وجدوا سكنهم المناسب عبر منصتنا بسهولة وأمان.
              </p>
              <Link
                to="/search"
                className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition text-sm"
              >
                ابدأ البحث الآن <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="mt-8 md:mt-0 space-y-4">
              <Testimonial name="نور أحمد" text="حجزت معاينة وانتقلت للشقة في نفس الأسبوع. الموقع سهّل عليّ كل شيء!" />
              <Testimonial name="عمر محمود" text="الوسطاء الموثقون أضافوا ثقة كبيرة. الصور كانت تعبّر عن الواقع تماماً." />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA + Contact ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-brand-600 to-blue-500 p-8 md:p-12">
          <div className="md:grid md:grid-cols-2 gap-8 items-center">
            <div className="text-white">
              <h2 className="text-2xl md:text-3xl font-black">هل لديك شقة للإيجار؟</h2>
              <p className="mt-3 text-white/80 leading-relaxed">
                سجّل عقارك على Agarly واوصل لجميع الباحثين عن سكن في كفر الشيخ.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/login?mode=signup&role=broker"
                  className="px-5 py-3 rounded-xl bg-white text-brand-700 font-bold hover:bg-white/90 transition text-sm flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4" /> سجّل كوسيط
                </Link>
                <button
                  onClick={() => setShowContact(true)}
                  className="px-5 py-3 rounded-xl bg-white/15 border border-white/30 text-white font-bold hover:bg-white/25 transition text-sm flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" /> تواصل معنا
                </button>
              </div>
            </div>
            <div className="mt-8 md:mt-0 grid grid-cols-2 gap-4">
              {[
                { icon: CheckCircle2, text: 'عرض مجاني لشقتك' },
                { icon: CheckCircle2, text: 'حجوزات مضمونة' },
                { icon: CheckCircle2, text: 'دعم فني متواصل' },
                { icon: CheckCircle2, text: 'رسوم شفافة وعادلة' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-white/90 text-sm font-medium">
                  <item.icon className="w-4 h-4 text-white shrink-0" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Social / Facebook ──────────────────────────────────────── */}
      <section className="bg-slate-50 border-t border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm mb-4">تابعنا على منصات التواصل الاجتماعي</p>
          <div className="flex justify-center gap-4">
            <a
              href="https://www.facebook.com/profile.php?id=61593318657572"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition shadow-sm"
            >
              <Facebook className="w-4 h-4" /> صفحتنا على فيسبوك
            </a>
            <a
              href="https://wa.me/201016024660"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition shadow-sm"
            >
              <Phone className="w-4 h-4" /> تواصل عبر واتساب
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
