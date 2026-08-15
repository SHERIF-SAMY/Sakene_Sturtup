import { NavLink, Outlet, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Bell, QrCode, PlusCircle, UserCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export default function BrokerDashboard() {
  const { profile } = useAuth();
  const { t } = useTranslation();

  if (profile?.role === 'admin') return <Navigate to="/admin" replace />;
  if (profile && profile.role !== 'broker' && profile.role !== 'owner') {
    return <Navigate to="/dashboard" replace />;
  }

  const links = [
    { to: '/broker', end: true, icon: LayoutDashboard, label: t('broker.overview') },
    { to: '/broker/properties', icon: Building2, label: t('broker.my_properties') },
    { to: '/broker/notifications', icon: Bell, label: 'الإشعارات' },
    { to: '/broker/qr', icon: QrCode, label: t('broker.qr_page') },
    { to: '/broker/add', icon: PlusCircle, label: t('broker.add_property') },
    { to: '/broker/settings', icon: UserCircle, label: t('broker.profile') },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{t('broker.dashboard_title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t('broker.manage_desc')}</p>
      </div>
      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        <aside className="hidden lg:block">
          <nav className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-2 sticky top-24 space-y-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`
                }
              >
                <l.icon className="w-4 h-4" /> {l.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 mb-2">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `shrink-0 px-3 py-2 rounded-xl text-sm font-medium border ${
                    isActive ? 'bg-brand-600 text-white border-brand-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
