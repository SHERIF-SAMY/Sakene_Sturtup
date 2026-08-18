import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, SlidersHorizontal, X, Search, Sparkles, Building2, GraduationCap, MapPin, Check } from 'lucide-react';
import { apiGet, apiSend } from '../lib/api';
import ApartmentCard, { type PropertyCardData } from '../components/ApartmentCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

type Uni = { id: number; name: string };
type City = { id: number; name: string };

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [results, setResults] = useState<PropertyCardData[]>([]);
  const [unis, setUnis] = useState<Uni[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [favIds, setFavIds] = useState<Set<number>>(new Set());

  const filters = useMemo(
    () => ({
      q: params.get('q') || '',
      university_id: params.get('university_id') || '',
      city_id: params.get('city_id') || '',
      district: params.get('district') || '',
      gender: params.get('gender') || '',
      listing_type: params.get('listing_type') || '',
      min_price: params.get('min_price') || '',
      max_price: params.get('max_price') || '',
      furnished: params.get('furnished') || '',
      for_students: params.get('for_students') || '',
      sort: params.get('sort') || 'newest',
    }),
    [params]
  );

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    setParams(next);
  };

  const resetFilters = () => {
    setParams(new URLSearchParams());
  };

  useEffect(() => {
    apiGet<Uni[]>('/api/universities').then(setUnis).catch(console.error);
    apiGet<City[]>('/api/cities').then(setCities).catch(console.error);
    apiGet<string[]>('/api/search?districts=true').then(setDistricts).catch(console.error);
  }, []);

  useEffect(() => {
    if (!user) return;
    apiGet<{ property_id: number }[]>(`/api/favorites?user_id=${user.id}`)
      .then((rows) => setFavIds(new Set(rows.map((r) => r.property_id))))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) qs.set(k, v);
    });
    apiGet<PropertyCardData[]>(`/api/search?${qs.toString()}`)
      .then(setResults)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  const toggleFav = async (propertyId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const isFav = favIds.has(propertyId);
    try {
      if (isFav) {
        await apiSend('/api/favorites', 'DELETE', { user_id: user.id, property_id: propertyId });
        setFavIds((prev) => {
          const n = new Set(prev);
          n.delete(propertyId);
          return n;
        });
      } else {
        await apiSend('/api/favorites', 'POST', { user_id: user.id, property_id: propertyId });
        setFavIds((prev) => new Set(prev).add(propertyId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const FilterForm = (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
          {t('search.keyword')}
        </label>
        <div className="relative">
          <input
            value={filters.q}
            onChange={(e) => update('q', e.target.value)}
            placeholder={t('search.keyword_placeholder')}
            className="w-full ps-9 pe-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-slate-50 dark:bg-[#0A1020] text-slate-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-[#FCB431] transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
          الجامعة القريبة
        </label>
        <select
          value={filters.university_id}
          onChange={(e) => update('university_id', e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-slate-50 dark:bg-[#0A1020] text-slate-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-[#FCB431] transition"
        >
          <option value="">كافة الجامعات</option>
          {unis.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
          {t('search.listing_type')}
        </label>
        <select
          value={filters.listing_type}
          onChange={(e) => update('listing_type', e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-slate-50 dark:bg-[#0A1020] text-slate-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-[#FCB431] transition"
        >
          <option value="">{t('search.any')}</option>
          <option value="entire_apartment">{t('search.entire_apartment')}</option>
          <option value="private_room">{t('search.private_room')}</option>
          <option value="shared_bed">{t('search.shared_bed')}</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
          سكن مخصص لـ
        </label>
        <select
          value={filters.gender}
          onChange={(e) => update('gender', e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-slate-50 dark:bg-[#0A1020] text-slate-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-[#FCB431] transition"
        >
          <option value="">الكل (طالبات / شباب)</option>
          <option value="female">سكن طالبات</option>
          <option value="male">سكن شباب</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
          نطاق السعر (ج.م)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="الحد الأدنى"
            value={filters.min_price}
            onChange={(e) => update('min_price', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-slate-50 dark:bg-[#0A1020] text-slate-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-[#FCB431] transition"
          />
          <input
            type="number"
            placeholder="الحد الأقصى"
            value={filters.max_price}
            onChange={(e) => update('max_price', e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-slate-50 dark:bg-[#0A1020] text-slate-900 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-[#FCB431] transition"
          />
        </div>
      </div>

      <div className="pt-2 flex flex-col gap-2.5 border-t border-slate-100 dark:border-[#1E2B4A]">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.furnished === 'true'}
            onChange={(e) => update('furnished', e.target.checked ? 'true' : '')}
            className="rounded border-slate-300 text-[#FCB431] focus:ring-[#FCB431] w-4 h-4"
          />
          <span>شقق مفروشة فقط</span>
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.for_students === 'true'}
            onChange={(e) => update('for_students', e.target.checked ? 'true' : '')}
            className="rounded border-slate-300 text-[#FCB431] focus:ring-[#FCB431] w-4 h-4"
          />
          <span>مخصص للطلاب فقط</span>
        </label>
      </div>

      <button
        onClick={resetFilters}
        type="button"
        className="w-full mt-2 py-2 text-xs font-bold text-slate-500 hover:text-[#FCB431] transition text-center"
      >
        إعادة ضبط الفلاتر
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
      {/* Top Header & Fast Chips */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-lg bg-[#FCB431]/20 text-[#000616] dark:text-[#FCB431] text-[11px] font-black">
                محرك بحث أجرلي
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
              استكشف الشقق والغرف الطلابية
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-1">
              {loading ? 'جاري البحث عن أنسب الخيارات...' : `تم العثور على ${results.length} خيار متاح`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filters.sort}
              onChange={(e) => update('sort', e.target.value)}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-[#1E2B4A] bg-white dark:bg-[#111A30] text-slate-800 dark:text-white text-xs font-bold outline-none focus:ring-2 focus:ring-[#FCB431] shadow-sm"
            >
              <option value="newest">الأحدث أولاً</option>
              <option value="price_asc">السعر: من الأقل للأعلى</option>
              <option value="price_desc">السعر: من الأعلى للأقل</option>
              <option value="rating">الأعلى تقييماً</option>
            </select>
            
            <button
              type="button"
              onClick={() => setShowFilters(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FCB431] text-[#000616] text-xs font-black shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" /> الفلاتر
            </button>
          </div>
        </div>

        {/* Rapid Quick Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { label: 'سكن طالبات', key: 'gender', val: 'female' },
            { label: 'سكن شباب', key: 'gender', val: 'male' },
            { label: 'غرف خاصة', key: 'listing_type', val: 'private_room' },
            { label: 'سراير مشتركة', key: 'listing_type', val: 'shared_bed' },
            { label: 'مفروش بالكامل', key: 'furnished', val: 'true' },
          ].map((chip) => {
            const isActive = filters[chip.key as keyof typeof filters] === chip.val;
            return (
              <button
                key={chip.label}
                onClick={() => update(chip.key, isActive ? '' : chip.val)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#2B3143] text-white shadow-sm'
                    : 'bg-white dark:bg-[#111A30] border border-slate-200 dark:border-[#1E2B4A] text-slate-700 dark:text-slate-300 hover:border-[#FCB431]'
                }`}
              >
                {isActive && <Check className="w-3 h-3 text-[#FCB431]" />}
                <span>{chip.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Sidebar + Results */}
      <div className="grid lg:grid-cols-[290px_1fr] gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 bg-white dark:bg-[#111A30] border border-slate-200/80 dark:border-[#1E2B4A] rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-5 font-black text-slate-900 dark:text-white text-sm pb-3 border-b border-slate-100 dark:border-[#1E2B4A]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#FCB431]" />
                <span>فلاتر البحث</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FCB431]/20 text-[#2B3143] dark:text-[#FCB431]">
                تخصيص
              </span>
            </div>
            {FilterForm}
          </div>
        </aside>

        {/* Results Stream */}
        <div>
          {loading ? (
            <div className="py-20">
              <LoadingSpinner label="جاري استعراض الشقق والغرف..." />
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white dark:bg-[#111A30] rounded-3xl border border-slate-200 dark:border-[#1E2B4A] p-12 text-center">
              <EmptyState
                title="لم يتم العثور على شقق تطابق هذا البحث"
                description="جرّب تعديل الفلاتر أو توسيع نطاق البحث عن جامعتك أو منطقتك."
              />
              <button
                onClick={resetFilters}
                className="mt-6 px-6 py-2.5 rounded-xl bg-[#FCB431] text-[#000616] font-bold text-xs shadow-sm hover:bg-[#EAA01C] transition"
              >
                عرض كافة العقارات المتاحة
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.map((p) => (
                <ApartmentCard
                  key={p.id}
                  property={p}
                  favorited={favIds.has(p.id)}
                  onToggleFavorite={toggleFav}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Filters */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="relative bg-white dark:bg-[#111A30] rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto border-t border-slate-100 dark:border-[#1E2B4A]">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-[#1E2B4A]">
              <h3 className="font-black text-slate-900 dark:text-white text-base">فلاتر البحث والتصفية</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 rounded-xl bg-slate-100 dark:bg-[#0A1020] text-slate-600 dark:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            {FilterForm}
            <button
              onClick={() => setShowFilters(false)}
              className="mt-6 w-full py-3.5 rounded-2xl bg-[#FCB431] text-[#000616] font-black text-sm shadow-md"
            >
              تطبيق الفلاتر وعرض النتائج
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
