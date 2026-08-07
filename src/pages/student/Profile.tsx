import { useState } from 'react';
import { apiSend } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export default function Profile() {
  const { profile, refreshProfile, signOut } = useAuth();
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

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
      setMsg('Profile updated');
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 max-w-lg">
      <h2 className="font-bold text-lg text-slate-900 mb-4">Your profile</h2>
      <form onSubmit={save} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">First name</label>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">Last name</label>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
          <input value={profile?.email || ''} disabled className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200" />
        </div>
        <div className="text-sm text-slate-500">
          Role: <span className="font-semibold capitalize text-slate-800">{profile?.role}</span>
        </div>
        {msg && <p className="text-sm text-brand-700">{msg}</p>}
        <div className="flex gap-2">
          <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-semibold disabled:opacity-60">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button type="button" onClick={() => signOut()} className="px-5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-700">
            Sign out
          </button>
        </div>
      </form>
    </div>
  );
}
