import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Home, Search, CalendarDays, Heart, User, Bell, Building2,
  LayoutDashboard, LogOut, Menu, X, Shield, Sun, Moon, MessageSquare, Facebook, Phone, CheckCircle2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { apiSend } from '../lib/api';

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
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', damping: 22 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <div className="bg-gradient-to-br from-brand-600 to-blue-500 px-6 py-5 text-white">
            <h3 className="text-xl font-bold">تواصل معنا</h3>
            <p className="text-sm text-white/80 mt-0.5">فريق Agarly موجود دائماً لمساعدتك</p>
          </div>
          <div className="p-6">
            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-3">تواصل مباشر</p>
              <div className="grid grid-cols-2 gap-3">
                <a href="https://wa.me/201016024660" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 justify-center py-3 px-3 rounded-2xl bg-green-50 border border-green-200 text-green-700 font-semibold text-sm hover:bg-green-100 transition">
                  <Phone className="w-4 h-4" /> واتساب
                </a>
                <a href="https://www.facebook.com/profile.php?id=61593318657572" target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2 justify-center py-3 px-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition">
                  <Facebook className="w-4 h-4" /> فيسبوك
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
              <span className="text-xs text-slate-400 font-medium">أو أرسل رسالة</span>
              <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700" />
            </div>
            {sent ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="font-bold text-slate-900 dark:text-white text-lg">تم إرسال رسالتك!</p>
                <p className="text-sm text-slate-500 mt-1">سيتواصل معك فريقنا قريباً.</p>
                <button onClick={onClose} className="mt-5 px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition">حسناً</button>
              </div>
            ) : (
              <form onSubmit={send} className="space-y-3">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك *"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
                <input value={phone_} onChange={(e) => setPhone_(e.target.value)} placeholder="رقم الهاتف (اختياري)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent" />
                <textarea value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="رسالتك *" rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none" />
                {err && <p className="text-xs text-red-600">{err}</p>}
                <button type="submit" disabled={sending}
                  className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition disabled:opacity-60">
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

function logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-bold text-xl text-brand-700 dark:text-brand-400">
      <span className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
        <Building2 className="w-5 h-5" />
      </span>
      <span>Agarly</span>
    </Link>
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {logo()}

          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={navCls}>{t('nav.home')}</NavLink>
            <NavLink to="/search" className={navCls}>{t('nav.search')}</NavLink>
            {user && <NavLink to={dashPath} className={navCls}>{t('nav.dashboard')}</NavLink>}
            <button
              onClick={() => setShowContact(true)}
              className="px-3 py-2 rounded-xl text-sm font-medium transition text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" /> تواصل معنا
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-xl font-medium text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {i18n.language === 'ar' ? 'EN' : 'عربي'}
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              className="w-9 h-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 transition-colors"
              title={dark ? t('nav.light_mode') : t('nav.dark_mode')}
            >
              {dark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {user ? (
              <>
                <Link
                  to={profile?.role === 'broker' || profile?.role === 'owner' ? '/broker/notifications' : '/dashboard/notifications'}
                  className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </Link>
                <Link
                  to={profile?.role === 'broker' || profile?.role === 'owner' ? '/broker/settings' : '/dashboard/profile'}
                  className="flex items-center gap-2 ps-1 pe-3 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400 flex items-center justify-center font-semibold text-sm">
                    {(profile?.first_name?.[0] || 'U').toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[120px] truncate">
                    {profile?.first_name || t('nav.profile')}
                  </span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400"
                  title={t('nav.signout')}
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-700 dark:hover:text-brand-400">
                  {t('nav.login')}
                </Link>
                <Link
                  to="/login?mode=signup"
                  className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700"
                >
                  {t('nav.signup')}
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
            <div className="flex gap-2 mb-2">
              {/* Language */}
              <button
                onClick={() => { toggleLanguage(); setOpen(false); }}
                className="flex-1 text-center px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-brand-600 dark:text-brand-400 text-sm"
              >
                {i18n.language === 'ar' ? 'Switch to English' : 'تغيير للغة العربية'}
              </button>
              {/* Dark mode */}
              <button
                onClick={() => { toggleDark(); }}
                className="px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              >
                {dark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
              </button>
            </div>
            <Link to="/" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-medium dark:text-slate-200">{t('nav.home')}</Link>
            <Link to="/search" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-medium dark:text-slate-200">{t('nav.search')}</Link>
            <button
              onClick={() => { setShowContact(true); setOpen(false); }}
              className="w-full text-start px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-medium dark:text-slate-200 flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-brand-600" /> تواصل معنا
            </button>
            {user ? (
              <>
                <Link to={dashPath} onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-medium dark:text-slate-200">{t('nav.dashboard')}</Link>
                <button onClick={() => { signOut(); setOpen(false); }} className="w-full text-start px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-red-600 dark:text-red-400">{t('nav.signout')}</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl bg-brand-600 text-white text-center font-semibold">{t('nav.login')}</Link>
            )}
          </div>
        )}
      </header>

      {/* Contact Modal */}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}

      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {!hideMobileNav && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 safe-bottom">
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

      <footer className="hidden md:block border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
          <div>
            {logo()}
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('nav.footer_desc')}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">{t('nav.footer_explore')}</h4>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <Link to="/search" className="block hover:text-brand-600 dark:hover:text-brand-400">{t('nav.footer_search')}</Link>
              <Link to="/search?listing_type=private_room" className="block hover:text-brand-600 dark:hover:text-brand-400">{t('nav.footer_private')}</Link>
              <Link to="/search?listing_type=shared_bed" className="block hover:text-brand-600 dark:hover:text-brand-400">{t('nav.footer_shared')}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">{t('nav.footer_brokers')}</h4>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <Link to="/login?mode=signup&role=broker" className="block hover:text-brand-600 dark:hover:text-brand-400">{t('nav.footer_list')}</Link>
              <Link to="/broker" className="block hover:text-brand-600 dark:hover:text-brand-400">{t('nav.footer_broker_dash')}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3">{t('nav.footer_company')}</h4>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p>كفر الشيخ، مصر</p>
              <a href="https://wa.me/201016024660" target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-1.5 hover:text-green-600 transition">
                <Phone className="w-3.5 h-3.5" /> 01016024660
              </a>
              <a href="https://www.facebook.com/profile.php?id=61593318657572" target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-1.5 hover:text-blue-600 transition">
                <Facebook className="w-3.5 h-3.5" /> صفحتنا على فيسبوك
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 dark:border-slate-800 py-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Agarly. {t('nav.footer_copyright')}.
        </div>
      </footer>
    </div>
  );
}

function navCls({ isActive }: { isActive: boolean }) {
  return `px-3 py-2 rounded-xl text-sm font-medium transition ${
    isActive ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
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
        `flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${
          isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
        }`
      }
    >
      <Icon className="w-5 h-5" />
      {label}
    </NavLink>
  );
}
