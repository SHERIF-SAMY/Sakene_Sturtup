import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  BadgeCheck, Bath, BedDouble, Calendar, Heart, MapPin, Ruler,
  Share2, Star, Wifi, ChevronLeft, ChevronRight, User,
} from 'lucide-react';
import { apiGet, apiSend, formatPrice, listingTypeLabel } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

type Listing = {
  id: number;
  listing_type: string;
  price: number;
  deposit: number;
  status: string;
  minimum_months: number;
  available_from: string;
};

type Property = {
  id: number;
  title: string;
  description: string;
  district: string;
  address: string;
  floor: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  furnished: boolean;
  gender_allowed: string;
  cities?: { name: string } | null;
  universities?: { id: number; name: string } | null;
  property_images?: { image_url: string; is_cover?: boolean }[];
  property_amenities?: { amenities: { id: number; name: string; icon: string } }[];
  listings?: Listing[];
  reviews?: {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    profiles?: { first_name: string; last_name: string; avatar?: string };
  }[];
  rooms?: { id: number; name: string; beds_count: number; beds?: { id: number; bed_number: string; price: number; status: string }[] }[];
  broker_profiles?: {
    id: number;
    company_name: string;
    bio: string;
    rating: number;
    review_count: number;
    verified_badge: boolean;
    slug: string;
    response_time: string;
    profiles?: { first_name: string; last_name: string; avatar?: string; phone?: string };
  } | null;
};

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [favorited, setFavorited] = useState(false);
  const [showBook, setShowBook] = useState(false);
  const [selectedListing, setSelectedListing] = useState<number | null>(null);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('11:00');
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiGet<Property>(`/api/properties?id=${id}`)
      .then((p) => {
        setProperty(p);
        const active = (p.listings || []).filter((l) => l.status === 'active');
        if (active[0]) setSelectedListing(active[0].id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    apiGet<{ property_id: number }[]>(`/api/favorites?user_id=${user.id}`)
      .then((rows) => setFavorited(rows.some((r) => String(r.property_id) === String(id))))
      .catch(() => {});
  }, [user, id]);

  const images = useMemo(() => {
    const imgs = property?.property_images || [];
    if (!imgs.length) {
      return [{ image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80' }];
    }
    return [...imgs].sort((a, b) => Number(b.is_cover) - Number(a.is_cover));
  }, [property]);

  const activeListings = (property?.listings || []).filter((l) => l.status === 'active');

  const toggleFav = async () => {
    if (!user || !property) {
      navigate('/login');
      return;
    }
    try {
      if (favorited) {
        await apiSend('/api/favorites', 'DELETE', { user_id: user.id, property_id: property.id });
        setFavorited(false);
      } else {
        await apiSend('/api/favorites', 'POST', { user_id: user.id, property_id: property.id });
        setFavorited(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const bookVisit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!selectedListing || !visitDate || !visitTime) {
      setError('Please choose a listing, date, and time');
      return;
    }
    setBooking(true);
    setError('');
    try {
      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: selectedListing,
          student_id: user.id,
          visit_date: visitDate,
          visit_time: visitTime,
          notes,
          booking_fee: 50,
        }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Booking failed');
      }
      setMessage('Visit booked successfully! Check your dashboard for details.');
      setShowBook(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  // Fetch already-booked time slots when the user changes the selected date
  const fetchBookedSlots = async (date: string) => {
    if (!selectedListing || !date) return;
    try {
      const res = await fetch(`/api/visits?listing_id=${selectedListing}&visit_date=${date}&status=pending,confirmed`);
      if (res.ok) {
        const data = await res.json();
        setBookedSlots(Array.isArray(data) ? data.map((v: {visit_time: string}) => v.visit_time) : []);
      }
    } catch {
      setBookedSlots([]);
    }
  };

  if (loading) return <LoadingSpinner label="Loading property…" />;
  if (!property) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Property not found</h1>
        <Link to="/search" className="text-brand-600 font-semibold mt-4 inline-block">Back to search</Link>
      </div>
    );
  }

  const broker = property.broker_profiles;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 mb-4">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      {message && (
        <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-3 text-sm font-medium">
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div>
          <div className="relative rounded-3xl overflow-hidden bg-slate-100 aspect-[16/11]">
            <img src={images[imgIdx]?.image_url} alt={property.title} className="w-full h-full object-cover" />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`w-2 h-2 rounded-full ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 ${i === imgIdx ? 'border-brand-600' : 'border-transparent'}`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 bg-white rounded-3xl border border-slate-100 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{property.title}</h1>
                <p className="mt-2 flex items-center gap-1.5 text-slate-500">
                  <MapPin className="w-4 h-4" />
                  {property.address || property.district}
                  {property.cities?.name ? `, ${property.cities.name}` : ''}
                  {property.universities?.name ? ` · near ${property.universities.name}` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={toggleFav} className="w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                  <Heart className={`w-5 h-5 ${favorited ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
                </button>
                <button
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                >
                  <Share2 className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Meta icon={BedDouble} label="Bedrooms" value={String(property.bedrooms)} />
              <Meta icon={Bath} label="Baths" value={String(property.bathrooms)} />
              <Meta icon={Ruler} label="Area" value={`${property.area || '—'} m²`} />
              <Meta icon={User} label="Gender" value={property.gender_allowed || 'any'} />
            </div>

            <div className="mt-6">
              <h2 className="font-bold text-lg text-slate-900">About this place</h2>
              <p className="mt-2 text-slate-600 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            {!!property.property_amenities?.length && (
              <div className="mt-6">
                <h2 className="font-bold text-lg text-slate-900 mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {property.property_amenities.map((a) => (
                    <span
                      key={a.amenities.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700"
                    >
                      <Wifi className="w-3.5 h-3.5 text-brand-600" />
                      {a.amenities.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!!property.rooms?.length && (
              <div className="mt-6">
                <h2 className="font-bold text-lg text-slate-900 mb-3">Rooms & beds</h2>
                <div className="space-y-3">
                  {property.rooms.map((room) => (
                    <div key={room.id} className="rounded-2xl border border-slate-100 p-4">
                      <div className="font-semibold text-slate-800">{room.name}</div>
                      <p className="text-sm text-slate-500">{room.beds_count} bed(s)</p>
                      {!!room.beds?.length && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {room.beds.map((b) => (
                            <span key={b.id} className="text-xs px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 font-medium">
                              Bed {b.bed_number} · {formatPrice(b.price)} · {b.status}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <h2 className="font-bold text-lg text-slate-900 mb-3">Reviews</h2>
              {!property.reviews?.length ? (
                <p className="text-sm text-slate-500">No reviews yet.</p>
              ) : (
                <div className="space-y-3">
                  {property.reviews.map((r) => (
                    <div key={r.id} className="rounded-2xl border border-slate-100 p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-800">
                          {r.profiles?.first_name} {r.profiles?.last_name}
                        </p>
                        <span className="inline-flex items-center gap-1 text-sm">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {r.rating}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm sticky top-24">
            <h2 className="font-bold text-lg text-slate-900 mb-4">Available listings</h2>
            <div className="space-y-3">
              {activeListings.map((l) => (
                <label
                  key={l.id}
                  className={`block rounded-2xl border p-4 cursor-pointer transition ${
                    selectedListing === l.id ? 'border-brand-500 bg-brand-50/50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="listing"
                      checked={selectedListing === l.id}
                      onChange={() => setSelectedListing(l.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between gap-2">
                        <span className="font-semibold text-slate-900">{listingTypeLabel(l.listing_type)}</span>
                        <span className="font-bold text-brand-700">{formatPrice(l.price)}/mo</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Deposit {formatPrice(l.deposit || 0)} · Min {l.minimum_months || 1} mo
                      </p>
                    </div>
                  </div>
                </label>
              ))}
              {!activeListings.length && <p className="text-sm text-slate-500">No active listings.</p>}
            </div>

            <button
              onClick={() => setShowBook(true)}
              disabled={!activeListings.length}
              className="mt-5 w-full py-3.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" /> Book a visit · 50 EGP
            </button>
            <p className="text-xs text-slate-400 text-center mt-2">Small booking fee keeps slots serious</p>
          </div>

          {broker && (
            <div className="bg-white rounded-3xl border border-slate-100 p-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center text-lg font-bold">
                  {(broker.profiles?.first_name?.[0] || 'B').toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-slate-900">
                      {broker.profiles?.first_name} {broker.profiles?.last_name}
                    </h3>
                    {broker.verified_badge && <BadgeCheck className="w-4 h-4 text-brand-600" />}
                  </div>
                  <p className="text-sm text-slate-500">{broker.company_name}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-slate-50 p-2">
                  <p className="font-bold text-slate-900">{broker.rating}</p>
                  <p className="text-[10px] text-slate-500">Rating</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2">
                  <p className="font-bold text-slate-900">{broker.review_count}</p>
                  <p className="text-[10px] text-slate-500">Reviews</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2">
                  <p className="font-bold text-slate-900 text-xs">{broker.response_time}</p>
                  <p className="text-[10px] text-slate-500">Response</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600 line-clamp-3">{broker.bio}</p>
              <Link
                to={`/b/${broker.slug}`}
                className="mt-4 inline-flex text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                View broker profile →
              </Link>
            </div>
          )}
        </div>
      </div>

      {showBook && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowBook(false)} />
          <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900">Book a visit</h3>
            <p className="text-sm text-slate-500 mt-1">Choose a convenient time to tour this property.</p>

            <div className="mt-5 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Date</label>
                <input
                  type="date"
                  value={visitDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => {
                    setVisitDate(e.target.value);
                    fetchBookedSlots(e.target.value);
                  }}
                  className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Time</label>
                <select
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200"
                >
                  {['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((t) => (
                    <option key={t} value={t} disabled={bookedSlots.includes(t)}>
                      {t}{bookedSlots.includes(t) ? ' — Booked' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Any preferences?"
                  className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 resize-none"
                />
              </div>
              <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 flex justify-between">
                <span>Booking fee</span>
                <span className="font-semibold">50 EGP</span>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={() => setShowBook(false)} className="py-3 rounded-xl border border-slate-200 font-semibold">Cancel</button>
              <button
                onClick={bookVisit}
                disabled={booking}
                className="py-3 rounded-xl bg-brand-600 text-white font-semibold disabled:opacity-60"
              >
                {booking ? 'Booking…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Meta({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
      <Icon className="w-4 h-4 text-brand-600 mb-1" />
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-slate-900 capitalize">{value}</p>
    </div>
  );
}
