import { motion } from 'framer-motion';
import React, { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LightningWishControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const hslToHex = (h: number, s = 100, l = 50) => {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const v = Math.round((n + m) * 255);
    return v.toString(16).padStart(2, '0');
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

const colorKeyForHue = (h: number) => {
  const hue = ((h % 360) + 360) % 360;
  if (hue < 15 || hue >= 345) return 'lightning.colors.red';
  if (hue < 45) return 'lightning.colors.orange';
  if (hue < 70) return 'lightning.colors.yellow';
  if (hue < 160) return 'lightning.colors.green';
  if (hue < 200) return 'lightning.colors.cyan';
  if (hue < 250) return 'lightning.colors.blue';
  if (hue < 290) return 'lightning.colors.violet';
  return 'lightning.colors.pink';
};

const shuffle = <T,>(items: T[]) => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const LightningWishControl = ({
  value,
  onChange,
  min = 0,
  max = 360,
  step = 1,
  label,
}: LightningWishControlProps) => {
  const { t } = useTranslation();

  const wishes = useMemo(() => {
    const raw = t('lightning.wishes', { returnObjects: true }) as unknown;
    return Array.isArray(raw) ? (raw.filter(Boolean) as string[]) : [];
  }, [t]);

  const [bag, setBag] = useState(() => shuffle(wishes));
  const [wishIndex, setWishIndex] = useState(0);
  const [currentWish, setCurrentWish] = useState(() => bag[0] ?? '');

  const wrapRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const clientXRef = useRef(0);
  const rectRef = useRef<DOMRect | null>(null);
  const lastBucketRef = useRef<number>(Math.round(value / 12));

  const snapToStep = (raw: number) => {
    const stepped = Math.round((raw - min) / step) * step + min;
    return clamp(stepped, min, max);
  };

  const setFromClientX = (clientX: number) => {
    const rect = rectRef.current ?? wrapRef.current?.getBoundingClientRect() ?? null;
    if (!rect || rect.width <= 0) return;
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    const raw = min + ratio * (max - min);
    const next = snapToStep(raw);
    onChange(next);

    const bucket = Math.round(next / 12);
    if (bucket !== lastBucketRef.current) {
      lastBucketRef.current = bucket;
      if (!wishes.length) return;

      const nextIndex = wishIndex + 1;
      if (nextIndex < bag.length) {
        setWishIndex(nextIndex);
        setCurrentWish(bag[nextIndex]);
      } else {
        const nextBag = shuffle(wishes);
        setBag(nextBag);
        setWishIndex(0);
        setCurrentWish(nextBag[0] ?? '');
      }
    }
  };

  const scheduleUpdate = (clientX: number) => {
    clientXRef.current = clientX;
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      setFromClientX(clientXRef.current);
    });
  };

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    draggingRef.current = true;
    rectRef.current = wrapRef.current?.getBoundingClientRect() ?? null;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    scheduleUpdate(e.clientX);
    e.preventDefault();
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!draggingRef.current) return;
    scheduleUpdate(e.clientX);
    e.preventDefault();
  };

  const onPointerEnd: React.PointerEventHandler<HTMLDivElement> = (e) => {
    draggingRef.current = false;
    rectRef.current = null;
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const hex = useMemo(() => hslToHex(((value % 360) + 360) % 360, 100, 50), [value]);
  const colorNameKey = useMemo(() => colorKeyForHue(value), [value]);
  const previewStyle = useMemo(() => ({ backgroundColor: `hsl(${value} 100% 50%)` }), [value]);

  return (
    <div className="w-full" ref={wrapRef}>
      {label && <div className="text-white/80 text-xs mb-3 font-medium">{label}</div>}

      <motion.div
        whileTap={{ scale: 0.995 }}
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-4 select-none touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex size-4 rounded-full border border-white/20 shadow-[0_0_0_4px_rgba(255,255,255,0.03)]"
              style={previewStyle}
            />
            <span className="text-xs text-white/70">
              {t('lightning.colorLabel', { name: t(colorNameKey), hex })}
            </span>
          </div>
          <div className="h-2 w-24 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${((value - min) / (max - min)) * 100}%`,
                background: 'linear-gradient(90deg, rgba(0,217,255,0.9), rgba(179,0,255,0.9), rgba(57,255,20,0.9))',
              }}
            />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[11px] text-white/50">{t('lightning.hintSwipe')}</div>
          <div className="mt-2 text-sm md:text-base text-white/90 font-semibold leading-snug">
            {currentWish || ''}
          </div>
        </div>

        <div className="mt-3 text-xs text-white/60">
          <span className="font-mono">{hex}</span>
        </div>
      </motion.div>
    </div>
  );
};
