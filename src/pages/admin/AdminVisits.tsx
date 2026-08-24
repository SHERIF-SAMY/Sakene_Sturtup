import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Phone, MessageCircle, CheckCircle, XCircle, User, Home, Briefcase } from 'lucide-react';
import { apiGet, apiSend, formatPrice } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const PAYMENT_NUMBER = '01016024660';

type Visit = {
  id: number;
  visit_date: string;
  visit_time: string;
  rent_start_date?: string;
  rent_end_date?: string;
  status: string;
  booking_fee: number;
  notes?: string;
  via_broker?: boolean;
  referral_broker_name?: string;
  referral_broker_phone?: string;
  student?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  owner?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    is_broker_account?: boolean;
  };
  listings?: {
    listing_type: string;
    price: number;
    properties?: {
      id: number;
      title: string;
      district: string;
      address?: string;
      property_number?: number;
      property_images?: { image_url: string; is_cover?: boolean }[];
    };
  };
  beds_booked?: number;
  room?: {
    id: number;
    name: string;
  };
  booked_rooms?: string;
};

const statusColor: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  confirmed: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  completed: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  cancelled: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  no_show: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

const statusAr: Record<string, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  no_show: 'لم يحضر',
};

function formatRentPeriod(visit: Visit): string {
  if (visit.rent_start_date && visit.rent_end_date) {
    return `من ${visit.rent_start_date} إلى ${visit.rent_end_date}`;
  }
  if (visit.rent_start_date) {
    return `بدءاً من ${visit.rent_start_date}`;
  }
  return '';
}

function formatWaPhone(rawPhone?: string): string {
  if (!rawPhone) return '';
  let cleaned = rawPhone.replace(/[^0-9]/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('20')) return cleaned;
  if (cleaned.startsWith('0')) return '2' + cleaned;
  if (cleaned.startsWith('1')) return '20' + cleaned;
  return '20' + cleaned;
}

