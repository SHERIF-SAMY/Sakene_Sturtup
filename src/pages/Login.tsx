import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Phone, Sparkles } from 'lucide-react';
import supabase from '../lib/supabase';
import { apiSend } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import type { Profile } from '../contexts/AuthContext';
import Logo from '../components/Logo';

export default function Login() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setProfileState } = useAuth();
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'signup'>(params.get('mode') === 'signup' ? 'signup' : 'login');
  const [accountType, setAccountType] = useState<'tenant' | 'owner' | 'broker'>(
    params.get('role') === 'owner' ? 'owner' : params.get('role') === 'broker' ? 'broker' : 'tenant'
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
        if (password !== confirmPassword) {
          throw new Error('كلمتا المرور غير متطابقتين');
        }

        const effectiveRole = accountType === 'owner' ? 'owner' : accountType === 'broker' ? 'broker' : 'tenant';
        const isBrokerAccount = accountType === 'broker' || accountType === 'owner';

        // Check if email or phone is already in use
        const checkRes = await fetch(`/api/profiles?check=unique&email=${encodeURIComponent(email.trim().toLowerCase())}&phone=${encodeURIComponent(phone.trim())}`);
        if (!checkRes.ok) {
          const checkData = await checkRes.json().catch(() => ({}));
          throw new Error(checkData.error || 'فشل التحقق من صحة البيانات.');
        }

        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              phone: phone.trim(),
              role: effectiveRole,
              is_broker_account: isBrokerAccount,
            },
          },
        });

        let userId = data?.user?.id;

        if (err || !userId) {
          if (err?.message?.includes('already registered')) {
            throw new Error('هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.');
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
          role: effectiveRole,
          is_broker_account: isBrokerAccount,
        });

        if (profile) {
          setProfileState(profile);
          redirectFor(profile.role);
        } else {
          redirectFor(effectiveRole);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('login.err_generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-slate-50 dark:bg-[#000616] text-slate-900 dark:text-white transition-colors">
      <div className="w-full max-w-md">
        {/* Brand Logo Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <Logo size="lg" showTagline />
          <h1 className="text-2xl font-black mt-6 text-slate-900 dark:text-white">
            {mode === 'login' ? 'مرحباً بك مجدداً في أجرلي' : 'انضم إلى منصة أجرلي'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs font-bold">
            {mode === 'login' ? 'سجل دخولك لمتابعة عقاراتك وحجوزاتك' : 'أنشئ حسابك وابدأ تجربة إيجار سريعة ومضمونة'}
          </p>
        </div>

        <div className="bg-white dark:bg-[#111A30] rounded-3xl border border-slate-200/80 dark:border-[#1E2B4A] shadow-xl p-6 sm:p-8">
          {mode === 'signup' && (
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-[#0A1020] rounded-2xl mb-6 border border-slate-200/60 dark:border-[#1E2B4A]">
              {[
                { type: 'tenant', label: 'طالب / مستأجر' },
                { type: 'owner', label: 'مالك شقة' },
                { type: 'broker', label: 'وسيط / سمسار' },
              ].map(({ type, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAccountType(type as any)}
                  className={`py-2 rounded-xl text-xs font-black transition ${
                    accountType === type
                      ? 'bg-[#FCB431] text-[#000616] shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {label}
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
              <Field icon={Phone} placeholder="رقم الهاتف (ضروري للمعاينة)" value={phone} onChange={setPhone} type="tel" required maxLength={11} />
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
              <div className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl px-3.5 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#FCB431] hover:bg-[#EAA01C] text-[#000616] font-black text-sm transition shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? t('login.wait') : mode === 'login' ? t('login.signin') : t('login.create_account')}</span>
            </button>
          </form>

          <p className="mt-6 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
            {mode === 'login' ? (
              <>
                ليس لديك حساب بعد؟{' '}
                <button type="button" className="text-[#FCB431] hover:underline" onClick={() => { setMode('signup'); setError(''); }}>
                  أنشئ حساباً جديداً
                </button>
              </>
            ) : (
              <>
                لديك حساب بالفعل؟{' '}
                <button type="button" className="text-[#FCB431] hover:underline" onClick={() => { setMode('login'); setError(''); }}>
                  سجل دخولك الآن
                </button>
              </>
            )}
          </p>
        </div>

        <p className="text-center mt-6">
          <Link to="/" className="text-xs font-bold text-slate-500 hover:text-[#FCB431] transition">
            العودة للرئيسية
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  icon: Icon, placeholder, value, onChange, type = 'text', required, maxLength,
}: {
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // For tel type, allow only digits
    if (type === 'tel') {
      val = val.replace(/[^0-9]/g, '');
    }
    // Enforce maxLength
    if (maxLength && val.length > maxLength) {
      return;
    }
    onChange(val);
  };

  return (
    <div className="relative">
      <Icon className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className="w-full ps-10 pe-4 py-3 rounded-2xl border border-slate-200 dark:border-[#1E2B4A] bg-slate-50 dark:bg-[#0A1020] text-slate-900 dark:text-white text-xs font-bold focus:bg-white dark:focus:bg-[#0A1020] focus:ring-2 focus:ring-[#FCB431] outline-none transition"
      />
    </div>
  );
}
