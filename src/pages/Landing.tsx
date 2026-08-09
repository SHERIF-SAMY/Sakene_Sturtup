import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, ShieldCheck, CalendarCheck, QrCode, ArrowRight,
  GraduationCap, Star, MapPin, Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiGet } from '../lib/api';
import ApartmentCard, { type PropertyCardData } from '../components/ApartmentCard';
import LoadingSpinner from '../components/LoadingSpinner';

type Uni = { id: number; name: string; cities?: { name: string } | null };

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const [uniId, setUniId] = useState('');
  const [unis, setUnis] = useState<Uni[]>([]);
  const [featured, setFeatured] = useState<PropertyCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiGet<Uni[]>('/api/universities'),
      apiGet<PropertyCardData[]>('/api/properties?featured=true&status=active'),
    ])
      .then(([u, p]) => {
        setUnis(u);
        setFeatured(p.slice(0, 6));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (uniId) params.set('university_id', uniId);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-blue-500 text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,white,transparent_40%),radial-gradient(circle_at_80%_0%,#93c5fd,transparent_35%)]" />
        <div className="relative max-w-7xl mx-auto px-4 pt-14 pb-20 md:pt-20 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-sm font-medium mb-5">
              <Sparkles className="w-4 h-4" /> {t('landing.badge')}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
              {t('landing.hero_title')}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-blue-100 max-w-2xl">
              {t('landing.hero_subtitle')}
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={search}
            className="mt-8 bg-white rounded-2xl p-2 md:p-3 shadow-2xl shadow-brand-900/20 grid md:grid-cols-[1fr_1fr_auto] gap-2"
          >
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('landing.search_placeholder')}
                className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50">
              <GraduationCap className="w-5 h-5 text-slate-400 shrink-0" />
              <select
                value={uniId}
                onChange={(e) => setUniId(e.target.value)}
                className="w-full bg-transparent outline-none text-slate-800"
              >
                <option value="">{t('landing.all_universities')}</option>
                {unis.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center justify-center gap-2"
            >
              {t('landing.search_btn')} <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-blue-100">
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> {t('landing.feat_1')}</span>
            <span className="flex items-center gap-2"><CalendarCheck className="w-4 h-4" /> {t('landing.feat_2')}</span>
            <span className="flex items-center gap-2"><QrCode className="w-4 h-4" /> {t('landing.feat_3')}</span>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: GraduationCap, title: t('landing.usp_1_title'), desc: t('landing.usp_1_desc') },
            { icon: ShieldCheck, title: t('landing.usp_2_title'), desc: t('landing.usp_2_desc') },
            { icon: CalendarCheck, title: t('landing.usp_3_title'), desc: t('landing.usp_3_desc') },
            { icon: MapPin, title: t('landing.usp_4_title'), desc: t('landing.usp_4_desc') },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900">{f.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{t('landing.popular_unis')}</h2>
            <p className="text-slate-500 mt-1">{t('landing.popular_unis_subtitle')}</p>
          </div>
          <Link to="/search" className="text-sm font-semibold text-brand-600 hover:text-brand-700">{t('landing.view_all')}</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {unis.slice(0, 6).map((u) => (
            <Link
              key={u.id}
              to={`/search?university_id=${u.id}`}
              className="bg-white border border-slate-100 rounded-2xl p-4 hover:border-brand-200 hover:shadow-sm transition text-center"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-brand-500 to-blue-400 text-white flex items-center justify-center font-bold mb-3">
                {u.name.slice(0, 2).toUpperCase()}
              </div>
              <p className="font-semibold text-sm text-slate-800 line-clamp-2">{u.name}</p>
              <p className="text-xs text-slate-400 mt-1">{u.cities?.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 border-y border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{t('landing.featured_apartments')}</h2>
              <p className="text-slate-500 mt-1">{t('landing.featured_apartments_subtitle')}</p>
            </div>
            <Link to="/search" className="text-sm font-semibold text-brand-600">{t('landing.see_more')}</Link>
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((p) => (
                <ApartmentCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-10">{t('landing.how_it_works')}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', title: t('landing.step_1_title'), desc: t('landing.step_1_desc') },
            { step: '02', title: t('landing.step_2_title'), desc: t('landing.step_2_desc') },
            { step: '03', title: t('landing.step_3_title'), desc: t('landing.step_3_desc') },
          ].map((s) => (
            <div key={s.step} className="rounded-3xl border border-slate-100 bg-white p-6 relative overflow-hidden">
              <span className="text-5xl font-black text-brand-50 absolute -top-1 right-4">{s.step}</span>
              <h3 className="text-lg font-bold text-slate-900 relative">{s.title}</h3>
              <p className="mt-2 text-slate-500 relative">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="rounded-3xl bg-slate-900 text-white p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">{t('landing.testimonials_title')}</h2>
            <p className="mt-3 text-slate-300">{t('landing.testimonials_subtitle')}</p>
            <div className="mt-6 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Nour A.', text: 'Booked three visits in one evening and signed a room near GUC the next week.' },
              { name: 'Omar H.', text: 'The verified broker badge made me feel safe. Photos matched reality.' },
            ].map((t) => (
              <div key={t.name} className="bg-white/10 rounded-2xl p-4">
                <p className="text-slate-100">"{t.text}"</p>
                <p className="mt-2 text-sm font-semibold text-brand-200">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
