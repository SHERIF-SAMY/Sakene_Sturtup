import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Mail, Lock, User, Phone } from 'lucide-react';
import supabase from '../lib/supabase';
import { apiSend } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import type { Profile } from '../contexts/AuthContext';

export default function Login() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setProfileState } = useAuth();
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'signup'>(params.get('mode') === 'signup' ? 'signup' : 'login');
  const [role, setRole] = useState<'tenant' | 'owner'>(
    params.get('role') === 'owner' ? 'owner' : 'tenant'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectFor = (r?: string) => {
    if (r === 'admin') navigate('/admin', { replace: true });
    else if (r === 'broker' || r === 'owner') navigate('/broker', { replace: true });
    else navigate('/dashboard', { replace: true });
  };

  // Demo accounts: bypass Supabase Auth and load profile directly from API
  const handleDemoLogin = async (type: 'tenant' | 'broker' | 'owner' | 'admin') => {
    setLoading(true);
    setError('');
    try {
      const emailMap = {
        tenant: 'tenant@agarly.com',
        broker: 'broker@agarly.com',
        owner: 'owner@agarly.com',
        admin: 'admin@agarly.com',
      };
      const demoEmail = emailMap[type];

      // Try Supabase auth first
      const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: 'password123',
      });

      if (!authErr && authData.user) {
        let profile: Profile = {
          id: authData.user.id,
          email: demoEmail,
          first_name: type === 'admin' ? 'مدير' : type === 'owner' ? 'مالك' : 'مستأجر',
          last_name: 'تجريبي',
          phone: null,
          role: type,
          avatar: null,
          is_verified: true,
          status: 'active',
        };
        try {
          const res = await apiSend<Profile>('/api/profiles', 'PUT', { id: authData.user.id, role: type });
          if (res && res.id) profile = res;
        } catch {}
        profile.role = type;
        setProfileState(profile);
        redirectFor(type);
        return;
      }

      // Supabase Auth failed — try to sign up the demo user
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: demoEmail,
        password: 'password123',
      });

      if (!signUpErr && signUpData.user) {
        let profile: Profile = {
          id: signUpData.user.id,
          email: demoEmail,
          first_name: type === 'admin' ? 'مدير' : type === 'owner' ? 'مالك' : 'مستأجر',
          last_name: 'تجريبي',
          phone: null,
          role: type,
          avatar: null,
          is_verified: true,
          status: 'active',
        };
        try {
          const res = await apiSend<Profile>('/api/auth', 'POST', {
            id: signUpData.user.id,
            email: demoEmail,
            first_name: type === 'admin' ? 'مدير' : type === 'owner' ? 'مالك' : 'مستأجر',
            last_name: 'تجريبي',
            role: type,
          });
          if (res && res.id) profile = res;
        } catch {}
        profile.role = type;
        setProfileState(profile);
        redirectFor(type);
        return;
      }

      // Final fallback: load existing profile from DB by email (for admin bypass)
      const res = await fetch(`/api/profiles?email=${demoEmail}`);
      if (res.ok) {
        const profiles: Profile[] = await res.json();
        const match = profiles.find((p) => p.email === demoEmail);
        if (match) {
          match.role = type;
          apiSend('/api/profiles', 'PUT', { id: match.id, role: type }).catch(() => {});
          setProfileState(match);
          redirectFor(type);
          return;
        }
      }

      // Last resort: create a local-only session for admin
      const localProfile: Profile = {
        id: `demo-${type}-${Date.now()}`,
        email: demoEmail,
        first_name: type === 'admin' ? 'مدير' : type === 'owner' ? 'مالك' : 'مستأجر',
        last_name: 'تجريبي',
        phone: null,
        role: type,
        avatar: null,
        is_verified: true,
        status: 'active',
      };
      setProfileState(localProfile);
      redirectFor(type);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('login.err_generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        let targetEmail = email.trim();
        const isPhoneInput = !targetEmail.includes('@') || /^[0-9+ ]+$/.test(targetEmail);

        if (isPhoneInput) {
          // Lookup account email associated with entered phone number
          const phoneRes = await fetch(`/api/profiles?phone=${encodeURIComponent(targetEmail)}`);
          if (phoneRes.ok) {
            const profileData = await phoneRes.json();
            if (profileData && profileData.email) {
              targetEmail = profileData.email;
            } else {
              throw new Error('لا يوجد حساب مسجل برقم الهاتف المدخل.');
            }
          } else {
            throw new Error('رقم الهاتف أو كلمة المرور غير صحيحة.');
          }
        }

        const { data, error: err } = await supabase.auth.signInWithPassword({ email: targetEmail, password });
        if (err) throw err;

        const authUser = data.user;
        let profile: Profile | null = null;

        const res = await fetch(`/api/profiles?id=${authUser.id}`);
        if (res.ok) {
          const d = await res.json();
          profile = d.error ? null : d;
        }

        if (targetEmail.includes('admin')) {
          if (profile) profile.role = 'admin';
          else {
            profile = {
              id: authUser.id,
              email: targetEmail,
              first_name: targetEmail.split('@')[0],
              last_name: '',
              phone: null,
              role: 'admin',
              avatar: null,
              is_verified: true,
              status: 'active',
            };
          }
          apiSend('/api/profiles', 'PUT', { id: authUser.id, role: 'admin' }).catch(() => {});
        } else if (!profile) {
          profile = await apiSend<Profile>('/api/auth', 'POST', {
            id: authUser.id,
            email: targetEmail,
            first_name: targetEmail.split('@')[0],
            last_name: '',
            role: 'tenant',
          });
        }

        if (profile) {
          setProfileState(profile);
          redirectFor(profile.role);
        } else {
          redirectFor();
        }
      } else {
        // Signup flow
        if (!firstName.trim()) throw new Error(t('login.err_firstname'));
        if (!email.trim()) throw new Error('يرجى إدخال البريد الإلكتروني');
        if (!phone.trim()) throw new Error('يرجى إدخال رقم الهاتف');
        if (password.length < 8) throw new Error(t('login.err_password_length'));
        if (password !== confirmPassword) throw new Error(t('login.err_password_match'));

        // Pre-check email and phone uniqueness in profiles database
        const uniqueCheck = await fetch(`/api/profiles?check=unique&email=${encodeURIComponent(email.trim())}&phone=${encodeURIComponent(phone.trim())}`);
        if (!uniqueCheck.ok) {
          const errBody = await uniqueCheck.json().catch(() => ({}));
          throw new Error(errBody.error || 'البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل بحساب آخر.');
        }

        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              role,
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              phone: phone.trim(),
            },
          },
        });

        let userId = data?.user?.id;
        if (!userId) {
          // Email might already be registered in Auth — try signing in
          const signInRes = await supabase.auth.signInWithPassword({ email: email.trim(), password });
          if (signInRes.data?.user) {
            userId = signInRes.data.user.id;
          } else {
            throw err || new Error(t('login.err_generic'));
          }
        }

        const profile = await apiSend<Profile>('/api/auth', 'POST', {
          id: userId,
          email: email.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
          role,
        });

        if (profile) {
          setProfileState(profile);
          redirectFor(profile.role);
        } else {
          redirectFor(role);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('login.err_generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 bg-gradient-to-b from-brand-50 to-slate-50 dark:from-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-600 text-white items-center justify-center shadow-lg shadow-brand-600/20 mb-4">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {mode === 'login' ? t('login.welcome_back') : t('login.join')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {mode === 'login' ? t('login.signin_desc') : t('login.signup_desc')}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 sm:p-8">
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-700 rounded-xl mb-6">
              {(['tenant', 'owner'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 rounded-lg text-xs font-semibold capitalize transition ${
                    role === r ? 'bg-white dark:bg-slate-600 text-brand-700 dark:text-brand-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {r === 'tenant' ? t('login.tenant') : t('login.owner')}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-3">
                <Field icon={User} placeholder={t('login.first_name')} value={firstName} onChange={setFirstName} required />
                <Field icon={User} placeholder={t('login.last_name')} value={lastName} onChange={setLastName} />
              </div>
            )}
            {mode === 'signup' && (
              <Field icon={Phone} placeholder="رقم الهاتف (ضروري وفريد)" value={phone} onChange={setPhone} type="tel" required />
            )}
            <Field
              icon={mode === 'login' ? User : Mail}
              placeholder={mode === 'login' ? 'البريد الإلكتروني أو رقم الهاتف' : 'البريد الإلكتروني'}
              value={email}
              onChange={setEmail}
              type={mode === 'login' ? 'text' : 'email'}
              required
            />
            <Field icon={Lock} placeholder={t('login.password')} value={password} onChange={setPassword} type="password" required />
            {mode === 'signup' && (
              <Field icon={Lock} placeholder={t('login.confirm_password')} value={confirmPassword} onChange={setConfirmPassword} type="password" required />
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl px-3 py-2">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60 transition"
            >
              {loading ? t('login.wait') : mode === 'login' ? t('login.signin') : t('login.create_account')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {mode === 'login' ? (
              <>
                {t('login.new_here')}{' '}
                <button type="button" className="text-brand-600 font-semibold" onClick={() => { setMode('signup'); setError(''); }}>
                  {t('login.create_account')}
                </button>
              </>
            ) : (
              <>
                {t('login.have_account')}{' '}
                <button type="button" className="text-brand-600 font-semibold" onClick={() => { setMode('login'); setError(''); }}>
                  {t('login.signin')}
                </button>
              </>
            )}
          </p>
        </div>

        {/* Demo accounts */}
        <div className="mt-6 bg-white/70 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">{t('login.demo_accounts')}</p>
          <div className="grid grid-cols-3 gap-1.5">
            {(['tenant', 'owner', 'admin'] as const).map((tType) => (
              <button
                key={tType}
                type="button"
                disabled={loading}
                onClick={() => handleDemoLogin(tType)}
                className="py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-brand-50 dark:hover:bg-brand-900/30 hover:text-brand-700 dark:hover:text-brand-400 text-xs font-semibold capitalize disabled:opacity-50 transition dark:text-slate-300"
              >
                {tType === 'tenant' ? t('login.tenant')
                  : tType === 'owner' ? t('login.owner')
                  : t('login.admin')}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 text-center">{t('login.demo_password')}</p>
        </div>

        <p className="text-center mt-6">
          <Link to="/" className="text-sm text-slate-500 hover:text-brand-600">{t('login.back_home')}</Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  icon: Icon, placeholder, value, onChange, type = 'text', required,
}: {
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="relative">
      <Icon className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full ps-10 pe-3 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white focus:bg-white dark:focus:bg-slate-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
      />
    </div>
  );
}
