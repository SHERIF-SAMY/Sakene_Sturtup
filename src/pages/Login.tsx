import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Mail, Lock, User, Phone } from 'lucide-react';
import supabase from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleAuth';
import { apiSend } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'signup'>(params.get('mode') === 'signup' ? 'signup' : 'login');
  const [role, setRole] = useState<'student' | 'broker'>(params.get('role') === 'broker' ? 'broker' : 'student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectFor = (r?: string) => {
    if (r === 'admin') navigate('/admin');
    else if (r === 'broker') navigate('/broker');
    else navigate('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        const res = await fetch(`/api/profiles?id=${data.user.id}`);
        const profile = res.ok ? await res.json() : null;
        await refreshProfile();
        redirectFor(profile?.role);
      } else {
        if (!firstName.trim()) throw new Error(t('login.err_firstname'));
        if (password.length < 8) throw new Error(t('login.err_password_length'));
        if (password !== confirmPassword) throw new Error(t('login.err_password_match'));
        const { data, error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        if (!data.user) throw new Error('Signup failed');
        // Step 1: Create the base profile
        await apiSend('/api/profiles', 'POST', {
          id: data.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          phone,
          role,
        });
        // Step 2 (for brokers): Create broker profile atomically — rollback on failure
        if (role === 'broker') {
          const slug = `${firstName}-${lastName || 'broker'}-${Date.now().toString(36)}`
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-');
          try {
            await apiSend('/api/brokers', 'POST', {
              user_id: data.user.id,
              company_name: `${firstName}'s Housing`,
              bio: 'Student housing specialist',
              experience_years: 1,
              slug,
            });
          } catch (brokerErr) {
            // Rollback: Delete the created profile so the user isn't stuck in a broken state
            await apiSend('/api/profiles', 'DELETE', { id: data.user.id }).catch(() => {});
            await supabase.auth.signOut();
            throw new Error('Failed to create broker profile. Please try again.');
          }
        }
        await refreshProfile();
        redirectFor(role);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('login.err_generic'));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (type: 'student' | 'broker' | 'admin') => {
    const map = {
      student: 'student@agarly.com',
      broker: 'broker@agarly.com',
      admin: 'admin@agarly.com',
    };
    setEmail(map[type]);
    setPassword('password123');
    setMode('login');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 bg-gradient-to-b from-brand-50 to-slate-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-600 text-white items-center justify-center shadow-lg shadow-brand-600/20 mb-4">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {mode === 'login' ? t('login.welcome_back') : t('login.join')}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {mode === 'login' ? t('login.signin_desc') : t('login.signup_desc')}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-6">
              {(['student', 'broker'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2.5 rounded-lg text-sm font-semibold capitalize transition ${
                    role === r ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {r === 'student' ? t('login.student') : t('login.broker')}
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
              <Field icon={Phone} placeholder={t('login.phone')} value={phone} onChange={setPhone} type="tel" />
            )}
            <Field icon={Mail} placeholder={t('login.email')} value={email} onChange={setEmail} type="email" required />
            <Field icon={Lock} placeholder={t('login.password')} value={password} onChange={setPassword} type="password" required />
            {mode === 'signup' && (
              <Field icon={Lock} placeholder={t('login.confirm_password')} value={confirmPassword} onChange={setConfirmPassword} type="password" required />
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-60 transition"
            >
              {loading ? t('login.wait') : mode === 'login' ? t('login.signin') : t('login.create_account')}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-slate-400">
            <div className="flex-1 h-px bg-slate-200" />
            {t('login.or')}
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={() => signInWithGoogle('Agarly')}
            className="w-full py-3 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5" />
            {t('login.google')}
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            {mode === 'login' ? (
              <>
                {t('login.new_here')}{' '}
                <button type="button" className="text-brand-600 font-semibold" onClick={() => setMode('signup')}>
                  {t('login.create_account')}
                </button>
              </>
            ) : (
              <>
                {t('login.have_account')}{' '}
                <button type="button" className="text-brand-600 font-semibold" onClick={() => setMode('login')}>
                  {t('login.signin')}
                </button>
              </>
            )}
          </p>
        </div>

        <div className="mt-6 bg-white/70 border border-slate-100 rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">{t('login.demo_accounts')}</p>
          <div className="grid grid-cols-3 gap-2">
            {(['student', 'broker', 'admin'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => fillDemo(t)}
                className="py-2 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-xs font-semibold capitalize"
              >
                {t}
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
      <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-sm"
      />
    </div>
  );
}
