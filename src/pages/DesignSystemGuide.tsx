import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Heart, BedDouble, MapPin, Check, Copy, CheckCircle2 } from 'lucide-react';
import Logo, { AgarlyIcon } from '../components/Logo';

export default function DesignSystemGuide() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const colors = [
    { name: 'Warm Amber (Primary Accent)', hex: '#FCB431', text: '#000616', desc: 'Primary CTAs, active states, key highlighting, brand warmth' },
    { name: 'Deep Slate Navy (Primary Structure)', hex: '#2B3143', text: '#FFFFFF', desc: 'Structural cards, badges, dark buttons, secondary accents' },
    { name: 'Midnight Ink (Deep Surface)', hex: '#000616', text: '#FFFFFF', desc: 'Hero background, high-contrast dark surfaces, pure blacks' },
    { name: 'Pure White (Clean Canvas)', hex: '#FFFFFF', text: '#000616', desc: 'Light cards, crisp backgrounds, clean negative space' },
  ];

  const supportingTints = [
    { name: 'Amber Light Tint', hex: '#FFF8EB', text: '#2B3143' },
    { name: 'Amber Soft 100', hex: '#FEF3C7', text: '#2B3143' },
    { name: 'Slate Gray 100', hex: '#E4E8F0', text: '#000616' },
    { name: 'Midnight Dark Card', hex: '#111A30', text: '#FFFFFF' },
    { name: 'Midnight Dark Border', hex: '#1E2B4A', text: '#FFFFFF' },
  ];

  const copyToClipboard = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-[#1E2B4A] pb-8">
        <span className="px-3.5 py-1 rounded-full bg-[#FCB431]/20 text-[#000616] dark:text-[#FCB431] text-xs font-black">
          Agarly Brand & Design System
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mt-3">
          دليل الهوية البصرية ونظام التصميم — أجرلي
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base max-w-2xl font-medium">
          مرجع شامل للألوان، الخطوط، الشعارات والمكونات التفاعلية الخاصة بمنصة أجرلي لتأجير سكن الطلاب.
        </p>
      </div>

      {/* 1. Core Brand Colors */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">1. منظومة الألوان الأساسية (Brand Palette)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">الألوان المستخلصة من دليل الهوية الرسمي</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {colors.map((c) => (
            <div
              key={c.hex}
              onClick={() => copyToClipboard(c.hex)}
              className="group cursor-pointer rounded-3xl overflow-hidden border border-slate-200 dark:border-[#1E2B4A] shadow-sm hover:shadow-xl transition-all"
            >
              <div
                className="h-32 p-4 flex flex-col justify-between"
                style={{ backgroundColor: c.hex, color: c.text }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider">{c.hex}</span>
                  {copiedColor === c.hex ? (
                    <span className="text-[10px] bg-black/30 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> تم النسخ
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition" />
                  )}
                </div>
                <span className="font-bold text-sm">{c.name}</span>
              </div>
              <div className="p-4 bg-white dark:bg-[#111A30]">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Supporting Tints */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {supportingTints.map((t) => (
            <div
              key={t.hex}
              onClick={() => copyToClipboard(t.hex)}
              className="cursor-pointer p-3 rounded-2xl border border-slate-200 dark:border-[#1E2B4A] flex items-center justify-between bg-white dark:bg-[#111A30] hover:border-[#FCB431] transition"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg border border-slate-300 dark:border-slate-700" style={{ backgroundColor: t.hex }} />
                <div>
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{t.name}</p>
                  <p className="text-[10px] text-slate-400">{t.hex}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Logo Variations */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">2. نماذج وتطبيقات الشعار (Logo Variations)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">تطبيقات الشعار على الخلفيات الفاتحة والداكنة والأيقونات</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Light BG full logo */}
          <div className="p-8 rounded-3xl bg-white border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
            <Logo size="lg" showTagline />
            <span className="text-[11px] text-slate-400 font-bold mt-6">الشعار الكامل على خلفية بيضاء</span>
          </div>

          {/* Dark Slate BG logo */}
          <div className="p-8 rounded-3xl bg-[#2B3143] border border-[#3D455C] flex flex-col items-center justify-center text-center shadow-md">
            <Logo variant="white" size="lg" showTagline />
            <span className="text-[11px] text-slate-300 font-bold mt-6">الشعار على خلفية كحلية (#2B3143)</span>
          </div>

          {/* Midnight Dark BG icon only */}
          <div className="p-8 rounded-3xl bg-[#000616] border border-[#1E2B4A] flex flex-col items-center justify-center text-center shadow-lg">
            <div className="flex items-center gap-4">
              <AgarlyIcon size={52} colorScheme="default" />
              <AgarlyIcon size={52} colorScheme="white" />
            </div>
            <span className="text-[11px] text-[#FCB431] font-bold mt-6">أيقونة الشعار الهندسية المنفردة</span>
          </div>
        </div>
      </section>

      {/* 3. Typography Scale */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">3. نظام الخطوط (Typography System — Cairo)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">خط Cairo المعتمد للغة العربية والإنجليزية بكافة الأوزان</p>
        </div>

        <div className="bg-white dark:bg-[#111A30] rounded-3xl border border-slate-200 dark:border-[#1E2B4A] p-6 sm:p-8 space-y-6 divide-y divide-slate-100 dark:divide-[#1E2B4A]">
          <div className="pt-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Display Title (900 Black)</span>
            <p className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
              سكنك أسهل. مستقبلك أريح.
            </p>
          </div>

          <div className="pt-6">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">H1 Heading (800 ExtraBold)</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              ابحث. احجز. استقر مع منصة أجرلي
            </p>
          </div>

          <div className="pt-6">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">H2 Heading (700 Bold)</span>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              شقق وسكن مخصص للطلاب بالقرب من الجامعات
            </p>
          </div>

          <div className="pt-6">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Body Text (500 Medium / 400 Regular)</span>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-3xl">
              أجرلي هي منصة مبتكرة تهدف إلى تسهيل عملية البحث عن السكن المناسب للطلاب المغتربين، وتوفير تجربة موثوقة وشفافة بين جميع الأطراف.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Interactive Components Kit */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">4. المكونات التفاعلية (UI Components Kit)</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">الأزرار، الشارات، البطاقات والحقول المدخلة</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Buttons & Chips */}
          <div className="bg-white dark:bg-[#111A30] rounded-3xl border border-slate-200 dark:border-[#1E2B4A] p-6 space-y-5">
            <h3 className="font-bold text-base text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-[#1E2B4A]">
              الأزرار والشارات (Buttons & Badges)
            </h3>
            
            <div className="flex flex-wrap items-center gap-3">
              <button className="px-5 py-2.5 rounded-xl bg-[#FCB431] hover:bg-[#EAA01C] text-[#000616] font-black text-xs shadow-md transition">
                زر أساسي Primary
              </button>
              <button className="px-5 py-2.5 rounded-xl bg-[#2B3143] hover:bg-[#1E2230] text-white font-bold text-xs shadow-md transition">
                زر ثانوي Secondary
              </button>
              <button className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#0A1020] border border-slate-200 dark:border-[#1E2B4A] text-slate-800 dark:text-slate-200 font-bold text-xs hover:border-[#FCB431] transition">
                زر مخطط Outlined
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="px-3 py-1 rounded-full bg-[#FCB431] text-[#000616] text-xs font-black">
                مميز
              </span>
              <span className="px-3 py-1 rounded-full bg-[#2B3143] text-white text-xs font-bold">
                موثق من أجرلي
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> متاح للحجز
              </span>
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                سكن طالبات
              </span>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="bg-white dark:bg-[#111A30] rounded-3xl border border-slate-200 dark:border-[#1E2B4A] p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-[#1E2B4A]">
              حقول الإدخال (Form Controls)
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="ابحث بالجامعة أو المنطقة..."
                defaultValue="جامعة القاهرة، الجيزة"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-slate-50 dark:bg-[#0A1020] text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FCB431]"
              />
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#1E2B4A] bg-slate-50 dark:bg-[#0A1020] text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FCB431]">
                <option>شقة مفروشة بالكامل</option>
                <option>غرفة مفردة خاصة</option>
                <option>سرير في غرفة مشتركة</option>
              </select>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
