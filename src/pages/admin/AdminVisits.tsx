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
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-brand-50 text-brand-700 border-brand-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
  no_show: 'bg-red-50 text-red-700 border-red-200',
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

function buildTenantWhatsApp(visit: Visit): string {
  const prop = visit.listings?.properties;
  const propTitle = prop?.title || 'العقار';
  const propNum = prop?.property_number ? ` (شقة رقم ${prop.property_number})` : '';
  const propAddr = prop?.district || prop?.address || '';
  const tenantName = visit.student ? `${visit.student.first_name} ${visit.student.last_name}`.trim() : '';
  const price = visit.listings?.price ? formatPrice(visit.listings.price) : '';
  const rentPeriodStr = formatRentPeriod(visit);

  const msg = `مرحباً ${tenantName} 👋

✅ تم قبول طلب معاينتك (رقم #${visit.id}) عبر منصة Agarly!

🏠 تفاصيل الشقة:
• الشقة: ${propTitle}${propNum}
• العنوان: ${propAddr}
• موعد المعاينة: ${visit.visit_date} الساعة ${visit.visit_time}
${rentPeriodStr ? `• فترة الإيجار المطلوبة: ${rentPeriodStr}\n` : ''}${price ? `• الإيجار الشهري: ${price}\n` : ''}
💳 لإتمام الإجراءات وتأكيد المعاينة والربط مع المالك، يرجى دفع رسوم الخدمة:
• المبلغ: 200 جنيه مصري
• الدفع عبر فودافون كاش أو إنستا باي على الرقم: ${PAYMENT_NUMBER}
• أرسل صورة الإيصال هنا لتأكيد حجزك ومشاركة بيانات المالك والربط بينكما.

📌 ملاحظة هامة:
في حال لم يتم الاتفاق بعد المعاينة، يحق لك الاستفادة بمعاينة شقة أخرى من المنصة بدون أي رسوم إضافية.

شكراً لاختيارك منصة Agarly 🏡`;

  const phone = visit.student?.phone?.replace(/[^0-9]/g, '').replace(/^0/, '20');
  return `https://wa.me/${phone || ''}?text=${encodeURIComponent(msg)}`;
}

function buildOwnerWhatsApp(visit: Visit): string {
  const prop = visit.listings?.properties;
  const propTitle = prop?.title || 'العقار';
  const propNum = prop?.property_number ? ` (شقة رقم ${prop.property_number})` : '';
  const ownerName = visit.owner ? `${visit.owner.first_name} ${visit.owner.last_name}`.trim() : '';
  const rentPeriodStr = formatRentPeriod(visit);

  const msg = `مرحباً ${ownerName} 👋

🏠 يوجد شخص مهتم بشقتك "${propTitle}"${propNum} (طلب رقم #${visit.id}) عبر منصة Agarly!

📋 التفاصيل:
• موعد المعاينة المطلوب: ${visit.visit_date} الساعة ${visit.visit_time}
${rentPeriodStr ? `• فترة الإيجار المطلوبة: ${rentPeriodStr}\n` : ''}
💳 لإتمام الإجراءات وتزويدك ببيانات المستأجر والربط بينكما، يرجى دفع رسوم خدمة المنصة:
• المبلغ: 200 جنيه مصري
• الدفع عبر فودافون كاش أو إنستا باي على الرقم: ${PAYMENT_NUMBER}
• أرسل صورة الإيصال هنا لتأكيد حجز المعاينة وإرسال تفاصيل المستأجر.

📌 ملاحظة هامة:
في حال لم يتم الاتفاق بعد المعاينة، لا تُستحق أي رسوم إضافية على الصفقة الفاشلة.

شكراً لثقتك في منصة Agarly 🏡`;

  const phone = visit.owner?.phone?.replace(/[^0-9]/g, '').replace(/^0/, '20');
  return `https://wa.me/${phone || ''}?text=${encodeURIComponent(msg)}`;
}

