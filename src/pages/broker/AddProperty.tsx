import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiSend } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { createClient } from '@supabase/supabase-js';

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

// أشهر مدن ومناطق كفر الشيخ
const KAFR_CITIES = [
  { id: 'kafr_elsheikh', name_ar: 'كفر الشيخ', name_en: 'Kafr El-Sheikh' },
  { id: 'desouk', name_ar: 'دسوق', name_en: 'Desouk' },
  { id: 'fuwwah', name_ar: 'فوّه', name_en: 'Fuwwah' },
  { id: 'metoubes', name_ar: 'مطوبس', name_en: 'Metoubes' },
  { id: 'bella', name_ar: 'بيلا', name_en: 'Bella' },
  { id: 'alriad', name_ar: 'الرياض', name_en: 'Al-Riad' },
  { id: 'borg_alburollos', name_ar: 'برج البرلس', name_en: 'Borg Al-Burollos' },
  { id: 'alhammoul', name_ar: 'الحامول', name_en: 'Al-Hammoul' },
  { id: 'qellen', name_ar: 'قلين', name_en: 'Qellen' },
  { id: 'sedi_salem', name_ar: 'سيدي سالم', name_en: 'Sidi Salem' },
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

export default function AddProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const [amenities, setAmenities] = useState<Opt[]>([]);
  const [brokerId, setBrokerId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // We still need to resolve city_id from the DB for the API
  const [dbCities, setDbCities] = useState<Opt[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    city_key: '',       // key from KAFR_CITIES
    city_custom: '',    // when city_key === 'other'
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
    listing_type: 'private_room',
    price: '4500',
    deposit: '4500',
    amenityIds: [] as number[],
    images: [] as string[],
    coverIndex: 0,
  });

  useEffect(() => {
    // Fetch DB cities for ID resolution and amenities
    apiGet<Opt[]>('/api/cities').then(setDbCities).catch(console.error);
    apiGet<Opt[]>('/api/amenities').then(setAmenities).catch(console.error);
    if (user) {
      apiGet<{ id: number }>(`/api/brokers?user_id=${user.id}`)
        .then((b) => setBrokerId(b.id))
        .catch(console.error);
    }
  }, [user]);

  const [roomsConfig, setRoomsConfig] = useState<{ name: string; beds_count: number }[]>([
    { name: 'Room 1', beds_count: 1 },
    { name: 'Room 2', beds_count: 1 },
  ]);

  const totalBeds = roomsConfig.reduce((sum, r) => sum + Number(r.beds_count || 1), 0);

  const handleBedroomsChange = (val: string) => {
    const n = Math.max(1, parseInt(val) || 1);
    set('bedrooms', String(n));
    setRoomsConfig((prev) => {
      const next = [...prev];
      if (next.length < n) {
        for (let i = next.length; i < n; i++) {
          next.push({ name: `Room ${i + 1}`, beds_count: form.listing_type === 'shared_bed' ? 2 : 1 });
        }
      } else if (next.length > n) {
        next.splice(n);
      }
      return next;
    });
  };

  const handleListingTypeChange = (val: string) => {
    set('listing_type', val);
    setRoomsConfig((prev) =>
      prev.map((r) => ({
        ...r,
        beds_count: val === 'shared_bed' ? 2 : 1,
      }))
    );
  };

  const set = (k: string, v: string | boolean | number[]) => setForm((f) => ({ ...f, [k]: v }));

  // Resolve or create city_id from DB cities based on selected key/name
  const ensureCityId = async (): Promise<number | null> => {
    const cityName = (form.city_key === 'other'
      ? form.city_custom
      : KAFR_CITIES.find(c => c.id === form.city_key)?.[isAr ? 'name_ar' : 'name_en'] ?? '').trim();

    if (!cityName) return dbCities[0]?.id ?? null;

    // Try to find matching DB city
    const match = dbCities.find(c =>
      c.name.toLowerCase().includes(cityName.toLowerCase()) ||
      cityName.toLowerCase().includes(c.name.toLowerCase())
    );
    if (match) return match.id;

    // If custom city name was typed and not found in DB, create it in DB
    try {
      const created = await apiSend<{ id: number }>('/api/cities', 'POST', {
        name: cityName,
        governorate: 'كفر الشيخ',
      });
      return created.id;
    } catch (e) {
      console.error('Failed to create city:', e);
      return dbCities[0]?.id ?? null;
    }
  };

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
        setError(t('addProperty.err_upload', { msg: uploadErr instanceof Error ? uploadErr.message : 'Unknown error' }));
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
    if (!user) {
      setError(isAr ? 'عليك تسجيل الدخول أولاً' : 'You must be logged in.');
      return;
    }
    if (!form.title || !form.city_key || !form.price) {
      setError(t('addProperty.err_required'));
      return;
    }
    if (form.city_key === 'other' && !form.city_custom.trim()) {
      setError(t('addProperty.err_required'));
      return;
    }
    if (Number(form.price) <= 0) {
      setError(t('addProperty.err_price'));
      return;
    }
    if (Number(form.deposit) < 0) {
      setError(t('addProperty.err_deposit'));
      return;
    }
    setSaving(true);
    setError('');

    // Build city name for address purposes
    const cityName = form.city_key === 'other'
      ? form.city_custom.trim()
      : KAFR_CITIES.find(c => c.id === form.city_key)?.[isAr ? 'name_ar' : 'name_en'] ?? '';
    const cityId = await ensureCityId();

    try {
      const prop = await apiSend<{ id: number }>('/api/properties', 'POST', {
        title: form.title,
        description: form.description,
        city_id: cityId,
        university_id: null,
        district: form.district || cityName,
        address: form.address || `${cityName}، ${form.district}`,
        floor: Number(form.floor),
        area: Number(form.area),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        beds_count: totalBeds,
        tenant_type: form.tenant_type,
        furnished: form.furnished,
        for_students: form.tenant_type === 'students' || form.for_students,
        gender_allowed: form.gender_allowed,
        broker_id: brokerId || null,
        owner_id: user.id,
        status: 'active',
        amenities: form.amenityIds,
        images: form.images.length ? form.images : [IMAGE_PRESETS[0]],
        listings: [
          {
            listing_type: form.listing_type,
            price: Number(form.price),
            deposit: Number(form.deposit),
            minimum_months: 1,
          },
        ],
        rooms: roomsConfig.map((r, roomIdx) => {
          const bedsPerRoom = Math.max(1, r.beds_count);
          const bedLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
          return {
            name: r.name || `Room ${roomIdx + 1}`,
            beds_count: bedsPerRoom,
            gender: form.gender_allowed,
            beds: Array.from({ length: bedsPerRoom }, (_, bedIdx) => ({
              bed_number: bedLetters[bedIdx] ?? String(bedIdx + 1),
              price: Number(form.price),
            })),
          };
        }),
      });
      navigate('/broker/properties');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : (isAr ? 'حدث خطأ ما' : 'An error occurred'));
    } finally {
      setSaving(false);
    }
  };

  const selectedCityObj = KAFR_CITIES.find(c => c.id === form.city_key);

  return (
    <form onSubmit={submit} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-6 space-y-5 max-w-3xl">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('addProperty.title')}</h2>

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

      {/* City Selection */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('addProperty.city')}</label>
          <select
            value={form.city_key}
            required
            onChange={(e) => set('city_key', e.target.value)}
            className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            <option value="">—</option>
            {KAFR_CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {isAr ? c.name_ar : c.name_en}
              </option>
            ))}
          </select>
        </div>

        {/* Custom city input when 'other' is selected */}
        {form.city_key === 'other' && (
          <Field
            label={t('addProperty.city_other')}
            value={form.city_custom}
            onChange={(v) => set('city_custom', v)}
            placeholder={t('addProperty.city_other_placeholder')}
            required
          />
        )}

        {form.city_key && form.city_key !== 'other' && (
          <Field label={t('addProperty.district')} value={form.district} onChange={(v) => set('district', v)} />
        )}
      </div>

      <Field label={t('addProperty.address')} value={form.address} onChange={(v) => set('address', v)} />

      <div className="grid sm:grid-cols-2 gap-4">
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
        <Field label={t('addProperty.floor')} value={form.floor} onChange={(v) => set('floor', v)} type="number" />
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

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('addProperty.listing_type')}</label>
          <select value={form.listing_type} onChange={(e) => handleListingTypeChange(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
            <option value="entire_apartment">{t('addProperty.entire_apartment')}</option>
            <option value="private_room">{t('addProperty.private_room')}</option>
            <option value="shared_bed">{t('addProperty.shared_bed')}</option>
          </select>
        </div>
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
        <div className="flex flex-col gap-3 justify-end pb-1">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={form.furnished}
              onChange={(e) => set('furnished', e.target.checked)}
              className="w-4 h-4 rounded"
            />
            {t('addProperty.furnished')}
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={form.for_students}
              onChange={(e) => set('for_students', e.target.checked)}
              className="w-4 h-4 rounded"
            />
            {t('addProperty.for_students')}
          </label>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field
          label={form.listing_type === 'shared_bed' ? 'الإيجار الشهري للسرير (جنيه)' : t('addProperty.price')}
          value={form.price}
          onChange={(v) => set('price', v)}
          type="number"
          required
        />
        <Field label={t('addProperty.deposit')} value={form.deposit} onChange={(v) => set('deposit', v)} type="number" />
      </div>

      {/* Photos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
            {form.images.length > 0 ? t('addProperty.photos_count', { count: form.images.length }) : t('addProperty.photos')}
          </label>
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
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
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
                  <span className="absolute top-1 start-1 bg-brand-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">{t('addProperty.cover')}</span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {idx !== form.coverIndex && (
                    <button type="button" onClick={() => setForm((f) => ({ ...f, coverIndex: idx }))} className="bg-white/90 text-slate-700 text-[10px] font-semibold px-2 py-1 rounded-lg hover:bg-white">
                      {t('addProperty.set_cover')}
                    </button>
                  )}
                  <button type="button" onClick={() => removeImage(idx)} className="bg-red-500 text-white p-1 rounded-lg hover:bg-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {form.images.length > 0 && (
          <p className="mt-1.5 text-xs text-slate-400">{t('addProperty.hover_hint')}</p>
        )}
      </div>

      {/* Amenities */}
      <div>
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('addProperty.amenities')}</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {amenities.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => toggleAmenity(a.id)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition ${
                form.amenityIds.includes(a.id)
                  ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-200 dark:border-brand-700 text-brand-700 dark:text-brand-400'
                  : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
              }`}
            >
              {isAr ? (AMENITY_AR[a.name] || a.name) : a.name}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button type="submit" disabled={saving} className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold disabled:opacity-60 hover:bg-brand-700 transition">
        {saving ? t('addProperty.submitting') : t('addProperty.submit')}
      </button>
    </form>
  );
}

function Field({
  label, value, onChange, type = 'text', required, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
      />
    </div>
  );
}
