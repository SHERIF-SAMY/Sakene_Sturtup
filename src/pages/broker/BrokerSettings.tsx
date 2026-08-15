import { useEffect, useState } from 'react';
import { apiGet, apiSend } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function BrokerSettings() {
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');
  const [brokerId, setBrokerId] = useState<number | null>(null);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    company_name: '',
    bio: '',
    experience_years: '1',
    response_time: '1 hour',
  });

  // Populate form from profile immediately (auto-fill)
  useEffect(() => {
    if (profile) {
      setForm(prev => ({
        ...prev,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        email: profile.email || '',
      }));
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const b = await apiGet<{
          id: number;
          company_name: string;
          bio: string;
          experience_years: number;
          response_time: string;
        }>(`/api/brokers?user_id=${user.id}`);
        setBrokerId(b.id);
        setForm(prev => ({
          ...prev,
          company_name: b.company_name || '',
          bio: b.bio || '',
          experience_years: String(b.experience_years || 1),
          response_time: b.response_time || '1 hour',
        }));
      } catch (e) {
        // Broker entry might not exist yet — that's fine
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMsg('');
    try {
      // Update profile (name, phone)
      await apiSend('/api/profiles', 'PUT', {
        id: profile.id,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
      });

      // Update broker info if broker entry exists
      if (brokerId) {
        await apiSend('/api/brokers', 'PUT', {
          id: brokerId,
          company_name: form.company_name,
          bio: form.bio,
          experience_years: Number(form.experience_years),
          response_time: form.response_time,
        });
      }

      await refreshProfile();
      setMsgType('success');
      setMsg(t('profile.updated'));
    } catch (err: unknown) {
      setMsgType('error');
      setMsg(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const roleLabel = () => {
    switch (profile?.role) {
      case 'broker': return t('profile.role_broker');
      case 'owner': return t('profile.role_owner');
      default: return profile?.role || '';
    }
  };

  return (
    <form onSubmit={save} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 max-w-xl space-y-5">
      <div className="flex items-center gap-4 pb-2 border-b border-slate-100 dark:border-slate-700">
        {/* Avatar initials */}
        <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400 flex items-center justify-center font-bold text-2xl flex-shrink-0">
          {(form.first_name?.[0] || profile?.email?.[0] || 'U').toUpperCase()}
        </div>
        <div>
          <h2 className="font-bold text-xl text-slate-900 dark:text-white">
            {form.first_name || profile?.first_name || t('profile.title')}
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400">
            {roleLabel()}
          </span>
        </div>
      </div>

      {/* Personal info section */}
      <div className="space-y-4">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t('profile.title')}</p>

        <div className="grid grid-cols-2 gap-3">
          <FieldInput
            label={t('profile.first_name')}
            value={form.first_name}
            onChange={(v) => setForm(f => ({ ...f, first_name: v }))}
          />
          <FieldInput
            label={t('profile.last_name')}
            value={form.last_name}
            onChange={(v) => setForm(f => ({ ...f, last_name: v }))}
          />
        </div>

        <FieldInput
          label={t('profile.email')}
          value={form.email}
          onChange={() => {}}
          disabled
          hint="البريد الإلكتروني لا يمكن تغييره"
        />

        <FieldInput
          label={t('profile.phone')}
          value={form.phone}
          onChange={(v) => setForm(f => ({ ...f, phone: v }))}
          type="tel"
        />
      </div>

      {/* Broker info section — only show if broker/owner */}
      {(profile?.role === 'broker' || profile?.role === 'owner') && (
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {profile.role === 'broker' ? t('profile.role_broker') : t('profile.role_owner')}
          </p>

          <FieldInput
            label={t('profile.company_name')}
            value={form.company_name}
            onChange={(v) => setForm(f => ({ ...f, company_name: v }))}
          />

          <div className="grid grid-cols-2 gap-3">
            <FieldInput
              label={t('profile.experience_years')}
              value={form.experience_years}
              onChange={(v) => setForm(f => ({ ...f, experience_years: v }))}
              type="number"
            />
            <FieldInput
              label={t('profile.response_time')}
              value={form.response_time}
              onChange={(v) => setForm(f => ({ ...f, response_time: v }))}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('profile.bio')}</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
              rows={4}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
        </div>
      )}

      {msg && (
        <p className={`text-sm px-3 py-2 rounded-xl ${msgType === 'success' ? 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'}`}>
          {msg}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold disabled:opacity-60 hover:bg-brand-700 transition"
      >
        {saving ? t('common.saving') : t('profile.save_changes')}
      </button>
    </form>
  );
}

function FieldInput({
  label, value, onChange, type = 'text', disabled, hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-300 transition ${
          disabled ? 'bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 cursor-not-allowed' : 'dark:bg-slate-700 dark:text-white'
        }`}
      />
      {hint && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
    </div>
  );
}
