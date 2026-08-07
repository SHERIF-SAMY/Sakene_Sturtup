import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiSend } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

type Opt = { id: number; name: string };

const IMAGE_PRESETS = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80',
];

export default function AddProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cities, setCities] = useState<Opt[]>([]);
  const [unis, setUnis] = useState<Opt[]>([]);
  const [amenities, setAmenities] = useState<Opt[]>([]);
  const [brokerId, setBrokerId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    city_id: '',
    university_id: '',
    district: '',
    address: '',
    floor: '1',
    area: '90',
    bedrooms: '2',
    bathrooms: '1',
    furnished: true,
    gender_allowed: 'any',
    listing_type: 'private_room',
    price: '4500',
    deposit: '4500',
    amenityIds: [] as number[],
    image: IMAGE_PRESETS[0],
  });

  useEffect(() => {
    apiGet<Opt[]>('/api/cities').then(setCities).catch(console.error);
    apiGet<Opt[]>('/api/universities').then(setUnis).catch(console.error);
    apiGet<Opt[]>('/api/amenities').then(setAmenities).catch(console.error);
    if (user) {
      apiGet<{ id: number }>(`/api/brokers?user_id=${user.id}`)
        .then((b) => setBrokerId(b.id))
        .catch(console.error);
    }
  }, [user]);

  const set = (k: string, v: string | boolean | number[]) => setForm((f) => ({ ...f, [k]: v }));

  const toggleAmenity = (id: number) => {
    setForm((f) => ({
      ...f,
      amenityIds: f.amenityIds.includes(id)
        ? f.amenityIds.filter((x) => x !== id)
        : [...f.amenityIds, id],
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brokerId || !user) {
      setError('Broker profile not found');
      return;
    }
    if (!form.title || !form.city_id || !form.price) {
      setError('Title, city, and price are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const prop = await apiSend<{ id: number }>('/api/properties', 'POST', {
        title: form.title,
        description: form.description,
        city_id: Number(form.city_id),
        university_id: form.university_id ? Number(form.university_id) : null,
        district: form.district,
        address: form.address,
        floor: Number(form.floor),
        area: Number(form.area),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        furnished: form.furnished,
        gender_allowed: form.gender_allowed,
        broker_id: brokerId,
        owner_id: user.id,
        status: 'active',
        amenities: form.amenityIds,
        images: [form.image],
        listings: [
          {
            listing_type: form.listing_type,
            price: Number(form.price),
            deposit: Number(form.deposit),
            minimum_months: 1,
          },
        ],
        rooms: [
          {
            name: 'Room 1',
            beds_count: form.listing_type === 'shared_bed' ? 2 : 1,
            gender: form.gender_allowed,
            beds: [{ bed_number: 'A', price: Number(form.price) }],
          },
        ],
      });
      navigate(`/properties/${prop.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white rounded-3xl border border-slate-100 p-6 space-y-5 max-w-3xl">
      <h2 className="text-xl font-bold text-slate-900">Add property</h2>

      <Field label="Title" value={form.title} onChange={(v) => set('title', v)} required />
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={4}
          className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Select label="City" value={form.city_id} onChange={(v) => set('city_id', v)} options={cities} required />
        <Select label="University" value={form.university_id} onChange={(v) => set('university_id', v)} options={unis} />
        <Field label="District" value={form.district} onChange={(v) => set('district', v)} />
        <Field label="Address" value={form.address} onChange={(v) => set('address', v)} />
        <Field label="Floor" value={form.floor} onChange={(v) => set('floor', v)} type="number" />
        <Field label="Area (m²)" value={form.area} onChange={(v) => set('area', v)} type="number" />
        <Field label="Bedrooms" value={form.bedrooms} onChange={(v) => set('bedrooms', v)} type="number" />
        <Field label="Bathrooms" value={form.bathrooms} onChange={(v) => set('bathrooms', v)} type="number" />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase">Listing type</label>
          <select value={form.listing_type} onChange={(e) => set('listing_type', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200">
            <option value="entire_apartment">Entire Apartment</option>
            <option value="private_room">Private Room</option>
            <option value="shared_bed">Shared Bed</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase">Gender</label>
          <select value={form.gender_allowed} onChange={(e) => set('gender_allowed', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200">
            <option value="any">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <label className="flex items-end gap-2 pb-2 text-sm font-medium text-slate-700">
          <input type="checkbox" checked={form.furnished} onChange={(e) => set('furnished', e.target.checked)} />
          Furnished
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Monthly price (EGP)" value={form.price} onChange={(v) => set('price', v)} type="number" required />
        <Field label="Deposit (EGP)" value={form.deposit} onChange={(v) => set('deposit', v)} type="number" />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase">Cover image</label>
        <div className="mt-2 grid grid-cols-5 gap-2">
          {IMAGE_PRESETS.map((url) => (
            <button
              key={url}
              type="button"
              onClick={() => set('image', url)}
              className={`aspect-video rounded-xl overflow-hidden border-2 ${form.image === url ? 'border-brand-600' : 'border-transparent'}`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase">Amenities</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {amenities.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => toggleAmenity(a.id)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium border ${
                form.amenityIds.includes(a.id)
                  ? 'bg-brand-50 border-brand-200 text-brand-700'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={saving} className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold disabled:opacity-60">
        {saving ? 'Publishing…' : 'Publish property'}
      </button>
    </form>
  );
}

function Field({
  label, value, onChange, type = 'text', required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200"
      />
    </div>
  );
}

function Select({
  label, value, onChange, options, required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Opt[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase">{label}</label>
      <select
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
    </div>
  );
}
