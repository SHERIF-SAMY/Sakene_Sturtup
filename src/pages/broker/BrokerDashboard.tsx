import { NavLink, Outlet, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, CalendarDays, QrCode, PlusCircle, Settings,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const links = [
  { to: '/broker', end: true, icon: LayoutDashboard, label: 'Overview' },
  { to: '/broker/properties', icon: Building2, label: 'Properties' },
  { to: '/broker/visits', icon: CalendarDays, label: 'Visits' },
  { to: '/broker/qr', icon: QrCode, label: 'QR Codes' },
  { to: '/broker/add', icon: PlusCircle, label: 'Add property' },
  { to: '/broker/settings', icon: Settings, label: 'Settings' },
];

export default function BrokerDashboard() {
  const { profile } = useAuth();
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />;
  if (profile && profile.role !== 'broker' && profile.role !== 'owner') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Broker dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Manage listings, visits, and your public QR page</p>
      </div>
      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        <aside className="hidden lg:block">
          <nav className="bg-white rounded-2xl border border-slate-100 p-2 sticky top-24 space-y-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
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
                    isActive ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200'
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
