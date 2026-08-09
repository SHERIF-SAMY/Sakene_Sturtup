import { Bell, X, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function NotificationToast() {
  const { toasts, dismissToast } = useNotifications();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case 'property_approved':
      case 'visit_confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'property_rejected':
      case 'visit_cancelled':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'admin_message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-brand-500" />;
    }
  };

  const handleClick = (id: number) => {
    dismissToast(id);
    if (profile?.role === 'broker') {
      navigate('/broker/notifications'); // Fallback, could map to specific pages based on type
    } else {
      navigate('/dashboard/notifications');
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className="bg-white rounded-xl shadow-xl border border-slate-100 p-4 w-80 pointer-events-auto flex gap-3 relative overflow-hidden group"
          >
            <div className="shrink-0 mt-0.5">{getIcon(toast.type)}</div>
            <div className="flex-1 cursor-pointer" onClick={() => handleClick(toast.id)}>
              <h4 className="text-sm font-bold text-slate-900">{toast.title}</h4>
              <p className="text-sm text-slate-500 mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-0 left-0 h-1 bg-brand-500 origin-left" style={{ animation: 'toast-progress 5s linear forwards' }} />
          </motion.div>
        ))}
      </AnimatePresence>
      <style>{`
        @keyframes toast-progress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}
