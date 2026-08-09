import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Home, Search, CalendarDays, Heart, User, Bell, Building2,
  LayoutDashboard, LogOut, Menu, X, Shield,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

function logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-bold text-xl text-brand-700">
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
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const hideMobileNav = location.pathname.startsWith('/login');

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const dashPath =
    profile?.role === 'admin'
      ? '/admin'
      : profile?.role === 'broker'
        ? '/broker'
        : '/dashboard';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {logo()}

          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={navCls}>{t('nav.home')}</NavLink>
            <NavLink to="/search" className={navCls}>{t('nav.search')}</NavLink>
            {user && <NavLink to={dashPath} className={navCls}>{t('nav.dashboard')}</NavLink>}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {i18n.language === 'ar' ? 'EN' : 'عربي'}
            </button>
            {user ? (
              <>
                <Link
                  to={profile?.role === 'student' ? '/dashboard/notifications' : dashPath}
                  className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                  )}
                </Link>
                <Link
                  to={profile?.role === 'student' ? '/dashboard/profile' : dashPath}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-slate-100"
                >
                  <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm">
                    {(profile?.first_name?.[0] || 'U').toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                    {profile?.first_name || 'Account'}
                  </span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500"
                  title="Sign out"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-700">
                  Log in
                </Link>
                <Link
                  to="/login?mode=signup"
                  className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 rounded-xl hover:bg-slate-100" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
            <button
              onClick={() => { toggleLanguage(); setOpen(false); }}
              className="w-full text-start px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium text-brand-600"
            >
              {i18n.language === 'ar' ? 'Switch to English' : 'تغيير للغة العربية'}
            </button>
            <Link to="/" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium">{t('nav.home')}</Link>
            <Link to="/search" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium">{t('nav.search')}</Link>
            {user ? (
              <>
                <Link to={dashPath} onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium">{t('nav.dashboard')}</Link>
                <button onClick={() => { signOut(); setOpen(false); }} className="w-full text-start px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium text-red-600">{t('nav.signout')}</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl bg-brand-600 text-white text-center font-semibold">{t('nav.login')}</Link>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {!hideMobileNav && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 safe-bottom">
          <div className="grid grid-cols-5 h-16">
            <Tab to="/" icon={Home} label={t('nav.home')} end />
            <Tab to="/search" icon={Search} label={t('nav.search')} />
            <Tab to={user ? (profile?.role === 'student' ? '/dashboard/bookings' : dashPath) : '/login'} icon={CalendarDays} label={t('nav.bookings')} />
            <Tab to={user ? (profile?.role === 'student' ? '/dashboard/favorites' : dashPath) : '/login'} icon={Heart} label={t('nav.saved')} />
            <Tab
              to={user ? (profile?.role === 'admin' ? '/admin' : profile?.role === 'broker' ? '/broker' : '/dashboard') : '/login'}
              icon={profile?.role === 'admin' ? Shield : profile?.role === 'broker' ? LayoutDashboard : User}
              label={t('nav.profile')}
            />
          </div>
        </nav>
      )}

      <footer className="hidden md:block border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
          <div>
            {logo()}
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              {t('nav.footer_desc')}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">{t('nav.footer_explore')}</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <Link to="/search" className="block hover:text-brand-600">{t('nav.footer_search')}</Link>
              <Link to="/search?listing_type=private_room" className="block hover:text-brand-600">{t('nav.footer_private')}</Link>
              <Link to="/search?listing_type=shared_bed" className="block hover:text-brand-600">{t('nav.footer_shared')}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">{t('nav.footer_brokers')}</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <Link to="/login?mode=signup&role=broker" className="block hover:text-brand-600">{t('nav.footer_list')}</Link>
              <Link to="/broker" className="block hover:text-brand-600">{t('nav.footer_broker_dash')}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">{t('nav.footer_company')}</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Cairo, Egypt</p>
              <p>hello@agarly.com</p>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Agarly. {t('nav.footer_copyright')}.
        </div>
      </footer>
    </div>
  );
}

function navCls({ isActive }: { isActive: boolean }) {
  return `px-3 py-2 rounded-xl text-sm font-medium transition ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
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
          isActive ? 'text-brand-600' : 'text-slate-400'
        }`
      }
    >
      <Icon className="w-5 h-5" />
      {label}
    </NavLink>
  );
}
