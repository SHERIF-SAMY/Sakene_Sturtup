import { NavLink, Outlet, Navigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, MapPin, BarChart3, CalendarDays, Bell, MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const links = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'نظرة عامة' },
  { to: '/admin/visits', icon: CalendarDays, label: 'الحجوزات 📋' },
  { to: '/admin/users', icon: Users, label: 'المستخدمين' },
  { to: '/admin/properties', icon: Building2, label: 'العقارات' },
  { to: '/admin/cities', icon: MapPin, label: 'المدن والمناطق' },
  { to: '/admin/analytics', icon: BarChart3, label: 'الإحصائيات والأرباح' },
  { to: '/admin/notifications', icon: Bell, label: 'الإشعارات' },
  { to: '/admin/inbox', icon: MessageSquare, label: 'صندوق الرسائل' },
];

export default function AdminDashboard() {
  const { profile } = useAuth();
  if (profile && profile.role !== 'admin' && profile.role !== 'super_admin') {
    return <Navigate to={profile.role === 'broker' || profile.role === 'owner' ? '/broker' : '/dashboard'} replace />;
  }

  const navLinks = links.map((l) =>
    l.to === '/admin/analytics'
      ? { ...l, label: profile?.role === 'super_admin' ? 'الإحصائيات والأرباح' : 'الإحصائيات' }
      : l
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Admin console</h1>
        <p className="text-slate-500 text-sm mt-1">Platform operations for Agarly</p>
      </div>
      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        <aside className="hidden lg:block">
          <nav className="bg-white rounded-2xl border border-slate-100 p-2 sticky top-24 space-y-1">
            {navLinks.map((l) => (
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
            {navLinks.map((l) => (
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
