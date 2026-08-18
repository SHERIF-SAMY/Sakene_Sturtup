import { Link } from 'react-router-dom';
import { Heart, MapPin, BedDouble, ShieldCheck, Sparkles, Navigation } from 'lucide-react';
import { formatPrice, listingTypeLabel } from '../lib/api';
import { useTranslation } from 'react-i18next';

export type PropertyCardData = {
  id: number;
  title: string;
  district?: string;
  bedrooms?: number;
  beds_count?: number;
  tenant_type?: string;
  for_students?: boolean;
  gender_allowed?: string;
  furnished?: boolean;
  is_featured?: boolean;
  rating_avg?: number;
  cities?: { name: string } | null;
  universities?: { name: string } | null;
  property_images?: { image_url: string; is_cover?: boolean; display_order?: number }[];
  listings?: { id: number; listing_type: string; price: number; status: string }[];
  broker_profiles?: {
    company_name?: string;
    verified_badge?: boolean;
    rating?: number;
    slug?: string;
  } | null;
  available_beds_count?: number;
};

function coverImage(p: PropertyCardData) {
  const imgs = p.property_images || [];
  const cover = imgs.find((i) => i.is_cover) || imgs[0];
  return cover?.image_url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80';
}

function lowestPrice(p: PropertyCardData) {
  const active = (p.listings || []).filter((l) => l.status === 'active');
  if (!active.length) return null;
  return Math.min(...active.map((l) => l.price));
}

function primaryType(p: PropertyCardData) {
  const active = (p.listings || []).filter((l) => l.status === 'active');
  return active[0]?.listing_type || 'entire_apartment';
}

function getTenantBadge(p: PropertyCardData) {
  if (p.gender_allowed === 'female') return 'سكن طالبات';
  if (p.gender_allowed === 'male') return 'سكن شباب';
  if (p.tenant_type === 'students' || p.for_students) return 'مخصص للطلاب';
  return 'سكن هادئ';
}

export default function ApartmentCard({
  property,
  favorited,
  onToggleFavorite,
}: {
  property: PropertyCardData;
  favorited?: boolean;
  onToggleFavorite?: (id: number) => void;
}) {
  const price = lowestPrice(property);
  const type = primaryType(property);
  const { t } = useTranslation();

  return (
    <article className={`group bg-white dark:bg-[#111A30] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border ${
      property.is_featured
        ? 'border-[#FCB431] ring-2 ring-[#FCB431]/25 dark:ring-[#FCB431]/40'
        : 'border-slate-200/70 dark:border-[#1E2B4A]'
    }`}>
      {/* Property Image Container */}
      <div className="relative aspect-[16/11] overflow-hidden bg-slate-100 dark:bg-[#0A1020]">
        <Link to={`/properties/${property.id}`}>
          <img
            src={coverImage(property)}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          <div className="flex flex-wrap gap-1.5 pointer-events-auto">
            {property.is_featured && (
              <span className="px-3 py-1 rounded-xl bg-[#FCB431] text-[#000616] text-[11px] font-black shadow-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> مميز
              </span>
            )}
            <span className="px-2.5 py-1 rounded-xl bg-[#2B3143]/90 backdrop-blur-md text-white text-[11px] font-bold shadow-sm">
              {listingTypeLabel(type)}
            </span>
          </div>

          {/* Favorite heart */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite(property.id);
              }}
              className="w-9 h-9 rounded-full bg-white/95 dark:bg-[#0A1020]/90 backdrop-blur-md flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition pointer-events-auto"
              aria-label="المفضلة"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  favorited ? 'fill-rose-500 text-rose-500' : 'text-slate-700 dark:text-slate-200'
                }`}
              />
            </button>
          )}
        </div>

        {/* Student Tag Bottom-Left */}
        <div className="absolute bottom-2.5 right-2.5">
          <span className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-[#0A1020]/90 backdrop-blur-md text-[10px] font-bold text-slate-800 dark:text-slate-200 shadow-sm border border-slate-200/50 dark:border-[#1E2B4A]">
            {getTenantBadge(property)}
          </span>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-4">
        {/* Title */}
        <Link
          to={`/properties/${property.id}`}
          className="font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-[#FCB431] transition text-base"
        >
          {property.title}
        </Link>

        {/* Location & University Distance */}
        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <MapPin className="w-3.5 h-3.5 text-[#FCB431] shrink-0" />
          <span className="line-clamp-1">
            {property.district || property.cities?.name || 'موقع مميز'}
            {property.universities?.name ? ` · بالقرب من ${property.universities.name}` : ''}
          </span>
        </div>

        {/* Property Features Chips */}
        <div className="mt-3.5 grid grid-cols-2 gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-bold">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#0A1020] px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-[#1E2B4A]">
            <span>{property.bedrooms || 1} غرف</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#0A1020] px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-[#1E2B4A]">
            <BedDouble className="w-3.5 h-3.5 text-[#FCB431]" />
            <span className="truncate">
              {type === 'shared_bed'
                ? `${property.available_beds_count ?? property.beds_count ?? 1} سرير متاح`
                : `${property.beds_count || property.bedrooms || 1} أسِرّة`}
            </span>
          </div>
        </div>

        {/* Verification Status */}
        {property.broker_profiles?.verified_badge && (
          <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>معلن موثق من أجرلي</span>
          </div>
        )}

        {/* Bottom Price and CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1E2B4A] flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block">{t('card.from')}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black text-[#2B3143] dark:text-[#FCB431]">
                {price != null ? formatPrice(price) : '—'}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                {type === 'shared_bed' ? '/ للسرير' : '/ شهرياً'}
              </span>
            </div>
          </div>

          <Link
            to={`/properties/${property.id}`}
            className="px-4 py-2 rounded-xl bg-[#FCB431] hover:bg-[#EAA01C] text-[#000616] text-xs font-black transition shadow-sm hover:shadow active:scale-95 flex items-center gap-1 shrink-0"
          >
            <span>احجز الآن</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
