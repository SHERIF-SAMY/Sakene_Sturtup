import { Link } from 'react-router-dom';
import { Heart, MapPin, BedDouble, BadgeCheck, Star } from 'lucide-react';
import { formatPrice, listingTypeLabel } from '../lib/api';
import { useTranslation } from 'react-i18next';

export type PropertyCardData = {
  id: number;
  title: string;
  district?: string;
  gender_allowed?: string;
  furnished?: boolean;
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
    <article className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Link to={`/properties/${property.id}`}>
          <img
            src={coverImage(property)}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-white/95 text-xs font-semibold text-slate-800 shadow-sm">
            {listingTypeLabel(type)}
          </span>
        </div>
        {onToggleFavorite && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(property.id);
            }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 flex items-center justify-center shadow-sm hover:scale-105 transition"
            aria-label="Favorite"
          >
            <Heart
              className={`w-4.5 h-4.5 ${favorited ? 'fill-red-500 text-red-500' : 'text-slate-600'}`}
            />
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/properties/${property.id}`} className="font-semibold text-slate-900 line-clamp-1 hover:text-brand-600">
            {property.title}
          </Link>
          {property.broker_profiles?.rating != null && (
            <span className="flex items-center gap-1 text-sm font-medium text-slate-700 shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {property.broker_profiles.rating}
            </span>
          )}
        </div>

        <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="line-clamp-1">
            {property.district || property.cities?.name}
            {property.universities?.name ? ` · ${t('card.near')} ${property.universities.name}` : ''}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <BedDouble className="w-3.5 h-3.5" />
            {(property.listings || []).filter((l) => l.status === 'active').length} {t('card.listings')}
          </span>
          {property.broker_profiles?.verified_badge && (
            <span className="inline-flex items-center gap-1 text-brand-600 font-medium">
              <BadgeCheck className="w-3.5 h-3.5" /> {t('card.verified')}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400">{t('card.from')}</p>
            <p className="text-lg font-bold text-slate-900">
              {price != null ? formatPrice(price) : '—'}
              <span className="text-xs font-medium text-slate-400">{t('card.per_month')}</span>
            </p>
          </div>
          <Link
            to={`/properties/${property.id}`}
            className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition"
          >
            {t('card.view')}
          </Link>
        </div>
      </div>
    </article>
  );
}