function buildBrokerWhatsApp(visit: Visit): string {
  const prop = visit.listings?.properties;
  const propTitle = prop?.title || 'العقار';
  const propNum = prop?.property_number ? ` (شقة رقم ${prop.property_number})` : '';
  const brokerName = visit.referral_broker_name || 'الوسيط العقاري';
  const tenantName = visit.student ? `${visit.student.first_name} ${visit.student.last_name}`.trim() : 'المستأجر';
  const tenantPhone = visit.student?.phone || 'غير متوفر';
  const rentPeriodStr = formatRentPeriod(visit);

  const msg = `مرحباً أستاذ ${brokerName} 👋

إليك تفاصيل المستأجر المحال من طرفكم لطلب رقم #${visit.id} على منصة Agarly:

📋 بيانات المستأجر:
• اسم المستأجر: ${tenantName}
• رقم هاتف المستأجر: ${tenantPhone}
• الشقة المطلوب معاينتها: ${propTitle}${propNum}
• موعد المعاينة: ${visit.visit_date} الساعة ${visit.visit_time}
${rentPeriodStr ? `• فترة الإيجار المطلوبة: ${rentPeriodStr}\n` : ''}
💳 لإتمام الإجراءات وتأكيد المعاينة والربط مع المالك، يرجى سداد رسوم الخدمة (200 ج):
• الدفع عبر فودافون كاش أو إنستا باي على الرقم: ${PAYMENT_NUMBER}
• أرسل صورة الإيصال هنا لإكمال الربط مع المالك.

📌 ملاحظة هامة:
في حال لم يتم الاتفاق بعد المعاينة، يحق للمستأجر الاستفادة بمعاينة شقة أخرى من المنصة بدون أي رسوم إضافية.

شكراً لتعاونكم مع منصة Agarly 🤝`;

  const phone = visit.referral_broker_phone?.replace(/[^0-9]/g, '').replace(/^0/, '20');
  return `https://wa.me/${phone || ''}?text=${encodeURIComponent(msg)}`;
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

  const msg = `مرحباً ${tenantName} 👋

✅ تم تأكيد حجزك ودفع المستحقات بنجاح! إليك بيانات مالك الشقة للتواصل المباشر والربط بينكما:

📋 بيانات المالك:
• الاسم: ${ownerName}
• رقم الهاتف: ${ownerPhone}

🏠 بيانات الشقة والمعاينة:
• الشقة: ${propTitle}${propNum}
• العنوان: ${propAddr}
• الموعد: ${visit.visit_date} الساعة ${visit.visit_time}
${rentPeriodStr ? `• فترة الإيجار المطلوبة: ${rentPeriodStr}\n` : ''}
📌 ملاحظة هامة:
في حال تم التنسيق ولم يتم الاتفاق بينكما بعد المعاينة، يحق لك الاستفادة بمعاينة شقة أخرى من المنصة بدون أي رسوم إضافية (مجاناً).

نتمنى لك التوفيق مع منصة Agarly 🏡`;

  const phone = visit.student?.phone?.replace(/[^0-9]/g, '').replace(/^0/, '20');
  return `https://wa.me/${phone || ''}?text=${encodeURIComponent(msg)}`;
}

