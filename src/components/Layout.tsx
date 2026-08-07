import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Home, Search, CalendarDays, Heart, User, Bell, Building2,
  LayoutDashboard, LogOut, Menu, X, Shield,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

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
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const hideMobileNav = location.pathname.startsWith('/login');

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
            <NavLink to="/" end className={navCls}>Home</NavLink>
            <NavLink to="/search" className={navCls}>Search</NavLink>
            {user && <NavLink to={dashPath} className={navCls}>Dashboard</NavLink>}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to={profile?.role === 'student' ? '/dashboard/notifications' : dashPath}
                  className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600"
                >
                  <Bell className="w-5 h-5" />
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
            <Link to="/" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium">Home</Link>
            <Link to="/search" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium">Search</Link>
            {user ? (
              <>
                <Link to={dashPath} onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium">Dashboard</Link>
                <button onClick={() => { signOut(); setOpen(false); }} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 font-medium text-red-600">Sign out</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-xl bg-brand-600 text-white text-center font-semibold">Log in</Link>
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
            <Tab to="/" icon={Home} label="Home" end />
            <Tab to="/search" icon={Search} label="Search" />
            <Tab to={user ? (profile?.role === 'student' ? '/dashboard/bookings' : dashPath) : '/login'} icon={CalendarDays} label="Bookings" />
            <Tab to={user ? (profile?.role === 'student' ? '/dashboard/favorites' : dashPath) : '/login'} icon={Heart} label="Saved" />
            <Tab
              to={user ? (profile?.role === 'admin' ? '/admin' : profile?.role === 'broker' ? '/broker' : '/dashboard') : '/login'}
              icon={profile?.role === 'admin' ? Shield : profile?.role === 'broker' ? LayoutDashboard : User}
              label="Profile"
            />
          </div>
        </nav>
      )}

      <footer className="hidden md:block border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
          <div>
            {logo()}
            <p className="mt-3 text-sm text-slate-500 leading-relaxed">
              Student housing made simple. Find verified apartments, rooms, and beds near your university.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Explore</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <Link to="/search" className="block hover:text-brand-600">Search housing</Link>
              <Link to="/search?listing_type=private_room" className="block hover:text-brand-600">Private rooms</Link>
              <Link to="/search?listing_type=shared_bed" className="block hover:text-brand-600">Shared beds</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">For Brokers</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <Link to="/login?mode=signup&role=broker" className="block hover:text-brand-600">List your property</Link>
              <Link to="/broker" className="block hover:text-brand-600">Broker dashboard</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Company</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Cairo, Egypt</p>
              <p>hello@agarly.com</p>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Agarly. Student Housing Platform.
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
