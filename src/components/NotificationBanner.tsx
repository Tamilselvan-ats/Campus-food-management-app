import React, { useEffect, useState } from 'react';
import { X, Sparkles, Bell } from 'lucide-react';

interface ToastData {
  id: string;
  title: string;
  body: string;
  icon?: string;
  time: string;
}

export const NotificationBanner: React.FC = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handlePushEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ title: string; body: string; icon?: string; time: string }>;
      const { title, body, icon, time } = customEvent.detail;
      const newToast: ToastData = {
        id: `toast_${Date.now()}_${Math.random()}`,
        title,
        body,
        icon: icon || '🍱',
        time: time || 'Just now',
      };

      setToasts((prev) => [newToast, ...prev].slice(0, 3));

      // Auto-remove after 7 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 7000);
    };

    window.addEventListener('app-push-notification', handlePushEvent);
    return () => {
      window.removeEventListener('app-push-notification', handlePushEvent);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-slate-900/95 text-white border-2 border-emerald-500/60 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300 flex items-start gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shrink-0">
            {toast.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="font-semibold text-xs tracking-wide text-emerald-400 uppercase flex items-center gap-1">
                <Bell className="w-3 h-3" /> Push Alert
              </span>
              <span className="text-[10px] text-slate-400">{toast.time}</span>
            </div>
            <h5 className="font-bold text-sm text-slate-100 mt-0.5 leading-snug">{toast.title}</h5>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toast.body}</p>
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="text-slate-400 hover:text-slate-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