function buildShareTenantInfoToOwner(visit: Visit): string {
  const prop = visit.listings?.properties;
  const propTitle = prop?.title || 'العقار';
  const propNum = prop?.property_number ? ` (شقة رقم ${prop.property_number})` : '';
  const ownerName = visit.owner ? `${visit.owner.first_name} ${visit.owner.last_name}`.trim() : 'المالك';
  const tenantName = visit.student ? `${visit.student.first_name} ${visit.student.last_name}`.trim() : 'المستأجر';
  const tenantPhone = visit.student?.phone || 'غير متوفر';
  const rentPeriodStr = formatRentPeriod(visit);

  const msg = `مرحباً ${ownerName} 👋

✅ تم تأكيد الحجز ودفع المستحقات بنجاح! إليك بيانات المستأجر للتواصل المباشر والربط بينكما:

📋 بيانات المستأجر:
• الاسم: ${tenantName}
• رقم الهاتف: ${tenantPhone}

🏠 بيانات الشقة والمعاينة:
• الشقة: ${propTitle}${propNum}
• الموعد المحدد: ${visit.visit_date} الساعة ${visit.visit_time}
${rentPeriodStr ? `• فترة الإيجار المطلوبة: ${rentPeriodStr}\n` : ''}
📌 ملاحظة هامة:
في حال لم يتم الاتفاق بينكما بعد المعاينة، يمكنك تفعيل الشقة مرة أخرى وتأجيرها لاحقاً، ولن تُستحق أي رسوم إضافية عن هذه الصفقة.

نتمنى لك التوفيق مع منصة Agarly 🏡`;

  const phone = visit.owner?.phone?.replace(/[^0-9]/g, '').replace(/^0/, '20');
  return `https://wa.me/${phone || ''}?text=${encodeURIComponent(msg)}`;
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
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {(['pending', 'confirmed', 'completed', 'all'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg whitespace-nowrap transition ${
              tab === t ? 'text-brand-700 border-b-2 border-brand-600' : 'text-slate-500 hover:bg-slate-50'
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
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-brand-500"
      />

      {loading ? (
        <LoadingSpinner />
      ) : filtered.length === 0 ? (
        <p className="text-center text-slate-400 py-12 text-sm">لا توجد حجوزات مطابقة.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((v) => {
            const prop = v.listings?.properties;
            const img =
              prop?.property_images?.find((i) => i.is_cover)?.image_url ||
              prop?.property_images?.[0]?.image_url ||
              'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80';

            const tenantWaLink = buildTenantWhatsApp(v);
            const ownerWaLink = buildOwnerWhatsApp(v);
            const brokerWaLink = buildBrokerWhatsApp(v);
            const shareOwnerToTenantLink = buildShareOwnerInfoToTenant(v);
            const shareTenantToOwnerLink = buildShareTenantInfoToOwner(v);

            return (
              <div key={v.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${statusColor[v.status] || statusColor.pending}`}>
                      {statusAr[v.status] || v.status}
                    </span>
                    <span className="text-xs text-brand-700 font-bold bg-brand-50 px-2 py-0.5 rounded">
                      رقم الطلب: #{v.id}
                    </span>
                    {prop?.property_number && (
                      <span className="text-xs text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                        شقة رقم #{prop.property_number}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
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
                      <p className="text-xs font-semibold text-slate-400 uppercase mb-1">العقار</p>
                      <Link to={prop ? `/properties/${prop.id}` : '#'} className="font-bold text-slate-900 hover:text-brand-600 text-sm">
                        {prop?.title || '—'}
                      </Link>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {prop?.district || prop?.address || '—'}
                      </p>
                      {v.listings?.price && (
                        <p className="text-sm font-semibold text-brand-700 mt-1">
                          {formatPrice(v.listings.price)}{v.listings.listing_type === 'shared_bed' ? '/سرير/شهر' : '/شهر'}
                        </p>
                      )}
                      {v.listings?.listing_type === 'shared_bed' && (
                        <div className="mt-1.5 p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-900 font-medium">
                          🛌 تفاصيل حجز الأسرة:
                          <div className="font-bold text-indigo-950 mt-0.5 space-y-0.5">
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
                        <div className="mt-1.5 p-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900 font-medium">
                          🗓️ فترة الإيجار المطلوبة:
                          <div className="font-bold text-blue-950 mt-0.5">
                            {v.rent_start_date ? `من ${v.rent_start_date}` : ''} {v.rent_end_date ? `إلى ${v.rent_end_date}` : ''}
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-amber-700 font-semibold mt-1">
                        💳 رسوم الخدمة: {formatPrice(v.booking_fee || 200)} (المستأجر والمالك)
                      </p>
                    </div>

                    {/* People Info */}
                    <div className="space-y-3">
                      {/* Tenant */}
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                          <User className="w-3.5 h-3.5 text-brand-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-400">المستأجر</p>
                          {v.student ? (
                            <>
                              <p className="text-sm font-semibold text-slate-900">{v.student.first_name} {v.student.last_name}</p>
                              {v.student.phone && (
                                <a href={`tel:${v.student.phone}`} className="text-xs text-brand-600 font-bold flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3" />{v.student.phone}
                                </a>
                              )}
                              {v.student.email && <p className="text-xs text-slate-400">{v.student.email}</p>}
                            </>
                          ) : <p className="text-xs text-slate-400">—</p>}
                        </div>
                      </div>

                      {/* Owner */}
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <Home className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-400">المالك</p>
                          {v.owner ? (
                            <>
                              <p className="text-sm font-semibold text-slate-900">{v.owner.first_name} {v.owner.last_name}</p>
                              {v.owner.phone && (
                                <a href={`tel:${v.owner.phone}`} className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3" />{v.owner.phone}
                                </a>
                              )}
                              {v.owner.email && <p className="text-xs text-slate-400">{v.owner.email}</p>}
                            </>
                          ) : <p className="text-xs text-slate-400">—</p>}
                        </div>
                      </div>

                      {/* Broker Referral Info */}
                      {v.via_broker && (
                        <div className="flex items-start gap-2 p-2 bg-purple-50 rounded-xl border border-purple-100">
                          <div className="w-7 h-7 rounded-full bg-purple-200 flex items-center justify-center shrink-0">
                            <Briefcase className="w-3.5 h-3.5 text-purple-700" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-purple-900">طرف سمسار عقاري</p>
                            <p className="text-xs font-semibold text-purple-800">{v.referral_broker_name || 'غير محدد'}</p>
                            {v.referral_broker_phone && (
                              <a href={`tel:${v.referral_broker_phone}`} className="text-xs text-purple-700 font-bold flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3" />{v.referral_broker_phone}
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                    {/* WhatsApp Buttons */}
                    <a
                      href={tenantWaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 border border-green-200 transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      واتساب المستأجر
                    </a>
                    <a
                      href={ownerWaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 border border-emerald-200 transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                      واتساب المالك
                    </a>

                    {v.via_broker && v.referral_broker_phone && (
                      <a
                        href={brokerWaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-100 text-purple-800 text-xs font-semibold hover:bg-purple-200 border border-purple-300 transition"
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
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition"
                        >
                          <CheckCircle className="w-4 h-4" />
                          قبول الطلب (تحويل إلى مؤكد)
                        </button>
                        <button
                          onClick={() => updateStatus(v.id, 'cancelled')}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 border border-red-200 transition"
                        >
                          <XCircle className="w-4 h-4" />
                          رفض
                        </button>
                        <button
                          onClick={() => updateStatus(v.id, 'no_show')}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 border border-slate-200 transition"
                        >
                          <XCircle className="w-4 h-4 text-slate-500" />
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
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          إرسال بيانات المالك للمستأجر
                        </a>
                        <a
                          href={shareTenantToOwnerLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition shadow-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          إرسال بيانات المستأجر للمالك
                        </a>
                        <button
                          onClick={() => updateStatus(v.id, 'completed')}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                        >
                          <CheckCircle className="w-4 h-4" />
                          تم التأجير (إكمال)
                        </button>
                        <button
                          onClick={() => updateStatus(v.id, 'no_show')}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 border border-slate-200 transition"
                        >
                          <XCircle className="w-4 h-4 text-slate-500" />
                          لم يحضر / إلغاء
                        </button>
                      </>
                    )}

                    {v.notes && (
                      <p className="w-full text-xs text-slate-500 mt-1 bg-slate-50 rounded-lg px-3 py-2">
                        <span className="font-semibold">ملاحظات:</span> {v.notes}
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
