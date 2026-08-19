import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  BadgeCheck, Bath, BedDouble, Calendar, Heart, MapPin, Ruler,
  Share2, Star, Wifi, ChevronLeft, ChevronRight, User, Maximize2, X,
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
  beds_count?: number;
  bathrooms: number;
  furnished: boolean;
  for_students?: boolean;
  tenant_type?: string;
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
    response_time?: string;
    profiles?: { first_name: string; last_name: string; avatar?: string; phone?: string; role?: string };
  } | null;
};

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<(Property & { property_number?: number }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [showBook, setShowBook] = useState(false);
  const [selectedListing, setSelectedListing] = useState<number | null>(null);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('08:00');
  const [rentStartDate, setRentStartDate] = useState('');
  const [rentEndDate, setRentEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [viaBroker, setViaBroker] = useState(false);
  const [referralBrokerName, setReferralBrokerName] = useState('');
  const [referralBrokerPhone, setReferralBrokerPhone] = useState('');
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [selectedBeds, setSelectedBeds] = useState<Record<number, number>>({});
  const totalBedsBooked = useMemo(() => {
    return Object.values(selectedBeds).reduce((sum, val) => sum + val, 0);
  }, [selectedBeds]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const isOwnerOrBroker = user && (user.role === 'owner' || user.role === 'broker');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiGet<Property & { property_number?: number }>(`/api/properties?id=${id}`)
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

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') setImgIdx((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setImgIdx((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, images.length]);

  const activeListings = (property?.listings || []).filter((l) => l.status === 'active');

  const selectedListingObj = useMemo(() => {
    return property?.listings?.find((l) => l.id === selectedListing);
  }, [property, selectedListing]);

  const isSelectedListingSharedBed = selectedListingObj?.listing_type === 'shared_bed';

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
    const active = (property?.listings || []).find((l) => l.id === selectedListing);
    const isSharedBed = active?.listing_type === 'shared_bed';
    const booked_items = Object.entries(selectedBeds).map(([rid, beds]) => {
      const room = property?.rooms?.find((r) => r.id === Number(rid));
      return {
        room_id: Number(rid),
        room_name: room?.name || `Room ${rid}`,
        beds_booked: beds,
      };
    });

    if (isSharedBed && booked_items.length === 0) {
      setError('يرجى اختيار غرفة واحدة على الأقل وتحديد عدد الأسرة المطلوبة');
      return;
    }
    if (!selectedListing || !visitDate || !visitTime) {
      setError('يرجى اختيار العرض، التاريخ، والفترة الزمنية للمعاينة');
      return;
    }
    if (viaBroker && (!referralBrokerName.trim() || !referralBrokerPhone.trim())) {
      setError('يرجى كتابة اسم ورقم السمسار العقاري');
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
          rent_start_date: rentStartDate || null,
          rent_end_date: rentEndDate || null,
          notes,
          booking_fee: 200,
          via_broker: viaBroker,
          referral_broker_name: referralBrokerName,
          referral_broker_phone: referralBrokerPhone,
          ...(isSharedBed ? { booked_items } : {}),
        }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Booking failed');
      }
      setMessage('تم إرسال طلب الحجز بنجاح! يمكنك متابعة تفاصيل الطلب من لوحة التحكم.');
      setShowBook(false);
      // Redirect to bookings page
      setTimeout(() => navigate('/dashboard/bookings'), 1200);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

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

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !property) return;
    setSubmittingReview(true);
    setReviewError('');
    try {
      await apiSend('/api/reviews', 'POST', {
        property_id: property.id,
        rating,
        comment,
      });
      const updated = await apiGet<Property & { property_number?: number }>(`/api/properties?id=${id}`);
      setProperty(updated);
      setComment('');
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
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
  // Single-hour time slots from 08:00 to 22:00
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00',
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 md:py-8 w-full max-w-full min-w-0 overflow-x-hidden">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 mb-4">
        <ChevronLeft className="w-4 h-4" /> رجوع
      </button>

      {message && (
        <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-3 text-sm font-medium">
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start w-full min-w-0">
        {/* Main Content Column (Gallery, Details, Description, Rooms, Reviews) */}
        <div className="lg:col-span-7 xl:col-span-8 w-full min-w-0">
          {/* Main Image Gallery */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/11] max-h-[60vh] md:max-h-[70vh] w-full shadow-md group">
            <img
              src={images[imgIdx]?.image_url}
              alt={property.title}
              onClick={() => setLightboxOpen(true)}
              className="w-full h-full object-cover select-none cursor-zoom-in transition-transform duration-300 group-hover:scale-[1.02]"
            />

            {/* Expand button top-left */}
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="absolute top-3 left-3 bg-black/50 hover:bg-black/80 text-white backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition active:scale-95 z-10"
              aria-label="عرض الصورة بالحجم الكامل"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">عرض كامل</span>
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgIdx((i) => (i - 1 + images.length) % images.length);
                  }}
                  className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center shadow-lg transition active:scale-95 z-10"
                  aria-label="الصورة السابقة"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImgIdx((i) => (i + 1) % images.length);
                  }}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center shadow-lg transition active:scale-95 z-10"
                  aria-label="الصورة التالية"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Counter & Indicator Bar */}
                <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="pointer-events-auto bg-black/60 hover:bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold shadow-md transition flex items-center gap-1"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>{imgIdx + 1} / {images.length}</span>
                  </button>

                  {/* Dots indicator with overflow protection */}
                  <div className="max-w-[60%] overflow-x-auto scrollbar-none flex items-center gap-1.5 px-2.5 py-1.5 bg-black/40 backdrop-blur-md rounded-full pointer-events-auto">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImgIdx(i)}
                        className={`h-1.5 rounded-full transition-all shrink-0 ${
                          i === imgIdx ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/60 hover:bg-white'
                        }`}
                        aria-label={`انتقل للصورة ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Thumbnails list */}
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1.5 scrollbar-none snap-x w-full">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImgIdx(i)}
                  onDoubleClick={() => setLightboxOpen(true)}
                  className={`shrink-0 w-16 h-14 sm:w-20 sm:h-16 rounded-xl overflow-hidden border-2 transition snap-start ${
                    i === imgIdx ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Fullscreen Lightbox Modal */}
          {lightboxOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
              onClick={() => setLightboxOpen(false)}
            >
              {/* Lightbox Header Bar */}
              <div className="flex items-center justify-between z-20" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full text-white text-xs font-bold backdrop-blur-md">
                  <span>صورة {imgIdx + 1} من {images.length}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition active:scale-95"
                  aria-label="إغلاق"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Main Full-Size Image Container */}
              <div className="relative flex-1 flex items-center justify-center my-2 sm:my-4 select-none min-h-0" onClick={(e) => e.stopPropagation()}>
                <img
                  src={images[imgIdx]?.image_url}
                  alt={property.title}
                  className="max-h-[82vh] max-w-[95vw] w-auto h-auto object-contain rounded-2xl shadow-2xl transition-all duration-300"
                />

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center shadow-xl transition active:scale-95 z-30 border border-white/10"
                      aria-label="الصورة السابقة"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center shadow-xl transition active:scale-95 z-30 border border-white/10"
                      aria-label="الصورة التالية"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Bottom Thumbnails Navigation */}
              {images.length > 1 && (
                <div className="flex justify-center z-20" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2 overflow-x-auto max-w-full pb-1 scrollbar-none px-4">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImgIdx(i)}
                        className={`shrink-0 w-14 h-12 rounded-xl overflow-hidden border-2 transition ${
                          i === imgIdx ? 'border-amber-400 scale-105 opacity-100 ring-2 ring-amber-400/40' : 'border-transparent opacity-40 hover:opacity-80'
                        }`}
                      >
                        <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-5 sm:mt-6 bg-white dark:bg-[#111A30] rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-[#1E2B4A] p-4 sm:p-6 shadow-sm w-full min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 min-w-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{property.title}</h1>
                  {property.property_number && (
                    <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full">
                      شقة رقم #{property.property_number}
                    </span>
                  )}
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  {property.address || property.district}
                  {property.cities?.name ? `, ${property.cities.name}` : ''}
                  {property.universities?.name ? ` · بالقرب من ${property.universities.name}` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleFav}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-slate-200 dark:border-[#1E2B4A] flex items-center justify-center hover:bg-slate-50 dark:hover:bg-[#0A1020] transition"
                  aria-label="المفضلة"
                >
                  <Heart className={`w-5 h-5 ${favorited ? 'fill-rose-500 text-rose-500' : 'text-slate-600 dark:text-slate-300'}`} />
                </button>
                <button
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-slate-200 dark:border-[#1E2B4A] flex items-center justify-center hover:bg-slate-50 dark:hover:bg-[#0A1020] transition"
                  aria-label="مشاركة"
                >
                  <Share2 className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </div>

            {/* Property Meta Specs */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
              <Meta icon={BedDouble} label="الغرف" value={`${property.bedrooms || 1} غرف`} />
              <Meta icon={BedDouble} label="السراير (الأسرة)" value={`${property.beds_count || property.bedrooms || 1} سراير`} />
              <Meta icon={Bath} label="الحمامات" value={String(property.bathrooms)} />
              <Meta icon={Ruler} label="المساحة" value={`${property.area || '—'} م²`} />
              <Meta icon={User} label="الفئة المستهدفة" value={
                property.tenant_type === 'students' || property.for_students ? 'طلبة فقط' :
                property.tenant_type === 'families' ? 'عائلات فقط' :
                property.tenant_type === 'individuals' ? 'أفراد / موظفين' : 'لكافة الفئات'
              } />
            </div>

            {/* Description */}
            <div className="mt-6 border-t border-slate-100 dark:border-[#1E2B4A] pt-6">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white">الوصف</h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            {/* Rooms & Beds Breakdown */}
            {property.rooms && property.rooms.length > 0 && (
              <div className="mt-6 border-t border-slate-100 dark:border-[#1E2B4A] pt-6">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">تقسيم الغرف والأسرة المتاحة</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {property.rooms.map((room) => {
                    const available = room.beds ? room.beds.filter((b: any) => b.status === 'available').length : 0;
                    const total = room.beds_count || (room.beds ? room.beds.length : 0);
                    return (
                      <div key={room.id} className="rounded-2xl border border-slate-100 dark:border-[#1E2B4A] bg-slate-50/70 dark:bg-[#0A1020] p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{room.name}</span>
                          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                            available > 0
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          }`}>
                            {available > 0 ? `متاح ${available} من ${total} أسرة` : 'مكتملة بالكامل'}
                          </span>
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          {room.beds?.map((bed: any) => (
                            <span
                              key={bed.id}
                              className={`px-2.5 py-1 rounded-xl text-xs border font-bold ${
                                bed.status === 'available'
                                  ? 'bg-white dark:bg-[#111A30] text-slate-800 dark:text-slate-200 border-slate-200 dark:border-[#1E2B4A] shadow-sm'
                                  : bed.status === 'reserved'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                  : 'bg-slate-100 dark:bg-[#000616] text-slate-400 dark:text-slate-500 border-slate-200 dark:border-[#1E2B4A] line-through opacity-70'
                              }`}
                            >
                              سرير {bed.bed_number} ({
                                bed.status === 'available' ? 'متاح' :
                                bed.status === 'reserved' ? 'محجوز مؤقتاً' : 'مشغول'
                              })
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Property Amenities */}
            {!!property.property_amenities?.length && (
              <div className="mt-6 border-t border-slate-100 dark:border-[#1E2B4A] pt-6">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-3">المميزات والخدمات</h2>
                <div className="flex flex-wrap gap-2">
                  {property.property_amenities.map((a) => (
                    <span
                      key={a.amenities.id}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0A1020] border border-slate-100 dark:border-[#1E2B4A] text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm"
                    >
                      <Wifi className="w-3.5 h-3.5 text-amber-500" />
                      {a.amenities.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="mt-6 border-t border-slate-100 dark:border-[#1E2B4A] pt-6">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">التقييمات والآراء</h2>
              {user && (
                <form onSubmit={submitReview} className="mb-6 rounded-2xl bg-slate-50 dark:bg-[#0A1020] border border-slate-100 dark:border-[#1E2B4A] p-4 sm:p-5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">أضف تقييمك عن العقار</h3>
                  <div className="flex gap-1.5 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`p-1 transition active:scale-95 ${rating >= star ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="اكتب انطباعك وتجربتك في هذا السكن..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-white dark:bg-[#111A30] border border-slate-200 dark:border-[#1E2B4A] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none mb-3"
                    rows={2}
                  />
                  {reviewError && <p className="text-rose-500 text-xs mb-2 font-medium">{reviewError}</p>}
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2.5 bg-[#FCB431] hover:bg-[#EAA01C] text-[#000616] rounded-xl text-xs font-black transition shadow disabled:opacity-50"
                  >
                    {submittingReview ? 'جاري الإرسال...' : 'إرسال التقييم'}
                  </button>
                </form>
              )}
              {!property.reviews?.length ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">لا توجد تقييمات مسجلة بعد.</p>
              ) : (
                <div className="space-y-3">
                  {property.reviews.map((r) => (
                    <div key={r.id} className="rounded-2xl border border-slate-100 dark:border-[#1E2B4A] bg-slate-50/50 dark:bg-[#0A1020] p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">
                          {r.profiles?.first_name} {r.profiles?.last_name}
                        </p>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {r.rating}
                        </span>
                      </div>
                      <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Column (Listings & Broker Details) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5 w-full min-w-0 lg:sticky lg:top-24">
          <div className="bg-white dark:bg-[#111A30] rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-[#1E2B4A] p-4 sm:p-6 shadow-sm w-full min-w-0">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">خيارات السكن المتاحة</h2>
            <div className="space-y-3 w-full min-w-0">
              {activeListings.map((l) => (
                <label
                  key={l.id}
                  className={`block rounded-2xl border p-3.5 sm:p-4 cursor-pointer transition w-full min-w-0 ${
                    selectedListing === l.id
                      ? 'border-amber-400 bg-amber-500/10 dark:border-amber-400'
                      : 'border-slate-200 dark:border-[#1E2B4A] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 w-full min-w-0">
                    <input
                      type="radio"
                      name="listing"
                      checked={selectedListing === l.id}
                      onChange={() => setSelectedListing(l.id)}
                      className="mt-1 accent-amber-500 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{listingTypeLabel(l.listing_type)}</span>
                        <span className="font-black text-amber-500 text-sm whitespace-nowrap">{formatPrice(l.price)}{l.listing_type === 'shared_bed' ? ' / للسرير' : '/شهرياً'}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                        التأمين {formatPrice(l.deposit || 0)} · الحد الأدنى {l.minimum_months || 1} أشهر
                      </p>
                    </div>
                  </div>
                </label>
              ))}
              {!activeListings.length && <p className="text-sm text-slate-500 dark:text-slate-400">لا توجد عروض مخصصة حالياً.</p>}
            </div>

            {isOwnerOrBroker ? (
              <div className="mt-5 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-800 dark:text-amber-300 text-sm">
                <p className="font-bold text-center">تنبيه للمالك والوسيط</p>
                <p className="mt-1 text-xs text-center opacity-90">
                  عند تأجير الشقة عن طريق المنصة، تفرض المنصة رسوم خدمة مقدارها <strong>200 جنيه مصري</strong> فقط.
                </p>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowBook(true)}
                  disabled={!activeListings.length}
                  className="mt-5 w-full py-3.5 rounded-xl bg-[#FCB431] hover:bg-[#EAA01C] text-[#000616] font-black text-sm transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4.5 h-4.5" /> طلب حجز الشقة · 200 ج.م
                </button>
                <p className="text-xs text-slate-400 text-center mt-2">رسوم الحجز 200 جنيه لضمان جدية الطلب</p>
              </>
            )}
          </div>

          {broker && (() => {
            const isBrokerOwner = broker.profiles?.role === 'owner' || (broker.bio || '').includes('مالك') || (broker.company_name || '').includes('مالك');
            return (
              <div className="bg-white dark:bg-[#111A30] rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-[#1E2B4A] p-4 sm:p-6 shadow-sm w-full min-w-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg font-black shrink-0">
                    {(broker.profiles?.first_name?.[0] || (isBrokerOwner ? 'O' : 'B')).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-slate-900 dark:text-white truncate">
                        {broker.profiles?.first_name} {broker.profiles?.last_name}
                      </h3>
                      {broker.verified_badge && <BadgeCheck className="w-4 h-4 text-amber-500 shrink-0" />}
                    </div>

                    <div className="mt-1">
                      {isBrokerOwner ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                          🏠 مالك عقار مباشر
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                          💼 سمسار عقاري معتمد
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-1.5 text-center text-xs">
                  <div className="rounded-xl bg-slate-50 dark:bg-[#0A1020] p-2">
                    <p className="font-black text-slate-900 dark:text-white">{broker.rating || 5}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">التقييم</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-[#0A1020] p-2">
                    <p className="font-black text-slate-900 dark:text-white">{broker.review_count || 0}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">التقييمات</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-[#0A1020] p-2">
                    <p className="font-bold text-slate-900 dark:text-white text-[11px] truncate">{broker.response_time || '1 ساعة'}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">الرد</p>
                  </div>
                </div>

                <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {broker.bio || (isBrokerOwner ? 'مالك عقارات مخصص للتأجير المباشر بدون وسيط.' : 'وسيط عقاري معتمد في المنصة.')}
                </p>

                <Link
                  to={`/b/${broker.slug}`}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-black text-amber-500 hover:text-amber-600 transition"
                >
                  <span>{isBrokerOwner ? 'عرض ملف المالك المباشر' : 'عرض ملف الوسيط العقاري'} ←</span>
                </Link>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Visit Booking Modal */}
      {showBook && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBook(false)} />
          <div className="relative bg-white dark:bg-[#111A30] w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-[#1E2B4A] max-h-[90vh] overflow-y-auto z-10 text-slate-900 dark:text-white">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">طلب حجز المعاينة</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">اختر التاريخ والوقت المناسبين للمعاينة.</p>

            <div className="mt-5 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">التاريخ</label>
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
                <label className="text-xs font-semibold text-slate-500 uppercase">الوقت المفضل</label>
                <select
                  value={visitTime}
                  onChange={(e) => setVisitTime(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200"
                >
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {isSelectedListingSharedBed && (
                <div className="p-3.5 bg-brand-50/40 dark:bg-brand-950/10 rounded-xl border border-brand-100 dark:border-brand-900 space-y-3">
                  <p className="text-xs font-bold text-brand-900 dark:text-brand-400">اختر الغرفة وعدد الأسرة المطلوبة</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(property?.rooms || []).map((room) => {
                      const available = room.beds ? room.beds.filter((b: any) => b.status === 'available').length : 0;
                      const isSelected = selectedBeds[room.id] !== undefined;

                      return (
                        <div key={room.id} className="flex flex-col gap-2 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-800 dark:text-slate-200">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={available === 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBeds((prev) => ({ ...prev, [room.id]: 1 }));
                                } else {
                                  setSelectedBeds((prev) => {
                                    const next = { ...prev };
                                    delete next[room.id];
                                    return next;
                                  });
                                }
                              }}
                              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                            />
                            <span>{room.name}</span>
                            <span className="text-xs font-normal text-slate-500">({available} سرير متاح)</span>
                          </label>
                          {isSelected && (
                            <div className="flex items-center gap-2 ps-6">
                              <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">الأسرة المطلوبة:</label>
                              <select
                                value={selectedBeds[room.id] || 1}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setSelectedBeds((prev) => ({ ...prev, [room.id]: val }));
                                }}
                                className="px-2 py-1 text-xs rounded border border-slate-200 bg-white dark:bg-slate-700 dark:text-white"
                              >
                                {Array.from({ length: available }, (_, i) => (
                                  <option key={i + 1} value={i + 1}>
                                    {i + 1} سرير
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rent Duration Inputs */}
              <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-100 space-y-2">
                <p className="text-xs font-bold text-brand-900">فترة الإيجار المطلوبة (اختياري)</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-600">تاريخ بدء الإيجار</label>
                    <input
                      type="date"
                      value={rentStartDate}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setRentStartDate(e.target.value)}
                      className="mt-0.5 w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600">تاريخ نهاية الإيجار</label>
                    <input
                      type="date"
                      value={rentEndDate}
                      min={rentStartDate || new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setRentEndDate(e.target.value)}
                      className="mt-0.5 w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Broker Referral Option */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={viaBroker}
                    onChange={(e) => setViaBroker(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600"
                  />
                  هل أنت قادم عن طريق سمسار عقاري؟
                </label>

                {viaBroker && (
                  <div className="space-y-2 pt-2">
                    <div>
                      <label className="text-xs text-slate-600">اسم السمسار</label>
                      <input
                        type="text"
                        value={referralBrokerName}
                        onChange={(e) => setReferralBrokerName(e.target.value)}
                        placeholder="اسم السمسار العقاري"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">رقم هاتف السمسار</label>
                      <input
                        type="tel"
                        value={referralBrokerPhone}
                        onChange={(e) => setReferralBrokerPhone(e.target.value)}
                        placeholder="01xxxxxxxxx"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">ملاحظات إضافية</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="أي تفاصيل أو رغبات خاصة؟"
                  className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 resize-none"
                />
              </div>

              <div className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 flex justify-between">
                <span>رسوم الحجز والمعاينة</span>
                <span className="font-semibold text-brand-700">200 ج.م</span>
              </div>
              {isSelectedListingSharedBed && selectedListingObj && (
                <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-950 flex justify-between font-medium">
                  <span>الإيجار الشهري الإجمالي (لعدد {totalBedsBooked} سرير)</span>
                  <span className="font-bold text-emerald-700">{formatPrice(selectedListingObj.price * totalBedsBooked)}/شهرياً</span>
                </div>
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={() => setShowBook(false)} className="py-3 rounded-xl border border-slate-200 font-semibold">إلغاء</button>
              <button
                onClick={bookVisit}
                disabled={booking}
                className="py-3 rounded-xl bg-brand-600 text-white font-semibold disabled:opacity-60"
              >
                {booking ? 'جاري الحجز…' : 'تأكيد الحجز'}
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
    <div className="rounded-2xl bg-slate-50 dark:bg-[#0A1020] border border-slate-100 dark:border-[#1E2B4A] p-3 sm:p-3.5 transition-all">
      <Icon className="w-4 h-4 text-amber-500 mb-1.5" />
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      <p className="font-black text-slate-900 dark:text-white capitalize text-xs sm:text-sm mt-0.5">{value}</p>
    </div>
  );
}
