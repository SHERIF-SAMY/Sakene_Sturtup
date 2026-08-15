import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import supabase from '../lib/supabase';
import { apiGet, apiSend } from '../lib/api';

export type Profile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: 'tenant' | 'student' | 'broker' | 'admin' | 'owner' | 'super_admin';
  avatar: string | null;
  is_verified: boolean;
  status: string;
};

type AuthCtx = {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  setProfileState: (p: Profile | null) => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  setProfileState: () => {},
  refreshProfile: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      const stored = localStorage.getItem('agarly_user_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const setProfileState = (p: Profile | null) => {
    setProfile(p);
    if (p) {
      localStorage.setItem('agarly_user_profile', JSON.stringify(p));
      setUser({
        id: p.id,
        email: p.email,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User);
    } else {
      localStorage.removeItem('agarly_user_profile');
    }
  };

  const loadProfile = useCallback(async (uid: string, email?: string, metaRole?: string) => {
    try {
      const p = await apiGet<Profile>(`/api/profiles?id=${uid}`);
      if (email && email.includes('admin') && p.role !== 'admin') {
        p.role = 'admin';
        apiSend('/api/profiles', 'PUT', { id: uid, role: 'admin' }).catch(() => {});
      }
      setProfile(p);
      localStorage.setItem('agarly_user_profile', JSON.stringify(p));
    } catch {
      // Profile not found in DB — check localStorage cache FIRST before creating new one
      const stored = localStorage.getItem('agarly_user_profile');
      if (stored) {
        try {
          const cached: Profile = JSON.parse(stored);
          // Use cached profile if it belongs to the same user
          if (cached.id === uid) {
            setProfile(cached);
            return;
          }
        } catch { /* ignore */ }
      }

      // No valid cached profile — create a new one with correct user role
      const targetRole = metaRole || (email && email.includes('admin') ? 'admin' : 'tenant');
      try {
        const created = await apiSend<Profile>('/api/profiles', 'POST', {
          id: uid,
          email: email || '',
          first_name: email?.split('@')[0] || 'User',
          last_name: '',
          role: targetRole,
        });
        setProfile(created);
        localStorage.setItem('agarly_user_profile', JSON.stringify(created));
      } catch {
        // Final fallback — keep existing profile in state
      }
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await loadProfile(user.id, user.email, user.user_metadata?.role);
    else {
      const stored = localStorage.getItem('agarly_user_profile');
      if (stored) {
        const p: Profile = JSON.parse(stored);
        await loadProfile(p.id, p.email, p.role);
      }
    }
  }, [user, loadProfile]);

  useEffect(() => {
    const storedProfile = localStorage.getItem('agarly_user_profile');
    if (storedProfile) {
      try {
        const p: Profile = JSON.parse(storedProfile);
        setProfile(p);
        setUser({
          id: p.id,
          email: p.email,
          app_metadata: {},
          user_metadata: { role: p.role },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        } as User);
      } catch {}
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        setUser(s.user);
        loadProfile(s.user.id, s.user.email, s.user.user_metadata?.role).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        setUser(s.user);
        // Only reload profile if we don't already have one for this user
        const stored = localStorage.getItem('agarly_user_profile');
        if (stored) {
          try {
            const cached: Profile = JSON.parse(stored);
            if (cached.id === s.user.id) {
              // Already have a valid profile for this user — keep it
              setProfile(cached);
              return;
            }
          } catch { /* ignore */ }
        }
        loadProfile(s.user.id, s.user.email, s.user.user_metadata?.role);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signOut = async () => {
    await supabase.auth.signOut().catch(() => {});
    localStorage.removeItem('agarly_user_profile');
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, setProfileState, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
