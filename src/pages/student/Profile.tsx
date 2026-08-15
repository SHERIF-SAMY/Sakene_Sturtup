import { useState } from 'react';
import { apiSend } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Profile() {
  const { profile, refreshProfile, signOut } = useAuth();
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

  const roleLabel = () => {
    switch (profile?.role) {
      case 'tenant': return t('profile.role_tenant');
      case 'student': return t('profile.role_student');
      case 'broker': return t('profile.role_broker');
      case 'owner': return t('profile.role_owner');
      case 'admin': return t('profile.role_admin');
      default: return profile?.role || '';
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMsg('');
    try {
      await apiSend('/api/profiles', 'PUT', {
        id: profile.id,
        first_name: firstName,
        last_name: lastName,
        phone,
      });
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

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 max-w-lg">
      {/* Avatar header */}
      <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-700">
        <div className="w-14 h-14 rounded-2xl bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400 flex items-center justify-center font-bold text-xl flex-shrink-0">
          {(firstName?.[0] || profile?.email?.[0] || 'U').toUpperCase()}
        </div>
        <div>
          <h2 className="font-bold text-lg text-slate-900 dark:text-white">
            {firstName || t('profile.title')}
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400">
            {roleLabel()}
          </span>
        </div>
      </div>

      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('profile.first_name')}</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('profile.last_name')}</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('profile.email')}</label>
          <input
            value={profile?.email || ''}
            disabled
            className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('profile.phone')}</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-300"
          />
        </div>

        {msg && (
          <p className={`text-sm px-3 py-2 rounded-xl ${msgType === 'success' ? 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'}`}>
            {msg}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white font-semibold disabled:opacity-60 hover:bg-brand-700 transition"
          >
            {saving ? t('common.saving') : t('profile.save_changes')}
          </button>
          <button
            type="button"
            onClick={() => signOut()}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            {t('profile.sign_out')}
          </button>
        </div>
      </form>
    </div>
  );
}
