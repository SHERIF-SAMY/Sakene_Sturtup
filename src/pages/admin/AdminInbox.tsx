import { useEffect, useState } from 'react';
import { Mail, Trash2, CheckCheck, Phone, AtSign, MessageSquare } from 'lucide-react';
import { apiGet, apiSend } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

type Message = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function AdminInbox() {
  const [items, setItems] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);

  const load = () => {
    setLoading(true);
    apiGet<Message[]>('/api/contact')
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    await apiSend('/api/contact', 'PUT', { id, is_read: true });
    load();
  };

  const deleteMsg = async (id: number) => {
    await apiSend('/api/contact', 'DELETE', { id });
    setSelected(null);
    load();
  };

  const unread = items.filter((i) => !i.is_read).length;

  return (
    <div className="bg-white dark:bg-[#111A30] rounded-3xl border border-slate-100 dark:border-[#1E2B4A] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-[#1E2B4A]">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-500" /> صندوق الرسائل
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            رسائل التواصل من زوار الموقع
            {unread > 0 && <span className="ms-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">{unread} جديد</span>}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-8"><LoadingSpinner label="جاري تحميل الرسائل..." /></div>
      ) : !items.length ? (
        <div className="p-8">
          <EmptyState title="لا توجد رسائل بعد" description="ستظهر هنا رسائل التواصل التي يرسلها زوار الموقع." />
        </div>
      ) : (
        <div className="grid md:grid-cols-[320px_1fr]">
          {/* List */}
          <div className="border-e border-slate-100 dark:border-[#1E2B4A] overflow-y-auto max-h-[600px]">
            {items.map((msg) => (
              <button
                key={msg.id}
                onClick={() => { setSelected(msg); if (!msg.is_read) markRead(msg.id); }}
                className={`w-full text-start px-4 py-3.5 border-b border-slate-100 dark:border-[#1E2B4A] hover:bg-slate-50 dark:hover:bg-[#0A1020] transition ${
                  selected?.id === msg.id ? 'bg-amber-500/10 dark:bg-amber-500/10 border-e-2 border-e-amber-500' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${!msg.is_read ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                    {!msg.is_read && <span className="inline-block w-2 h-2 rounded-full bg-amber-500 me-1.5 align-middle" />}
                    {msg.name}
                  </p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                    {new Date(msg.created_at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{msg.message}</p>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="p-6">
            {selected ? (
              <div>
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selected.name}</h3>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {selected.email && (
                        <a href={`mailto:${selected.email}`} className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400 font-bold hover:underline">
                          <AtSign className="w-3.5 h-3.5" /> {selected.email}
                        </a>
                      )}
                      {selected.phone && (
                        <a href={`https://wa.me/2${selected.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                           className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                          <Phone className="w-3.5 h-3.5" /> {selected.phone}
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {new Date(selected.created_at).toLocaleString('ar-EG')}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMsg(selected.id)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    title="حذف الرسالة"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-[#0A1020] rounded-2xl p-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap border border-slate-100 dark:border-[#1E2B4A]">
                  {selected.message}
                </div>

                <div className="mt-4 flex gap-3">
                  {selected.email && (
                    <a
                      href={`mailto:${selected.email}?subject=رد من Agarly`}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold transition shadow-sm"
                    >
                      <Mail className="w-4 h-4" /> رد عبر البريد
                    </a>
                  )}
                  {selected.phone && (
                    <a
                      href={`https://wa.me/2${selected.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('مرحباً، هذا رد من فريق Agarly على رسالتك.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition shadow-sm"
                    >
                      <Phone className="w-4 h-4" /> واتساب
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-16 text-slate-400 dark:text-slate-500">
                <MessageSquare className="w-10 h-10 mb-3 opacity-40" />
                <p className="text-sm font-semibold">اختر رسالة لعرض تفاصيلها</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
