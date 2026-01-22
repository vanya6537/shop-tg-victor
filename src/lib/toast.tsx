import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

export type ToastVariant = 'success' | 'info' | 'error';

export type ToastItem = {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
};

type ToastApi = {
  push: (toast: Omit<ToastItem, 'id'>) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const uid = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));

    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const clear = useCallback(() => {
    setToasts([]);
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
  }, []);

  const push = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = uid();
      setToasts((prev) => [{ ...toast, id }, ...prev].slice(0, 4));

      const timer = window.setTimeout(() => remove(id), 2400);
      timers.current.set(id, timer);
    },
    [remove]
  );

  const api = useMemo<ToastApi>(() => ({ push, remove, clear }), [push, remove, clear]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used within ToastProvider');
  return api;
};

const ToastViewport = ({
  toasts,
  onClose,
}: {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[80] w-[min(560px,calc(100%-24px))] pointer-events-none">
      <div className="space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              `pointer-events-auto rounded-2xl border backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)] px-4 py-3 ` +
              (t.variant === 'success'
                ? 'bg-neon-darker/90 border-neon-green/30'
                : t.variant === 'error'
                  ? 'bg-neon-darker/90 border-red-400/30'
                  : 'bg-neon-darker/90 border-white/10')
            }
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {t.title && <div className="text-white font-extrabold text-sm truncate">{t.title}</div>}
                <div className="text-white/75 text-sm leading-snug">{t.message}</div>
              </div>
              <button
                onClick={() => onClose(t.id)}
                className="text-white/60 hover:text-white text-sm"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
