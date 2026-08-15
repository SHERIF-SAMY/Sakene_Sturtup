import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
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
        <label className="text-xs font-semibold text-slate-500 uppercase">{t('search.keyword')}</label>
        <input
          value={filters.q}
          onChange={(e) => update('q', e.target.value)}
          placeholder={t('search.keyword_placeholder')}
          className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-brand-500"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase">{t('search.city')}</label>
        <select
          value={filters.city_id}
          onChange={(e) => update('city_id', e.target.value)}
          className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm"
        >
          <option value="">كفر الشيخ</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase">{t('search.listing_type')}</label>
        <select
          value={filters.listing_type}
          onChange={(e) => update('listing_type', e.target.value)}
          className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm"
        >
          <option value="">{t('search.any')}</option>
          <option value="entire_apartment">{t('search.entire_apartment')}</option>
          <option value="private_room">{t('search.private_room')}</option>
          <option value="shared_bed">{t('search.shared_bed')}</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase">{t('search.gender')}</label>
        <select
          value={filters.gender}
          onChange={(e) => update('gender', e.target.value)}
          className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm"
        >
          <option value="">{t('search.any')}</option>
          <option value="male">{t('search.male')}</option>
          <option value="female">{t('search.female')}</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase">{t('search.min_price')}</label>
          <input
            type="number"
            value={filters.min_price}
            onChange={(e) => update('min_price', e.target.value)}
            className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase">{t('search.max_price')}</label>
          <input
            type="number"
            value={filters.max_price}
            onChange={(e) => update('max_price', e.target.value)}
            className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={filters.furnished === 'true'}
            onChange={(e) => update('furnished', e.target.checked ? 'true' : '')}
            className="rounded border-slate-300 text-brand-600"
          />
          {t('search.furnished_only')}
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={filters.for_students === 'true'}
            onChange={(e) => update('for_students', e.target.checked ? 'true' : '')}
            className="rounded border-slate-300 text-brand-600"
          />
          للطلبة / سكن طلاب
        </label>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t('search.title')}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? t('search.searching') : t('search.results', { count: results.length })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filters.sort}
            onChange={(e) => update('sort', e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium"
          >
            <option value="newest">{t('search.sort_newest')}</option>
            <option value="price_asc">{t('search.sort_price_asc')}</option>
            <option value="price_desc">{t('search.sort_price_desc')}</option>
            <option value="rating">{t('search.sort_rating')}</option>
          </select>
          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className="md:hidden inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold"
          >
            <SlidersHorizontal className="w-4 h-4" /> {t('search.filters')}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="hidden lg:block">
          <div className="sticky top-24 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 font-semibold text-slate-900">
              <Filter className="w-4 h-4 text-brand-600" /> {t('search.filters')}
            </div>
            {FilterForm}
          </div>
        </aside>

        <div>
          {loading ? (
            <LoadingSpinner label={t('search.loading')} />
          ) : results.length === 0 ? (
            <EmptyState
              title={t('search.no_results_title')}
              description={t('search.no_results_desc')}
            />
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
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

      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{t('search.filters')}</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 rounded-xl hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            {FilterForm}
            <button
              onClick={() => setShowFilters(false)}
              className="mt-6 w-full py-3 rounded-xl bg-brand-600 text-white font-semibold"
            >
              {t('search.show_results')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
