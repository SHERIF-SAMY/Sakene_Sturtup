import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Home, Search, CalendarDays, Heart, User, Bell,
  LayoutDashboard, LogOut, Menu, X, Shield, Sun, Moon, MessageSquare, Facebook, Phone, CheckCircle2,
  Instagram, Twitter, Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { apiSend } from '../lib/api';
import Logo from './Logo';

// Dark mode helpers
function getInitialDark(): boolean {
  try {
    const stored = localStorage.getItem('agarly_dark_mode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

function applyDark(dark: boolean) {
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  try {
    localStorage.setItem('agarly_dark_mode', String(dark));
  } catch {}
}

// Apply dark mode ASAP (before render)
applyDark(getInitialDark());

// ─── Contact Modal ─────────────────────────────────────────────────────────────
function ContactModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [phone_, setPhone_] = useState('');
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState('');

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !msg.trim()) { setErr('الاسم والرسالة مطلوبان'); return; }
    setSending(true); setErr('');
    try {
      await apiSend('/api/contact', 'POST', { name, phone: phone_, message: msg });
      setSent(true);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'فشل الإرسال');
    } finally { setSending(false); }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end md:items-center justify-center p-4"
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
          <div className="bg-[#2B3143] px-6 py-5 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FCB431]/20 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <h3 className="text-xl font-bold font-heading">تواصل مع اجرلي</h3>
                <p className="text-xs text-slate-300 mt-0.5">فريق Agarly جاهز دائماً لمساعدتك في إيجاد سكنك</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-5">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">تواصل فوري ومباشر</p>
              <div className="grid grid-cols-2 gap-3">
                <a href="https://wa.me/201068411434" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 justify-center py-3 px-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold text-sm hover:bg-emerald-100 transition shadow-sm">
                  <Phone className="w-4 h-4" /> واتساب
                </a>
                <a href="https://www.facebook.com/profile.php?id=61593318657572" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 justify-center py-3 px-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 font-bold text-sm hover:bg-blue-100 transition shadow-sm">
                  <Facebook className="w-4 h-4" /> فيسبوك
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-slate-100 dark:bg-[#1E2B4A]" />
              <span className="text-xs text-slate-400 font-medium">أو اترك لنا رسالة</span>
              <div className="h-px flex-1 bg-slate-100 dark:bg-[#1E2B4A]" />
            </div>

            {sent ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <p className="font-bold text-slate-900 dark:text-white text-lg">تم إرسال رسالتك بنجاح!</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">سيتواصل معك فريق الدعم في أقرب وقت.</p>
                <button
                  onClick={onClose}
                  className="mt-5 w-full py-3 rounded-xl bg-[#FCB431] hover:bg-[#EAA01C] text-[#000616] font-bold text-sm transition"
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <form onSubmit={send} className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="الاسم بالكامل *"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-white dark:bg-[#0A1020] text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#FCB431] focus:border-transparent transition"
                />
                <input
                  type="tel"
                  value={phone_}
                  onChange={(e) => setPhone_(e.target.value)}
                  placeholder="رقم الهاتف (اختياري)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-white dark:bg-[#0A1020] text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#FCB431] focus:border-transparent transition"
                />
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="كيف يمكننا مساعدتك؟ *"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-white dark:bg-[#0A1020] text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#FCB431] focus:border-transparent resize-none transition"
                />
                {err && <p className="text-xs font-semibold text-rose-500">{err}</p>}
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

export default function Layout() {
  const { user, profile, signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const hideMobileNav = location.pathname.startsWith('/login');

  const [dark, setDark] = useState<boolean>(getInitialDark);

  useEffect(() => {
    applyDark(dark);
  }, [dark]);

  const toggleDark = () => setDark((d) => !d);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const dashPath =
    profile?.role === 'admin'
      ? '/admin'
      : profile?.role === 'broker' || profile?.role === 'owner'
        ? '/broker'
        : '/dashboard';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#000616] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0A1020]/90 backdrop-blur-md border-b border-slate-100 dark:border-[#1E2B4A] transition-colors">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <Logo size="md" />

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/70 dark:bg-[#111A30] p-1 rounded-2xl border border-slate-200/60 dark:border-[#1E2B4A]">
            <NavLink to="/" end className={navCls}>{t('nav.home')}</NavLink>
            <NavLink to="/search" className={navCls}>{t('nav.search')}</NavLink>
            {user && <NavLink to={dashPath} className={navCls}>{t('nav.dashboard')}</NavLink>}
            <button
              onClick={() => setShowContact(true)}
              className="px-3.5 py-1.5 rounded-xl text-sm font-semibold transition text-slate-700 dark:text-slate-300 hover:text-[#2B3143] dark:hover:text-white flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4 text-[#FCB431]" /> تواصل معنا
            </button>
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#111A30] border border-slate-200/60 dark:border-[#1E2B4A] hover:bg-slate-200 dark:hover:bg-[#1E2B4A] flex items-center justify-center text-slate-700 dark:text-slate-300 transition"
              title={dark ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {dark ? <Sun className="w-4.5 h-4.5 text-[#FCB431]" /> : <Moon className="w-4.5 h-4.5 text-[#2B3143]" />}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={profile?.role === 'broker' || profile?.role === 'owner' ? '/broker/notifications' : '/dashboard/notifications'}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#111A30] border border-slate-200/60 dark:border-[#1E2B4A] hover:bg-slate-200 dark:hover:bg-[#1E2B4A] flex items-center justify-center text-slate-700 dark:text-slate-300 relative transition"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#FCB431] ring-2 ring-white dark:ring-[#0A1020]" />
                  )}
                </Link>

                <Link
                  to={profile?.role === 'broker' || profile?.role === 'owner' ? '/broker/settings' : '/dashboard/profile'}
                  className="flex items-center gap-2.5 ps-1.5 pe-3.5 py-1 rounded-2xl bg-slate-100 dark:bg-[#111A30] border border-slate-200/60 dark:border-[#1E2B4A] hover:bg-slate-200 dark:hover:bg-[#1E2B4A] transition"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#FCB431] text-[#000616] flex items-center justify-center font-black text-sm">
                    {(profile?.first_name?.[0] || 'U').toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[110px] truncate">
                    {profile?.first_name || 'حسابي'}
                  </span>
                </Link>

                <button
                  onClick={() => signOut()}
                  className="w-10 h-10 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 flex items-center justify-center text-slate-400 hover:text-rose-600 transition"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-[#2B3143] dark:text-slate-200 hover:text-[#FCB431] transition"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  to="/login?mode=signup"
                  className="px-5 py-2.5 rounded-xl bg-[#FCB431] text-[#000616] text-xs font-black hover:bg-[#EAA01C] transition shadow-sm hover:shadow flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> حساب جديد
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <button
            className="md:hidden p-2.5 rounded-xl bg-slate-100 dark:bg-[#111A30] text-slate-700 dark:text-slate-300"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile slide drawer */}
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-slate-100 dark:border-[#1E2B4A] bg-white dark:bg-[#0A1020] px-4 py-4 space-y-2 shadow-xl"
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-slate-500">المظهر</span>
              <button
                onClick={() => { toggleDark(); }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#111A30] text-slate-700 dark:text-slate-300 flex items-center gap-2 text-xs font-bold"
              >
                {dark ? <><Sun className="w-4 h-4 text-[#FCB431]" /> الوضع النهاري</> : <><Moon className="w-4 h-4 text-[#2B3143]" /> الوضع الليلي</>}
              </button>
            </div>
            <Link to="/" onClick={() => setOpen(false)} className="block px-3.5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-[#111A30]">الرئيسية</Link>
            <Link to="/search" onClick={() => setOpen(false)} className="block px-3.5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-[#111A30]">بحث عن سكن</Link>
            <button
              onClick={() => { setShowContact(true); setOpen(false); }}
              className="w-full text-start px-3.5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-[#111A30] flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-[#FCB431]" /> تواصل معنا
            </button>
            {user ? (
              <>
                <Link to={dashPath} onClick={() => setOpen(false)} className="block px-3.5 py-2.5 rounded-xl font-bold text-sm bg-slate-50 dark:bg-[#111A30]">لوحة التحكم</Link>
                <button onClick={() => { signOut(); setOpen(false); }} className="w-full text-start px-3.5 py-2.5 rounded-xl font-bold text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30">تسجيل الخروج</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl bg-[#FCB431] text-[#000616] text-center font-black text-sm">تسجيل الدخول / حساب جديد</Link>
            )}
          </motion.div>
        )}
      </header>

      {/* Contact Modal */}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}

      {/* Main Outlet */}
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      {!hideMobileNav && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0A1020]/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-[#1E2B4A] safe-bottom shadow-lg">
          <div className="grid grid-cols-5 h-16">
            <Tab to="/" icon={Home} label={t('nav.home')} end />
            <Tab to="/search" icon={Search} label={t('nav.search')} />
            <Tab to={user ? (profile?.role === 'broker' || profile?.role === 'owner' ? '/broker' : '/dashboard/bookings') : '/login'} icon={CalendarDays} label={t('nav.bookings')} />
            <Tab to={user ? (profile?.role === 'broker' || profile?.role === 'owner' ? '/broker' : '/dashboard/favorites') : '/login'} icon={Heart} label={t('nav.saved')} />
            <Tab
              to={user ? (profile?.role === 'admin' ? '/admin' : profile?.role === 'broker' || profile?.role === 'owner' ? '/broker' : '/dashboard') : '/login'}
              icon={profile?.role === 'admin' ? Shield : profile?.role === 'broker' || profile?.role === 'owner' ? LayoutDashboard : User}
              label={t('nav.profile')}
            />
          </div>
        </nav>
      )}

      {/* Desktop Branded Footer */}
      <footer className="hidden md:block border-t border-slate-200 dark:border-[#1E2B4A] bg-white dark:bg-[#0A1020] mt-auto">
        {/* Brand Slogan Bar */}
        <div className="bg-[#2B3143] text-white py-4 px-4 border-b border-[#3D455C]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Logo variant="white" size="sm" />
              <div className="h-4 w-px bg-white/20 hidden md:block" />
              <p className="text-sm font-bold text-white tracking-wide">
                سكنك <span className="text-[#FCB431]">أسهل</span>. مستقبلك <span className="text-[#FCB431]">أريح</span>.
              </p>
            </div>
            
            {/* Social Channels & Domain */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-3 text-slate-300">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FCB431] transition" title="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FCB431] transition" title="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FCB431] transition" title="Twitter">
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
              <span className="text-xs font-bold text-slate-300 tracking-wider">agarly.com</span>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
          <div>
            <Logo size="md" />
            <p className="mt-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              منصة ذكية تربط بين طلاب الجامعات وأصحاب الشقق والسماسرة، لتجربة إيجار سهلة، سريعة، وآمنة.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">للطلاب</h4>
            <div className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <Link to="/search" className="block hover:text-[#FCB431] transition">{t('nav.footer_search')}</Link>
              <Link to="/search?listing_type=private_room" className="block hover:text-[#FCB431] transition">{t('nav.footer_private')}</Link>
              <Link to="/search?listing_type=shared_bed" className="block hover:text-[#FCB431] transition">{t('nav.footer_shared')}</Link>
              <Link to="/search?amenities=wifi" className="block hover:text-[#FCB431] transition">سكن قريب من الجامعة</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">لأصحاب الشقق والسماسرة</h4>
            <div className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <Link to="/login?mode=signup&role=broker" className="block hover:text-[#FCB431] transition">{t('nav.footer_list')}</Link>
              <Link to="/broker" className="block hover:text-[#FCB431] transition">{t('nav.footer_broker_dash')}</Link>
              <Link to="/login?mode=signup&role=owner" className="block hover:text-[#FCB431] transition">سجل كصاحب عقار</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">{t('nav.footer_company')}</h4>
            <div className="space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <p className="text-slate-500">القاهرة، مصر</p>
              <a href="https://wa.me/201068411434" target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-1.5 hover:text-emerald-500 transition">
                <Phone className="w-3.5 h-3.5" /> 01068411434
              </a>
              <a href="https://www.facebook.com/profile.php?id=61593318657572" target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-1.5 hover:text-blue-500 transition">
                <Facebook className="w-3.5 h-3.5" /> صفحة فيسبوك الرسمية
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-[#1E2B4A] py-4 text-center text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} Agarly (أجرلي). سكنك أسهل. مستقبلك أريح.
        </div>
      </footer>
    </div>
  );
}

function navCls({ isActive }: { isActive: boolean }) {
  return `px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
    isActive
      ? 'bg-white dark:bg-[#0A1020] text-[#000616] dark:text-[#FCB431] shadow-sm'
      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
  }`;
}

function Tab({
  to, icon: Icon, label, end,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition ${
          isActive ? 'text-[#FCB431]' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
        }`
      }
    >
      <Icon className="w-5 h-5" />
      {label}
    </NavLink>
  );
}
