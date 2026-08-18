import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, ShieldCheck, CalendarCheck, ArrowRight,
  GraduationCap, Star, MapPin, Sparkles, Home, Building2,
  CheckCircle2, MessageSquare, Facebook, Phone, ChevronRight,
  Clock, Users, Zap, Check, X, ShieldAlert, BedDouble, HelpCircle,
  TrendingUp, Award, ArrowUpRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiGet, apiSend } from '../lib/api';
import ApartmentCard, { type PropertyCardData } from '../components/ApartmentCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Logo, { AgarlyIcon } from '../components/Logo';

type Uni = { id: number; name: string; cities?: { name: string } | null };

// ─── Contact Modal ─────────────────────────────────────────────────────────────
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
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end md:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', damping: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#111A30] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-[#1E2B4A]"
        >
          <div className="bg-[#2B3143] px-6 py-5 text-white flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black font-heading">تواصل مع منصة أجرلي</h3>
              <p className="text-xs text-slate-300 mt-0.5">جاهزون للرد على استفسارات الطلاب وأصحاب العقارات</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">قنوات التواصل الفوري</p>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://wa.me/201068411434"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 justify-center py-3 px-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold text-sm hover:bg-emerald-100 transition shadow-sm"
                >
                  <Phone className="w-4 h-4" /> واتساب مباشر
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61593318657572"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 justify-center py-3 px-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-bold text-sm hover:bg-blue-100 transition shadow-sm"
                >
                  <Facebook className="w-4 h-4" /> فيسبوك
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-slate-100 dark:bg-[#1E2B4A]" />
              <span className="text-xs text-slate-400 font-medium">أو أرسل استفسارك مباشرة</span>
              <div className="h-px flex-1 bg-slate-100 dark:bg-[#1E2B4A]" />
            </div>

            {sent ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <p className="font-bold text-slate-900 dark:text-white text-lg">تم إرسال رسالتك بنجاح!</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">سيتواصل معك فريق الدعم بأسرع وقت.</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-[#FCB431] hover:bg-[#EAA01C] text-[#000616] font-bold text-sm transition"
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <form onSubmit={send} className="space-y-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اسمك الكريم *"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-white dark:bg-[#0A1020] text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FCB431] transition"
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="رقم الموبايل / واتساب"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-white dark:bg-[#0A1020] text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FCB431] transition"
                />
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="اكتب استفسارك أو تفاصيل السكن المطلوب *"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-white dark:bg-[#0A1020] text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FCB431] resize-none transition"
                />
                {err && <p className="text-xs font-bold text-rose-500">{err}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 rounded-xl bg-[#FCB431] hover:bg-[#EAA01C] text-[#000616] font-bold text-sm transition shadow-md disabled:opacity-60"
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

// ─── Main Landing Component ───────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [unis, setUnis] = useState<Uni[]>([]);
  const [featured, setFeatured] = useState<PropertyCardData[]>([]);
  const [recent, setRecent] = useState<PropertyCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
        setRecent(nonFeatured.slice(0, 6));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (selectedType !== 'all') params.set('listing_type', selectedType);
    navigate(`/search?${params.toString()}`);
  };

  const faqs = [
    {
      q: 'كيف تضمن منصة أجرلي صحة بيانات السكن؟',
      a: 'يقوم فريق أجرلي بالتحقق من هوية الملاك والوسطاء وتدقيق صور الشقق ومواقعها الجغرافية لضمان تطابق الواقع مع المعروض.'
    },
    {
      q: 'هل حجز موعد المعاينة مجاني؟',
      a: 'نعم! حجز مواعيد المعاينة والتواصل المباشر مع أصحاب الشقق والوسطاء عبر منصة أجرلي مجاني تماماً للطلاب.'
    },
    {
      q: 'هل توجد غرف مشتركة وسكن فردي للطلاب والطالبات؟',
      a: 'بالتأكيد، يمكنك استخدام فلتر نوع السكن لاختيار (سكن طالبات، سكن شباب، غرفة خاصة، أو سرير مشترك) حسب ميزانيتك.'
    },
    {
      q: 'أنا صاحب عقار أو وسيط، كيف أضيف شقتي؟',
      a: 'يمكنك إنشاء حساب وسيط / صاحب عقار مجاناً والبدء في نشر شققك خلال أقل من دقيقتين لتصل إلى آلاف الطلاب المستعدين للحجز.'
    }
  ];

  return (
    <div className="overflow-hidden">
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}

      {/* ── 1. HERO SECTION (Midnight #000616 & Amber #FCB431) ─────────── */}
      <section className="relative overflow-hidden bg-[#000616] text-white min-h-[640px] flex items-center pt-8 pb-16 border-b border-[#1E2B4A]">
        {/* Background glow & modern geometric accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 right-1/4 w-[500px] h-[500px] rounded-full bg-[#FCB431]/10 blur-[130px]" />
          <div className="absolute bottom-0 -left-20 w-[450px] h-[450px] rounded-full bg-[#2B3143]/40 blur-[120px]" />
          <div className="absolute top-1/3 left-10 w-2 h-2 rounded-full bg-[#FCB431] animate-ping" />
          <div className="absolute bottom-1/4 right-12 w-3 h-3 rounded-full bg-[#FCB431]/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 w-full">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left/Right Text & Search (RTL adjusted) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-start"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111A30] border border-[#1E2B4A] text-xs font-bold text-[#FCB431] shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>المنصة الطلابية الأولى لتأجير الشقق والغرف</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.15] tracking-tight">
                ابحث. احجز. استقر.<br />
                <span className="text-[#FCB431]">مع اجرلى، السكن بقى أسهل!</span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-medium">
                منصة ذكية تربط بين طلاب الجامعات وأصحاب الشقق والسماسرة، لتجربة إيجار سهلة، سريعة، وآمنة بدون وسيط عشوائي أو صور مضللة.
              </p>

              {/* Unified Search Experience */}
              <div className="pt-2">
                <form
                  onSubmit={handleSearch}
                  className="bg-[#111A30]/90 backdrop-blur-xl border border-[#1E2B4A] rounded-3xl p-3 shadow-2xl shadow-black/80 max-w-2xl text-slate-900 dark:text-white"
                >
                  {/* Property type pills */}
                  <div className="flex items-center gap-2 mb-3 px-1 overflow-x-auto pb-1 scrollbar-none">
                    {[
                      { id: 'all', label: 'كل العقارات' },
                      { id: 'entire_apartment', label: 'شقة كاملة' },
                      { id: 'private_room', label: 'غرفة خاصة' },
                      { id: 'shared_bed', label: 'سرير مشترك' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedType(t.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                          selectedType === t.id
                            ? 'bg-[#FCB431] text-[#000616] shadow-sm'
                            : 'bg-[#1E2B4A]/60 text-slate-300 hover:bg-[#1E2B4A]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex items-center gap-2.5 px-4 py-3.5 rounded-2xl bg-[#000616]/70 border border-[#1E2B4A] flex-1">
                      <Search className="w-5 h-5 text-[#FCB431] shrink-0" />
                      <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="ابحث عن منطقة، جامعة، أو اسم سكن..."
                        className="w-full bg-transparent outline-none text-sm text-white placeholder:text-slate-400 font-medium"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-8 py-3.5 rounded-2xl bg-[#FCB431] hover:bg-[#EAA01C] text-[#000616] font-black text-sm transition flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-[#FCB431]/20 active:scale-95"
                    >
                      <Search className="w-4 h-4" />
                      <span>بحث الآن</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Fast Trust Stats Pills from Brand Identity */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs font-bold text-slate-300">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#111A30] border border-[#1E2B4A]">
                  <Star className="w-4 h-4 text-[#FCB431] fill-current" />
                  <span>أفضل العروض والأسعار</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#111A30] border border-[#1E2B4A]">
                  <Zap className="w-4 h-4 text-[#FCB431]" />
                  <span>سريع وسهل بالكامل</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#111A30] border border-[#1E2B4A]">
                  <ShieldCheck className="w-4 h-4 text-[#FCB431]" />
                  <span>تسريع وموثوق 100%</span>
                </div>
              </div>
            </motion.div>

            {/* Right Hero Graphic Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative mx-auto max-w-md">
                {/* Visual Frame */}
                <div className="relative rounded-3xl overflow-hidden border-2 border-[#1E2B4A] shadow-2xl bg-[#111A30] group">
                  <img
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&q=80"
                    alt="Agarly Student Apartment"
                    className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000616] via-transparent to-transparent" />
                  
                  {/* Floating badge inside hero graphic */}
                  <div className="absolute bottom-4 inset-x-4 p-4 rounded-2xl bg-[#000616]/90 backdrop-blur-md border border-[#1E2B4A] flex items-center justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded-md bg-[#FCB431] text-[#000616] text-[10px] font-black">
                        موثق من أجرلي
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">شقة طلابية مفروشة فاخرة</h4>
                      <p className="text-xs text-slate-400">على بُعد 5 دقائق من الجامعة</p>
                    </div>
                    <div className="text-end">
                      <span className="text-xs text-slate-400 block">تبدأ من</span>
                      <span className="text-base font-black text-[#FCB431]">3,500 ج.م</span>
                    </div>
                  </div>
                </div>

                {/* Floating Micro Badge */}
                <div className="absolute -top-4 -right-4 bg-[#FCB431] text-[#000616] p-3 rounded-2xl shadow-xl font-black text-xs flex items-center gap-2 animate-bounce">
                  <GraduationCap className="w-4 h-4" />
                  <span>خصم خاص للطلاب!</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 2. "لمن منصة اجرلي؟" (3 PILLARS SECTION) ─────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-black uppercase tracking-wider text-[#FCB431] bg-[#FFF8EB] dark:bg-[#111A30] px-3.5 py-1 rounded-full border border-amber-200 dark:border-[#1E2B4A] inline-block mb-3">
            تجربة مصممة للجميع
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            لمن منصة اجرلي؟
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 font-medium">
            حلقة وصل ذكية ومباشرة تخدم كافة أطراف تجربة الإيجار والبحث عن سكن
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Pillar 1: الطلاب */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white dark:bg-[#111A30] rounded-3xl p-8 border border-slate-200/80 dark:border-[#1E2B4A] shadow-sm hover:shadow-xl transition-all text-center relative group"
          >
            <div className="w-20 h-20 rounded-full bg-[#FCB431]/15 text-[#FCB431] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">الطلاب</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
              ابحث عن سكن مناسب وقريب من جامعتك، قارن الأسعار، وتعرف على زملاء السكن واحجز بأمان.
            </p>
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FCB431] hover:bg-[#EAA01C] text-[#000616] font-bold text-xs transition"
            >
              <span>ابحث عن سكنك</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Pillar 2: أصحاب الشقق */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white dark:bg-[#111A30] rounded-3xl p-8 border-2 border-[#2B3143] dark:border-[#FCB431] shadow-md hover:shadow-2xl transition-all text-center relative group"
          >
            <div className="absolute top-4 right-4 bg-[#2B3143] text-white px-3 py-1 rounded-full text-[10px] font-bold">
              وصول مباشر
            </div>
            <div className="w-20 h-20 rounded-full bg-[#2B3143] text-white flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Home className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">أصحاب الشقق</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
              اعرض شقتك للوصول لطلاب موثوقين ومستعدين للإيجار، وأدر طلبات المعاينة دون إزعاج متكرر.
            </p>
            <Link
              to="/login?mode=signup&role=owner"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2B3143] hover:bg-[#1E2230] text-white font-bold text-xs transition"
            >
              <span>أضف شقتك مجاناً</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Pillar 3: السماسرة والوسطاء */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white dark:bg-[#111A30] rounded-3xl p-8 border border-slate-200/80 dark:border-[#1E2B4A] shadow-sm hover:shadow-xl transition-all text-center relative group"
          >
            <div className="w-20 h-20 rounded-full bg-[#FCB431]/15 text-[#FCB431] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">السماسرة المعتمدين</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6 font-medium">
              سوّق لعقاراتك باحترافية، وزد من عدد عملائك، وحوّل المشاهدات إلى حجوزات ومعاينات فورية.
            </p>
            <Link
              to="/login?mode=signup&role=broker"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FCB431] hover:bg-[#EAA01C] text-[#000616] font-bold text-xs transition"
            >
              <span>انضم كوسيط معتمد</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── 3. "مميزات منصة اجرلي" (CORE FEATURES) ───────────────────── */}
      <section className="bg-[#2B3143] text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#FCB431] uppercase tracking-wider bg-white/10 px-3.5 py-1 rounded-full inline-block mb-3">
              لماذا نحن مختلفون؟
            </span>
            <h2 className="text-3xl sm:text-4xl font-black">مميزات منصة اجرلي</h2>
            <p className="text-slate-300 mt-2 text-sm sm:text-base font-medium">
              صممنا كل ميزة في المنصة لحل مشاكل حقيقية تواجه الطلاب وأصحاب العقارات
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Search,
                title: 'بحث ذكي ومتقدم',
                desc: 'ابحث بسهولة حسب الموقع، الجامعة، السعر، سكن مفروش، عدد الغرف ونوع الإشغال.',
              },
              {
                icon: MessageSquare,
                title: 'تواصل مباشر وسريع',
                desc: 'تواصل مباشرة عبر واتساب ومحادثات المنصة دون وسطاء مجهولين أو تعقيدات.',
              },
              {
                icon: ShieldCheck,
                title: 'حجز آمن وموثوق',
                desc: 'حجز المعاينات وتأكيد الشقق يتم عبر نظام موثوق ومحمي يحفظ حقوق كافة الأطراف.',
              },
              {
                icon: Award,
                title: 'تجربة مخصصة للطلاب',
                desc: 'توصيات ذكية تناسب ميزانية الطلاب وجداول كلياتهم ومسافات المواصلات.',
              },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#1E2230]/90 border border-[#3D455C] rounded-3xl p-6 hover:border-[#FCB431] transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#FCB431] text-[#000616] flex items-center justify-center mb-5 font-black group-hover:scale-110 transition-transform shadow-md">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. "عن اجرلي" (ABOUT STORY & VISION CARD) ────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <div className="bg-[#FCB431] rounded-3xl p-8 sm:p-12 text-[#000616] relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <span className="px-3.5 py-1 rounded-full bg-[#000616] text-[#FCB431] text-xs font-black inline-block">
                عن منصة اجرلي
              </span>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight">
                سكنك أسهل. مستقبلك أريح.
              </h2>
              <p className="text-base sm:text-lg text-slate-900 font-bold leading-relaxed">
                اجرلي هي منصة مبتكرة تهدف إلى تسهيل عملية البحث عن السكن المناسب للطلاب المغتربين، وتوفير تجربة موثوقة وشفافة بين جميع الأطراف.
              </p>

              {/* 3 Core Guarantee Pills */}
              <div className="grid sm:grid-cols-3 gap-3 pt-3">
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-white/40">
                  <ShieldCheck className="w-6 h-6 text-[#2B3143] mb-1.5" />
                  <h4 className="font-black text-sm text-[#000616]">موثوق وآمن</h4>
                  <p className="text-xs text-slate-700 font-medium mt-0.5">تجربة إيجار آمنة ومعتمدة للجميع</p>
                </div>
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-white/40">
                  <Clock className="w-6 h-6 text-[#2B3143] mb-1.5" />
                  <h4 className="font-black text-sm text-[#000616]">سريع وسهل</h4>
                  <p className="text-xs text-slate-700 font-medium mt-0.5">ابحث واحجز في دقائق بدون تعقيد</p>
                </div>
                <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-white/40">
                  <Users className="w-6 h-6 text-[#2B3143] mb-1.5" />
                  <h4 className="font-black text-sm text-[#000616]">لجميع الأطراف</h4>
                  <p className="text-xs text-slate-700 font-medium mt-0.5">للطلاب، أصحاب الشقق، والسماسرة</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-[#000616] p-8 rounded-3xl text-white text-center shadow-2xl border border-[#2B3143] w-full max-w-sm">
                <AgarlyIcon size={64} colorScheme="white" className="mx-auto mb-4" />
                <h3 className="text-2xl font-black text-white">Agarly أجرلي</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  نحن نبني مستقبل السكن الطلابي في مصر بأحدث الحلول التقنية.
                </p>
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-around">
                  <div>
                    <span className="text-xl font-black text-[#FCB431] block">+500</span>
                    <span className="text-[10px] text-slate-400">طالب استقروا</span>
                  </div>
                  <div className="h-8 w-px bg-slate-800" />
                  <div>
                    <span className="text-xl font-black text-[#FCB431] block">+120</span>
                    <span className="text-[10px] text-slate-400">عقار موثق</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. THE OLD WAY VS THE AGARLY WAY (GEN-Z CONTRAST) ────────── */}
      <section className="bg-slate-50 dark:bg-[#0A1020] border-y border-slate-200 dark:border-[#1E2B4A] py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-900 inline-block mb-3">
              وداعاً لبهدلة البحث التقليدي
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
              الطريقة القديمة vs تجربة أجرلي
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* The Old Way */}
            <div className="bg-white dark:bg-[#111A30] rounded-3xl p-6 sm:p-8 border border-rose-200 dark:border-rose-900/50 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-rose-100 dark:border-rose-950">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center font-bold">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">الطريقة القديمة المرهقة</h3>
                  <p className="text-xs text-rose-500 font-semibold">جروبات فيسبوك ووسطاء عشوائيين</p>
                </div>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>التوهان في آلاف البوستات غير الموثوقة على السوشيال ميديا</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>صور قديمة أو غير حقيقية تختلف تماماً عن الواقع عند المعاينة</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>عمولات ورسوم سمسرة مفاجئة ومبالغ فيها</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>عدم معرفة المسافة الحقيقية للجامعة أو كفاءة المواصلات</span>
                </li>
              </ul>
            </div>

            {/* The Agarly Way */}
            <div className="bg-white dark:bg-[#111A30] rounded-3xl p-6 sm:p-8 border-2 border-[#FCB431] shadow-lg space-y-4 relative">
              <div className="absolute top-4 left-4 bg-[#FCB431] text-[#000616] px-3 py-0.5 rounded-full text-[10px] font-black">
                الأسهل والأضمن
              </div>
              <div className="flex items-center gap-3 pb-3 border-b border-amber-100 dark:border-[#1E2B4A]">
                <div className="w-10 h-10 rounded-xl bg-[#FCB431] text-[#000616] flex items-center justify-center font-bold">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">مع منصة أجرلي (Agarly)</h3>
                  <p className="text-xs text-[#FCB431] font-bold">كل شيء واضح، موثق، وبضغطة واحدة</p>
                </div>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-bold">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>بحث ذكي محدد حسب جامعتك وميزانيتك بدقة عالية</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>صور وتفاصيل دقيقة موثقة تم فحصها من إدارة أجرلي</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>أسعار شفافة بدون أي رسوم خفية أو مفاجآت</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>حجز مواعيد المعاينة مباشرة أونلاين وتأكيد فوري</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FEATURED APARTMENTS CAROUSEL/GRID ──────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 mb-2 inline-flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" /> سكن مميز وموصى به
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">عقارات وشقق مختارة</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">أعلى التقييمات وقريبة من المجمعات الجامعية</p>
          </div>
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 text-xs font-black text-[#2B3143] dark:text-[#FCB431] hover:underline"
          >
            <span>استعراض كافة الخيارات</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : featured.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white dark:bg-[#111A30] rounded-3xl border border-slate-200 dark:border-[#1E2B4A]">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-bold">لا توجد شقق مميزة حالياً</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <ApartmentCard key={p.id} property={p} />
            ))}
          </div>
        )}
      </section>

      {/* ── 7. POPULAR UNIVERSITIES & HUBS ────────────────────────────── */}
      {unis.length > 0 && (
        <section className="bg-slate-50 dark:bg-[#0A1020] border-y border-slate-200 dark:border-[#1E2B4A] py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  أشهر الجامعات والمناطق الطلابية
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  اختر جامعتك واكتشف كل الشقق القريبة منها مباشرة
                </p>
              </div>
              <Link to="/search" className="text-xs font-bold text-[#FCB431] hover:underline">
                عرض الكل
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {unis.slice(0, 6).map((u) => (
                <Link
                  key={u.id}
                  to={`/search?university_id=${u.id}`}
                  className="bg-white dark:bg-[#111A30] border border-slate-200 dark:border-[#1E2B4A] rounded-2xl p-4 hover:border-[#FCB431] hover:shadow-md transition text-center group"
                >
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FCB431]/15 text-[#FCB431] flex items-center justify-center font-black mb-3 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">{u.name}</p>
                  {u.cities?.name && <p className="text-[11px] text-slate-400 mt-0.5">{u.cities.name}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 8. LATEST APARTMENTS ──────────────────────────────────────── */}
      {recent.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-[#111A30] text-slate-700 dark:text-slate-300 mb-2 inline-block">
                جديد الإعلانات
              </span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">أحدث الشقق والغرف المتاحة</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">تمت إضافتها مؤخراً ومتاحة للمعاينة الفورية</p>
            </div>
            <Link
              to="/search"
              className="px-5 py-2.5 rounded-xl bg-[#2B3143] dark:bg-[#FCB431] text-white dark:text-[#000616] font-bold text-xs hover:opacity-95 transition flex items-center gap-1.5 shadow-sm"
            >
              <span>تصفح كافة الشقق</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map((p) => (
              <ApartmentCard key={p.id} property={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── 9. OWNER & BROKER GROWTH CTA ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="rounded-3xl bg-[#2B3143] text-white p-8 sm:p-14 relative overflow-hidden shadow-2xl border border-[#3D455C]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#FCB431]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-8 space-y-4">
              <span className="px-3.5 py-1 rounded-full bg-white/10 text-[#FCB431] text-xs font-bold inline-block">
                لأصحاب العقارات والوسطاء
              </span>
              <h2 className="text-3xl sm:text-4xl font-black leading-tight">
                عندك شقة أو سكن طلابي؟<br />
                اعرضه الآن أمام آلاف الطلاب المستعدين للحجز.
              </h2>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed font-medium">
                انضم لمنصة أجرلي لتصل لجمهور الطلاب مباشرة، واستقبل طلبات المعاينة المؤكدة عبر نظام منظم وبدون إهدار وقتك.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to="/login?mode=signup&role=broker"
                  className="px-6 py-3 rounded-xl bg-[#FCB431] hover:bg-[#EAA01C] text-[#000616] font-black text-xs transition shadow-md flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>انضم كمسوق / وسيط</span>
                </Link>
                <Link
                  to="/login?mode=signup&role=owner"
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  <span>سجل كصاحب عقار</span>
                </Link>
                <button
                  onClick={() => setShowContact(true)}
                  className="px-6 py-3 rounded-xl bg-transparent hover:bg-white/5 text-slate-300 font-bold text-xs transition flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>تواصل معنا للاستفسار</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 grid grid-cols-2 gap-3 text-xs font-bold text-slate-200">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-[#FCB431] mb-2" />
                <span>إدراج سريع وسهل</span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <TrendingUp className="w-5 h-5 text-[#FCB431] mb-2" />
                <span>زيادة الحجوزات</span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <ShieldCheck className="w-5 h-5 text-[#FCB431] mb-2" />
                <span>طلاب موثوقون</span>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <Zap className="w-5 h-5 text-[#FCB431] mb-2" />
                <span>إشعارات فورية</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. FAQ SECTION ───────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            الأسئلة الشائعة حول أجرلي
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            كل ما تريد معرفته عن كيفية استخدام المنصة وتأجير السكن
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#111A30] border border-slate-200 dark:border-[#1E2B4A] rounded-2xl overflow-hidden transition"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-6 py-4 text-start font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                <ChevronRight
                  className={`w-4 h-4 text-[#FCB431] transition-transform ${
                    openFaq === i ? 'rotate-90' : ''
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed border-t border-slate-100 dark:border-[#1E2B4A]/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