function buildTenantWhatsApp(visit: Visit): string {
  const prop = visit.listings?.properties;
  const propTitle = prop?.title || 'العقار';
  const propNum = prop?.property_number ? ` (شقة رقم ${prop.property_number})` : '';
  const propAddr = prop?.district || prop?.address || '';
  const tenantName = visit.student ? `${visit.student.first_name} ${visit.student.last_name}`.trim() : '';
  const price = visit.listings?.price ? formatPrice(visit.listings.price) : '';
  const rentPeriodStr = formatRentPeriod(visit);

  const msg = `مرحباً ${tenantName}

تم قبول طلب حجز شقتك (رقم #${visit.id}) عبر منصة Agarly.

تفاصيل الشقة:
• الشقة: ${propTitle}${propNum}
• العنوان: ${propAddr}
• موعد المعاينة: ${visit.visit_date} الساعة ${visit.visit_time}
${rentPeriodStr ? `• فترة الإيجار المطلوبة: ${rentPeriodStr}\n` : ''}${price ? `• الإيجار الشهري: ${price}\n` : ''}
سيتم التواصل معك والتنسيق للمعاينة والربط مع المالك.

شكراً لاختيارك منصة Agarly`;

  const phone = formatWaPhone(visit.student?.phone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

function buildOwnerWhatsApp(visit: Visit): string {
  const prop = visit.listings?.properties;
  const propTitle = prop?.title || 'العقار';
  const propNum = prop?.property_number ? ` (شقة رقم ${prop.property_number})` : '';
  const ownerName = visit.owner ? `${visit.owner.first_name} ${visit.owner.last_name}`.trim() : '';
  const rentPeriodStr = formatRentPeriod(visit);

  const msg = `مرحباً ${ownerName}

يوجد شخص مهتم بشقتك "${propTitle}"${propNum} (طلب رقم #${visit.id}) عبر منصة Agarly.

التفاصيل:
• موعد المعاينة المطلوب: ${visit.visit_date} الساعة ${visit.visit_time}
${rentPeriodStr ? `• فترة الإيجار المطلوبة: ${rentPeriodStr}\n` : ''}
سيتم التنسيق معك والربط بينك وبين المستأجر لمتابعة المعاينة.

شكراً لثقتك في منصة Agarly`;

  const phone = formatWaPhone(visit.owner?.phone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

function buildBrokerOwnerInitialWhatsApp(visit: Visit): string {
  const prop = visit.listings?.properties;
  const propTitle = prop?.title || 'العقار';
  const propNum = prop?.property_number ? ` (شقة رقم ${prop.property_number})` : '';
  const brokerName = visit.owner ? `${visit.owner.first_name} ${visit.owner.last_name}`.trim() : 'السمسار';
  const rentPeriodStr = formatRentPeriod(visit);

  const msg = `مرحباً ${brokerName}

يوجد طلب حجز لشقتك "${propTitle}"${propNum} (طلب رقم #${visit.id}) عبر منصة Agarly.

التفاصيل:
• موعد المعاينة المطلوب: ${visit.visit_date} الساعة ${visit.visit_time}
${rentPeriodStr ? `• فترة الإيجار المطلوبة: ${rentPeriodStr}\n` : ''}
سيتم التنسيق معك والربط بينك وبين المستأجر لمتابعة المعاينة.

شكراً لتعاونك مع منصة Agarly`;

  const phone = formatWaPhone(visit.owner?.phone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

function buildBrokerOwnerConfirmedWhatsApp(visit: Visit): string {
  const prop = visit.listings?.properties;
  const propTitle = prop?.title || 'العقار';
  const propNum = prop?.property_number ? ` (شقة رقم ${prop.property_number})` : '';
  const brokerName = visit.owner ? `${visit.owner.first_name} ${visit.owner.last_name}`.trim() : 'السمسار';
  const tenantName = visit.student ? `${visit.student.first_name} ${visit.student.last_name}`.trim() : 'المستأجر';
  const tenantPhone = visit.student?.phone || 'غير متوفر';
  const rentPeriodStr = formatRentPeriod(visit);

  const msg = `مرحباً ${brokerName}

تم تأكيد الحجز. إليك بيانات المستأجر للتواصل المباشر والربط بينكما:

بيانات المستأجر:
• الاسم: ${tenantName}
• رقم الهاتف: ${tenantPhone}

بيانات الشقة والمعاينة:
• الشقة: ${propTitle}${propNum}
• الموعد المحدد: ${visit.visit_date} الساعة ${visit.visit_time}
${rentPeriodStr ? `• فترة الإيجار المطلوبة: ${rentPeriodStr}\n` : ''}
نتمنى لك التوفيق مع منصة Agarly`;

  const phone = formatWaPhone(visit.owner?.phone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

function buildBrokerWhatsApp(visit: Visit): string {
  const prop = visit.listings?.properties;
  const propTitle = prop?.title || 'العقار';
  const propNum = prop?.property_number ? ` (شقة رقم ${prop.property_number})` : '';
  const brokerName = visit.referral_broker_name || 'الوسيط العقاري';
  const tenantName = visit.student ? `${visit.student.first_name} ${visit.student.last_name}`.trim() : 'المستأجر';
  const tenantPhone = visit.student?.phone || 'غير متوفر';
  const rentPeriodStr = formatRentPeriod(visit);

  const msg = `مرحباً أستاذ ${brokerName}

إليك تفاصيل المستأجر المحال من طرفكم لطلب رقم #${visit.id} على منصة Agarly:

بيانات المستأجر:
• اسم المستأجر: ${tenantName}
• رقم هاتف المستأجر: ${tenantPhone}
• الشقة المطلوب معاينتها: ${propTitle}${propNum}
• موعد المعاينة: ${visit.visit_date} الساعة ${visit.visit_time}
${rentPeriodStr ? `• فترة الإيجار المطلوبة: ${rentPeriodStr}\n` : ''}
شكراً لتعاونكم مع منصة Agarly`;

  const phone = formatWaPhone(visit.referral_broker_phone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

function buildShareOwnerInfoToTenant(visit: Visit): string {
  const prop = visit.listings?.properties;
  const propTitle = prop?.title || 'العقار';
  const propNum = prop?.property_number ? ` (شقة رقم ${prop.property_number})` : '';
  const propAddr = prop?.district || prop?.address || '';
  const tenantName = visit.student ? `${visit.student.first_name} ${visit.student.last_name}`.trim() : 'المستأجر';
  const ownerName = visit.owner ? `${visit.owner.first_name} ${visit.owner.last_name}`.trim() : 'المالك';
  const ownerPhone = visit.owner?.phone || 'غير متوفر';
  const rentPeriodStr = formatRentPeriod(visit);

  const msg = `مرحباً ${tenantName}

تم تأكيد حجزك بنجاح. إليك بيانات مالك الشقة للتواصل المباشر والربط بينكما:

بيانات المالك:
• الاسم: ${ownerName}
• رقم الهاتف: ${ownerPhone}

بيانات الشقة والمعاينة:
• الشقة: ${propTitle}${propNum}
• العنوان: ${propAddr}
• الموعد: ${visit.visit_date} الساعة ${visit.visit_time}
${rentPeriodStr ? `• فترة الإيجار المطلوبة: ${rentPeriodStr}\n` : ''}
نتمنى لك التوفيق مع منصة Agarly`;

  const phone = formatWaPhone(visit.student?.phone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

function buildShareTenantInfoToOwner(visit: Visit): string {
  const prop = visit.listings?.properties;
  const propTitle = prop?.title || 'العقار';
  const propNum = prop?.property_number ? ` (شقة رقم ${prop.property_number})` : '';
  const ownerName = visit.owner ? `${visit.owner.first_name} ${visit.owner.last_name}`.trim() : 'المالك';
  const tenantName = visit.student ? `${visit.student.first_name} ${visit.student.last_name}`.trim() : 'المستأجر';
  const tenantPhone = visit.student?.phone || 'غير متوفر';
  const rentPeriodStr = formatRentPeriod(visit);

  const msg = `مرحباً ${ownerName}

تم تأكيد الحجز بنجاح. إليك بيانات المستأجر للتواصل المباشر والربط بينكما:

بيانات المستأجر:
• الاسم: ${tenantName}
• رقم الهاتف: ${tenantPhone}

بيانات الشقة والمعاينة:
• الشقة: ${propTitle}${propNum}
• الموعد المحدد: ${visit.visit_date} الساعة ${visit.visit_time}
${rentPeriodStr ? `• فترة الإيجار المطلوبة: ${rentPeriodStr}\n` : ''}
نتمنى لك التوفيق مع منصة Agarly`;

  const phone = formatWaPhone(visit.owner?.phone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

export default function AdminVisits() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('pending');
  const [search, setSearch] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    apiGet<Visit[]>('/api/visits?admin=true')
      .then(setVisits)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: number, status: string) => {
    try {
      await apiSend('/api/visits', 'PUT', { id, status });
      load();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء تحديث حالة الطلب');
    }
  };

  const filtered = visits.filter((v) => {
    if (tab !== 'all' && v.status !== tab) return false;
    if (search) {
      const s = search.toLowerCase().trim();
      const visitIdStr = String(v.id);
      const tenantName = `${v.student?.first_name || ''} ${v.student?.last_name || ''}`.toLowerCase();
      const propTitle = (v.listings?.properties?.title || '').toLowerCase();
      const propNumStr = String(v.listings?.properties?.property_number || '');
      const tenantPhone = (v.student?.phone || '').toLowerCase();
      const ownerPhone = (v.owner?.phone || '').toLowerCase();
      const referralBrokerName = (v.referral_broker_name || '').toLowerCase();
      const referralBrokerPhone = (v.referral_broker_phone || '').toLowerCase();

      const matchId = s.replace('#', '') === visitIdStr;
      const matchText =
        tenantName.includes(s) ||
        propTitle.includes(s) ||
        tenantPhone.includes(s) ||
        ownerPhone.includes(s) ||
        propNumStr.includes(s) ||
        referralBrokerName.includes(s) ||
        referralBrokerPhone.includes(s);

      if (!matchId && !matchText) return false;
    }
    return true;
  });

  const counts = {
    all: visits.length,
    pending: visits.filter((v) => v.status === 'pending').length,
    confirmed: visits.filter((v) => v.status === 'confirmed').length,
    completed: visits.filter((v) => v.status === 'completed').length,
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-[#1E2B4A] pb-2 overflow-x-auto scrollbar-none">
        {(['pending', 'confirmed', 'completed', 'all'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg whitespace-nowrap transition ${
              tab === t
                ? 'text-amber-500 dark:text-amber-400 border-b-2 border-amber-500 font-bold bg-amber-500/10'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#111A30]'
            }`}
          >
            {t === 'all' ? 'الكل' : t === 'pending' ? 'قيد الانتظار' : t === 'confirmed' ? 'مؤكدة' : 'مكتملة'} ({counts[t]})
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="ابحث برقم الطلب (#)، اسم المستأجر/المالك، رقم الهاتف، أو رقم الشقة..."
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-white dark:bg-[#111A30] text-slate-900 dark:text-white placeholder:text-slate-400 text-sm outline-none focus:border-amber-500 shadow-sm"
      />

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <p className="text-center text-slate-400 dark:text-slate-500 py-12 text-sm">لا توجد حجوزات مطابقة.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((v) => {
            const prop = v.listings?.properties;
            const img =
              prop?.property_images?.find((i) => i.is_cover)?.image_url ||
              prop?.property_images?.[0]?.image_url ||
              'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80';

            const isBrokerOwner = !!v.owner?.is_broker_account;
            const tenantWaLink = buildTenantWhatsApp(v);
            const ownerWaLink = isBrokerOwner ? buildBrokerOwnerInitialWhatsApp(v) : buildOwnerWhatsApp(v);
            const brokerWaLink = buildBrokerWhatsApp(v);
            const shareOwnerToTenantLink = buildShareOwnerInfoToTenant(v);
            const shareTenantToOwnerLink = isBrokerOwner ? buildBrokerOwnerConfirmedWhatsApp(v) : buildShareTenantInfoToOwner(v);

            return (
              <div key={v.id} className="bg-white dark:bg-[#111A30] rounded-2xl border border-slate-100 dark:border-[#1E2B4A] overflow-hidden shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-[#0A1020] border-b border-slate-100 dark:border-[#1E2B4A]">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${statusColor[v.status] || statusColor.pending}`}>
                      {statusAr[v.status] || v.status}
                    </span>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      رقم الطلب: #{v.id}
                    </span>
                    {prop?.property_number && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        شقة رقم #{prop.property_number}
                      </span>
                    )}
                    {isBrokerOwner && (
                      <span className="text-xs text-purple-600 dark:text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        🏠 شقة سمسار
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {v.visit_date}
                    <Clock className="w-3.5 h-3.5 ml-2" />
                    {v.visit_time}
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid md:grid-cols-[auto_1fr_1fr] gap-5">
                    {/* Property Image */}
                    <Link to={prop ? `/properties/${prop.id}` : '#'}>
                      <img src={img} alt="" className="w-32 h-28 rounded-xl object-cover" />
                    </Link>

                    {/* Property Info */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase mb-1">العقار</p>
                      <Link to={prop ? `/properties/${prop.id}` : '#'} className="font-bold text-slate-900 dark:text-white hover:text-amber-500 text-sm">
                        {prop?.title || '—'}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {prop?.district || prop?.address || '—'}
                      </p>
                      {v.listings?.price && (
                        <p className="text-sm font-black text-amber-500 mt-1">
                          {formatPrice(v.listings.price)}{v.listings.listing_type === 'shared_bed' ? '/سرير/شهر' : '/شهر'}
                        </p>
                      )}
                      {v.listings?.listing_type === 'shared_bed' && (
                        <div className="mt-1.5 p-2 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-lg text-xs text-indigo-900 dark:text-indigo-300 font-medium">
                          🛌 تفاصيل حجز الأسرة:
                          <div className="font-bold text-indigo-950 dark:text-indigo-200 mt-0.5 space-y-0.5">
                            {(() => {
                              if (v.booked_rooms) {
                                try {
                                  const items = JSON.parse(v.booked_rooms);
                                  return items.map((item: any, i: number) => (
                                    <div key={i}>
                                      • {item.room_name || `غرفة ${item.room_id}`}: {item.beds_booked} سرير
                                    </div>
                                  ));
                                } catch (e) {
                                  console.error(e);
                                }
                              }
                              return (
                                <div>
                                  • {v.room?.name || 'الغرفة المختارة'}: {v.beds_booked || 1} سرير
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                      {(v.rent_start_date || v.rent_end_date) && (
                        <div className="mt-1.5 p-2 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-lg text-xs text-blue-900 dark:text-blue-300 font-medium">
                          🗓️ فترة الإيجار المطلوبة:
                          <div className="font-bold text-blue-950 dark:text-blue-200 mt-0.5">
                            {v.rent_start_date ? `من ${v.rent_start_date}` : ''} {v.rent_end_date ? `إلى ${v.rent_end_date}` : ''}
                          </div>
                        </div>
                      )}

                    </div>

                    {/* People Info */}
                    <div className="space-y-3">
                      {/* Tenant */}
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">المستأجر</p>
                          {v.student ? (
                            <>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{v.student.first_name} {v.student.last_name}</p>
                              {v.student.phone && (
                                <a href={`tel:${v.student.phone}`} className="text-xs text-amber-500 font-bold flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3" />{v.student.phone}
                                </a>
                              )}
                              {v.student.email && <p className="text-xs text-slate-400 dark:text-slate-500">{v.student.email}</p>}
                            </>
                          ) : <p className="text-xs text-slate-400 dark:text-slate-500">—</p>}
                        </div>
                      </div>

                      {/* Owner */}
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <Home className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            {isBrokerOwner ? 'السمسار المالك' : 'المالك'}
                            {isBrokerOwner && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                سمسار
                              </span>
                            )}
                          </p>
                          {v.owner ? (
                            <>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{v.owner.first_name} {v.owner.last_name}</p>
                              {v.owner.phone && (
                                <a href={`tel:${v.owner.phone}`} className="text-xs text-emerald-500 font-bold flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3" />{v.owner.phone}
                                </a>
                              )}
                              {v.owner.email && <p className="text-xs text-slate-400 dark:text-slate-500">{v.owner.email}</p>}
                            </>
                          ) : <p className="text-xs text-slate-400 dark:text-slate-500">—</p>}
                        </div>
                      </div>

                      {/* Broker Referral Info */}
                      {v.via_broker && (
                        <div className="flex items-start gap-2 p-2 bg-purple-50/50 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/50">
                          <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                            <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-purple-900 dark:text-purple-300">طرف سمسار عقاري</p>
                            <p className="text-xs font-semibold text-purple-800 dark:text-purple-400">{v.referral_broker_name || 'غير محدد'}</p>
                            {v.referral_broker_phone && (
                              <a href={`tel:${v.referral_broker_phone}`} className="text-xs text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3" />{v.referral_broker_phone}
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-[#1E2B4A]">
                    {/* WhatsApp Buttons */}
                    <a
                      href={tenantWaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      واتساب المستأجر
                    </a>
                    <a
                      href={ownerWaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                        isBrokerOwner
                          ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      {isBrokerOwner ? 'واتساب السمسار' : 'واتساب المالك'}
                    </a>

                    {v.via_broker && v.referral_broker_phone && (
                      <a
                        href={brokerWaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 text-xs font-bold transition"
                      >
                        <MessageCircle className="w-4 h-4" />
                        واتساب السمسار المحيل
                      </a>
                    )}

                    {/* Status Actions */}
                    {v.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(v.id, 'confirmed')}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FCB431] hover:bg-[#EAA01C] text-[#000616] text-xs font-black transition shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          قبول الطلب (تحويل إلى مؤكد)
                        </button>
                        <button
                          onClick={() => updateStatus(v.id, 'cancelled')}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800 text-xs font-bold transition"
                        >
                          <XCircle className="w-4 h-4" />
                          رفض
                        </button>
                        <button
                          onClick={() => updateStatus(v.id, 'no_show')}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#0A1020] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#1E2B4A] border border-slate-200 dark:border-[#1E2B4A] text-xs font-bold transition"
                        >
                          <XCircle className="w-4 h-4 text-slate-400" />
                          لم يحضر
                        </button>
                      </>
                    )}

                    {v.status === 'confirmed' && (
                      <>
                        <a
                          href={shareOwnerToTenantLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition shadow-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          إرسال بيانات المالك للمستأجر
                        </a>
                        <a
                          href={shareTenantToOwnerLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-bold transition shadow-sm ${
                            isBrokerOwner ? 'bg-purple-600 hover:bg-purple-700' : 'bg-teal-600 hover:bg-teal-700'
                          }`}
                        >
                          <MessageCircle className="w-4 h-4" />
                          {isBrokerOwner ? 'إرسال بيانات المستأجر للسمسار' : 'إرسال بيانات المستأجر للمالك'}
                        </a>
                        <button
                          onClick={() => updateStatus(v.id, 'completed')}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                        >
                          <CheckCircle className="w-4 h-4" />
                          تم التأجير (إكمال)
                        </button>
                        <button
                          onClick={() => updateStatus(v.id, 'no_show')}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#0A1020] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#1E2B4A] border border-slate-200 dark:border-[#1E2B4A] text-xs font-bold transition"
                        >
                          <XCircle className="w-4 h-4 text-slate-400" />
                          لم يحضر / إلغاء
                        </button>
                      </>
                    )}

                    {v.notes && (
                      <p className="w-full text-xs text-slate-600 dark:text-slate-300 mt-1 bg-slate-50 dark:bg-[#0A1020] border border-slate-100 dark:border-[#1E2B4A] rounded-lg px-3 py-2">
                        <span className="font-bold text-slate-900 dark:text-white">ملاحظات:</span> {v.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
