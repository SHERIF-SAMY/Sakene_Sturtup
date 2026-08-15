import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiGet, apiSend } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
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

const AMENITY_AR: Record<string, string> = {
  'Wifi': 'واي فاي (إنترنت)',
  'Wi-Fi': 'واي فاي (إنترنت)',
  'Air Conditioning': 'تكييف',
  'AC': 'تكييف',
  'Elevator': 'مصعد (أسانسير)',
  'Balcony': 'بلكونة (شرفة)',
  'Parking': 'موقف سيارات (جراج)',
  'Washing Machine': 'غسالة',
  'Kitchen': 'مطبخ مجهز',
  'TV': 'تلفزيون',
  'Security': 'أمن وحراسة',
  'Natural Gas': 'غاز طبيعي',
  'Water Heater': 'سخان مياه',
  'Refrigerator': 'ثلاجة',
  'Microwave': 'ميكروويف',
  'Furnished': 'مفروش بالكامل',
};

export default function EditProperty() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [cities, setCities] = useState<Opt[]>([]);
  const [unis, setUnis] = useState<Opt[]>([]);
  const [amenities, setAmenities] = useState<Opt[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [roomsConfig, setRoomsConfig] = useState<{ name: string; beds_count: number }[]>([]);

  const totalBeds = roomsConfig.reduce((sum, r) => sum + Number(r.beds_count || 1), 0);

  const handleBedroomsChange = (val: string) => {
    const n = Math.max(1, parseInt(val) || 1);
    set('bedrooms', String(n));
    setRoomsConfig((prev) => {
      const next = [...prev];
      if (next.length < n) {
        for (let i = next.length; i < n; i++) {
          next.push({ name: `Room ${i + 1}`, beds_count: 1 });
        }
      } else if (next.length > n) {
        next.splice(n);
      }
      return next;
    });
  };

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
    beds_count: '2',
    bathrooms: '1',
    furnished: true,
    for_students: false,
    tenant_type: 'all',
    gender_allowed: 'any',
    amenityIds: [] as number[],
    images: [] as string[],
    coverIndex: 0,
    price: '',
    deposit: '',
    listing_type: '',
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
          beds_count: String(data.beds_count || data.bedrooms || '1'),
          bathrooms: String(data.bathrooms || '1'),
          furnished: !!data.furnished,
          for_students: !!data.for_students,
          tenant_type: data.tenant_type || (data.for_students ? 'students' : 'all'),
          gender_allowed: data.gender_allowed || 'any',
          amenityIds: (data.property_amenities || []).map((a: any) => a.amenity_id),
          images: (data.property_images || []).sort((a: any, b: any) => a.display_order - b.display_order).map((img: any) => img.image_url),
          coverIndex: (data.property_images || []).findIndex((img: any) => img.is_cover) !== -1 ? (data.property_images || []).findIndex((img: any) => img.is_cover) : 0,
          price: String((data.listings || [])[0]?.price || ''),
          deposit: String((data.listings || [])[0]?.deposit || ''),
          listing_type: String((data.listings || [])[0]?.listing_type || 'private_room'),
        });
        if (data.rooms && data.rooms.length > 0) {
          setRoomsConfig(data.rooms.map((r: any) => ({
            name: r.name,
            beds_count: r.beds_count || (r.beds ? r.beds.length : 1),
          })));
        } else {
          const count = Math.max(1, data.bedrooms || 1);
          setRoomsConfig(Array.from({ length: count }, (_, i) => ({
            name: `Room ${i + 1}`,
            beds_count: 1
          })));
        }
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
        beds_count: totalBeds,
        tenant_type: form.tenant_type,
        furnished: form.furnished,
        for_students: form.tenant_type === 'students' || form.for_students,
        gender_allowed: form.gender_allowed,
        amenities: form.amenityIds,
        images: form.images.length ? form.images.map((url, idx) => ({
            image_url: url,
            is_cover: idx === form.coverIndex,
            display_order: idx
        })) : [{ image_url: IMAGE_PRESETS[0], is_cover: true, display_order: 0 }],
        rooms: roomsConfig.map((r, roomIdx) => {
          const bedsPerRoom = Math.max(1, r.beds_count);
          const bedLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
          return {
            name: r.name || `Room ${roomIdx + 1}`,
            beds_count: bedsPerRoom,
            gender: form.gender_allowed,
            beds: Array.from({ length: bedsPerRoom }, (_, bedIdx) => ({
              bed_number: bedLetters[bedIdx] ?? String(bedIdx + 1),
              price: Number(form.price || 0),
            })),
          };
        }),
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
    <form onSubmit={submit} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 space-y-5 max-w-3xl">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('broker.edit_property')}</h2>

      <Field label={t('addProperty.property_title')} value={form.title} onChange={(v) => set('title', v)} required />
      <div>
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('addProperty.description')}</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={4}
          className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Select label={t('addProperty.city')} value={form.city_id} onChange={(v) => set('city_id', v)} options={cities} required />
        <Field label={t('addProperty.district')} value={form.district} onChange={(v) => set('district', v)} />
        <Field label={t('addProperty.address')} value={form.address} onChange={(v) => set('address', v)} />
        <Field label={t('addProperty.floor')} value={form.floor} onChange={(v) => set('floor', v)} type="number" />
        <Field label={t('addProperty.area')} value={form.area} onChange={(v) => set('area', v)} type="number" />
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('addProperty.bedrooms')}</label>
          <input
            type="number"
            value={form.bedrooms}
            required
            onChange={(e) => handleBedroomsChange(e.target.value)}
            className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">إجمالي عدد الأسرة (السراير)</label>
          <input
            type="number"
            value={totalBeds}
            disabled
            className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
          />
        </div>
        <Field label={t('addProperty.bathrooms')} value={form.bathrooms} onChange={(v) => set('bathrooms', v)} type="number" />
      </div>

      {/* Room Bed Configuration Panel */}
      <div className="bg-slate-50 dark:bg-slate-700/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white">تقسيم الغرف بالأسرة</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {roomsConfig.map((room, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase w-20 shrink-0">
                {room.name}:
              </label>
              <input
                type="number"
                min="1"
                value={room.beds_count}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 1);
                  setRoomsConfig((prev) => {
                    const next = [...prev];
                    next[idx] = { ...next[idx], beds_count: val };
                    return next;
                  });
                }}
                className="w-20 px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:border-brand-500 outline-none"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">سراير</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">الفئة المستهدفة للسكن</label>
          <select value={form.tenant_type} onChange={(e) => set('tenant_type', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white font-medium">
            <option value="all">لكافة الفئات (عائلات / طلبة / أفراد)</option>
            <option value="students">طلبة فقط (سكن طلاب)</option>
            <option value="families">عائلات فقط (سكن عائلي)</option>
            <option value="individuals">أفراد / موظفين</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('addProperty.gender')}</label>
          <select value={form.gender_allowed} onChange={(e) => set('gender_allowed', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
            <option value="any">{t('addProperty.gender_any')}</option>
            <option value="male">{t('addProperty.gender_male')}</option>
            <option value="female">{t('addProperty.gender_female')}</option>
          </select>
        </div>
        <label className="flex items-end gap-2 pb-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
          <input type="checkbox" checked={form.furnished} onChange={(e) => set('furnished', e.target.checked)} />
          {t('addProperty.furnished')}
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label={form.listing_type === 'shared_bed' ? 'الإيجار الشهري للسرير (جنيه)' : t('addProperty.price')}
          value={form.price}
          onChange={(v) => set('price', v)}
          type="number"
        />
        <Field label={t('addProperty.deposit')} value={form.deposit} onChange={(v) => set('deposit', v)} type="number" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('addProperty.photos_count', { count: form.images.length })}</label>
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
            {uploading ? t('addProperty.uploading') : t('addProperty.add_photos')}
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
            className="w-full h-36 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-brand-400 hover:text-brand-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5M21 7.5V18M12 3v4.5" />
            </svg>
            <span className="text-sm font-medium">{t('addProperty.click_upload')}</span>
            <span className="text-xs">{t('addProperty.upload_hint')}</span>
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
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('addProperty.amenities')}</label>
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
              {isAr ? (AMENITY_AR[a.name] || a.name) : a.name}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button type="submit" disabled={saving} className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold disabled:opacity-60 hover:bg-brand-700 transition">
        {saving ? t('addProperty.submitting') : t('broker.submit_changes')}
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
      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
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
      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{label}</label>
      <select
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.name}</option>
        ))}
      </select>
    </div>
  );
}
