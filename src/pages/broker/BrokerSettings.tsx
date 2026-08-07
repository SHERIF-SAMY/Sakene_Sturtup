import { useEffect, useState } from 'react';
import { apiGet, apiSend } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function BrokerSettings() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [brokerId, setBrokerId] = useState<number | null>(null);
  const [form, setForm] = useState({
    company_name: '',
    bio: '',
    experience_years: '1',
    response_time: '1 hour',
    first_name: '',
    last_name: '',
    phone: '',
  });

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
        setForm({
          company_name: b.company_name || '',
          bio: b.bio || '',
          experience_years: String(b.experience_years || 1),
          response_time: b.response_time || '1 hour',
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          phone: profile?.phone || '',
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, profile]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokerId || !profile) return;
    setSaving(true);
    setMsg('');
    try {
      await apiSend('/api/brokers', 'PUT', {
        id: brokerId,
        company_name: form.company_name,
        bio: form.bio,
        experience_years: Number(form.experience_years),
        response_time: form.response_time,
      });
      await apiSend('/api/profiles', 'PUT', {
        id: profile.id,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
      });
      await refreshProfile();
      setMsg('Settings saved');
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <form onSubmit={save} className="bg-white rounded-3xl border border-slate-100 p-6 max-w-xl space-y-4">
      <h2 className="font-bold text-lg text-slate-900">Broker settings</h2>
      {[ 
        ['first_name', 'First name'],
        ['last_name', 'Last name'],
        ['phone', 'Phone'],
        ['company_name', 'Company name'],
        ['experience_years', 'Years of experience'],
        ['response_time', 'Response time'],
      ].map(([key, label]) => (
        <div key={key}>
          <label className="text-xs font-semibold text-slate-500 uppercase">{label}</label>
          <input
            value={(form as Record<string, string>)[key]}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200"
          />
        </div>
      ))}
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase">Bio</label>
        <textarea
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          rows={4}
          className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200"
        />
      </div>
      {msg && <p className="text-sm text-brand-700">{msg}</p>}
      <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold disabled:opacity-60">
        {saving ? 'Saving…' : 'Save settings'}
      </button>
    </form>
  );
}
