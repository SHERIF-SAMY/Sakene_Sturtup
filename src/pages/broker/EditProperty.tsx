import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiGet, apiSend } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';
import LoadingSpinner from '../../components/LoadingSpinner';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

type Opt = { id: number; name: string };

const IMAGE_PRESETS = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80',
];

export default function EditProperty() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cities, setCities] = useState<Opt[]>([]);
  const [unis, setUnis] = useState<Opt[]>([]);
  const [amenities, setAmenities] = useState<Opt[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    amenityIds: [] as number[],
    images: [] as string[],
    coverIndex: 0,
    price: '',
    deposit: '',
  });

  useEffect(() => {
    apiGet<Opt[]>('/api/cities').then(setCities).catch(console.error);
    apiGet<Opt[]>('/api/universities').then(setUnis).catch(console.error);
    apiGet<Opt[]>('/api/amenities').then(setAmenities).catch(console.error);
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiGet<any>(`/api/properties?id=${id}`)
      .then((data) => {
        setForm({
          title: data.title || '',
          description: data.description || '',
          city_id: String(data.city_id || ''),
          university_id: String(data.university_id || ''),
          district: data.district || '',
          address: data.address || '',
          floor: String(data.floor || '0'),
          area: String(data.area || '0'),
          bedrooms: String(data.bedrooms || '1'),
          bathrooms: String(data.bathrooms || '1'),
          furnished: !!data.furnished,
          gender_allowed: data.gender_allowed || 'any',
          amenityIds: (data.property_amenities || []).map((a: any) => a.amenity_id),
          images: (data.property_images || []).sort((a: any, b: any) => a.display_order - b.display_order).map((img: any) => img.image_url),
          coverIndex: (data.property_images || []).findIndex((img: any) => img.is_cover) !== -1 ? (data.property_images || []).findIndex((img: any) => img.is_cover) : 0,
          price: String((data.listings || [])[0]?.price || ''),
          deposit: String((data.listings || [])[0]?.deposit || ''),
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load property');
        setLoading(false);
      });
  }, [id]);

  const set = (k: string, v: string | boolean | number[]) => setForm((f) => ({ ...f, [k]: v }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setError('');
    const newUrls: string[] = [];
    for (const file of files) {
      try {
        const ext = file.name.split('.').pop();
        const fileName = `property_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, file, { upsert: true });
        if (uploadError) throw new Error(uploadError.message);
        const { data } = supabase.storage.from('property-images').getPublicUrl(fileName);
        newUrls.push(data.publicUrl);
      } catch (uploadErr) {
        // Do NOT fall back to blob:// URLs — they are temporary and will break for other users.
        setError(`Failed to upload image: ${uploadErr instanceof Error ? uploadErr.message : 'Unknown error'}. Please try again.`);
        setUploading(false);
        return;
      }
    }
    setForm((f) => ({ ...f, images: [...f.images, ...newUrls] }));
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (idx: number) => {
    setForm((f) => {
      const imgs = f.images.filter((_, i) => i !== idx);
      const cover = idx === f.coverIndex ? 0 : f.coverIndex > idx ? f.coverIndex - 1 : f.coverIndex;
      return { ...f, images: imgs, coverIndex: Math.max(0, cover) };
    });
  };

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
    if (!form.title || !form.city_id) {
      setError('Title and city are required');
      return;
    }
    if (form.price && Number(form.price) <= 0) {
      setError('Price must be a positive number');
      return;
    }
    if (form.deposit && Number(form.deposit) < 0) {
      setError('Deposit cannot be negative');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await apiSend<{ id: number }>('/api/properties', 'PUT', {
        id: Number(id),
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
        amenities: form.amenityIds,
        images: form.images.length ? form.images.map((url, idx) => ({
            image_url: url,
            is_cover: idx === form.coverIndex,
            display_order: idx
        })) : [{ image_url: IMAGE_PRESETS[0], is_cover: true, display_order: 0 }],
        // Include price update in the request if provided
        ...(form.price ? { price: Number(form.price), deposit: Number(form.deposit || 0) } : {}),
      });
      navigate(`/properties/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <form onSubmit={submit} className="bg-white rounded-3xl border border-slate-100 p-6 space-y-5 max-w-3xl">
      <h2 className="text-xl font-bold text-slate-900">Edit property</h2>

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

      <div className="grid sm:grid-cols-2 gap-4">
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
        <Field label="Monthly price (EGP)" value={form.price} onChange={(v) => set('price', v)} type="number" />
        <Field label="Deposit (EGP)" value={form.deposit} onChange={(v) => set('deposit', v)} type="number" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Photos ({form.images.length})</label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 disabled:opacity-60 transition-colors"
          >
            {uploading ? (
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 0L8 8m4-4l4 4" />
              </svg>
            )}
            {uploading ? 'Uploading…' : 'Add photos'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        {form.images.length === 0 ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-36 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-brand-400 hover:text-brand-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5M21 7.5V18M12 3v4.5" />
            </svg>
            <span className="text-sm font-medium">Click to upload photos</span>
            <span className="text-xs">JPG, PNG, WEBP — multiple files supported</span>
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {form.images.map((url, idx) => (
              <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden">
                <img src={url} alt={`photo ${idx + 1}`} className="w-full h-full object-cover" />
                {idx === form.coverIndex && (
                  <span className="absolute top-1 left-1 bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">Cover</span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {idx !== form.coverIndex && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, coverIndex: idx }))}
                      className="bg-white/90 text-slate-700 text-[10px] font-semibold px-2 py-1 rounded-lg hover:bg-white"
                    >
                      Set cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="bg-red-500 text-white p-1 rounded-lg hover:bg-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
        {saving ? 'Submitting…' : 'Submit changes for review'}
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
