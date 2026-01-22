import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface ElasticHueSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

const ElasticHueSlider: React.FC<ElasticHueSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 360,
  step = 1,
  label,
}) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const clientXRef = useRef<number>(0);
  const rectRef = useRef<DOMRect | null>(null);

  const progress = ((value - min) / (max - min));
  const thumbPosition = progress * 100;

  const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

  const snapToStep = (raw: number) => {
    const stepped = Math.round((raw - min) / step) * step + min;
    return clamp(stepped, min, max);
  };

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

  const setFromClientX = (clientX: number) => {
    const rect = rectRef.current ?? sliderRef.current?.getBoundingClientRect() ?? null;
    if (!rect || rect.width <= 0) return;
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    const raw = min + ratio * (max - min);
    onChange(snapToStep(raw));
  };

  const scheduleUpdateFromClientX = (clientX: number) => {
    clientXRef.current = clientX;
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      setFromClientX(clientXRef.current);
    });
  };

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    draggingRef.current = true;
    setIsDragging(true);
    rectRef.current = sliderRef.current?.getBoundingClientRect() ?? null;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    scheduleUpdateFromClientX(e.clientX);
    e.preventDefault();
  };

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!draggingRef.current) return;
    scheduleUpdateFromClientX(e.clientX);
    e.preventDefault();
  };

  const endDrag: React.PointerEventHandler<HTMLDivElement> = (e) => {
    draggingRef.current = false;
    setIsDragging(false);
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

  const colorNameKey = useMemo(() => colorKeyForHue(value), [value]);
  const hex = useMemo(() => hslToHex(((value % 360) + 360) % 360, 100, 50), [value]);
  const previewStyle = useMemo(() => ({ backgroundColor: `hsl(${value} 100% 50%)` }), [value]);

  return (
    <div className="relative w-full max-w-sm flex flex-col" ref={sliderRef}>
      {label && (
        <label htmlFor="hue-slider-native" className="text-white/80 text-xs mb-3 font-medium">
          {label}
        </label>
      )}
      <div
        className="relative w-full h-6 flex items-center touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <input
          id="hue-slider-native"
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer z-20 pointer-events-none"
          style={{ WebkitAppearance: 'none' }}
        />

        <div className="absolute left-0 w-full h-1 bg-white/10 rounded-full z-0" />

        <div
          className="absolute left-0 h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-green rounded-full z-10"
          style={{ width: `${thumbPosition}%` }}
        />

        <motion.div
          className="absolute transform -translate-y-1/2 z-30"
          style={{ left: `${thumbPosition}%` }}
          animate={{ scale: isDragging ? 1.4 : 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: isDragging ? 20 : 30 }}
        >
          <div className="w-5 h-5 bg-white rounded-full transform -translate-x-1/2 border border-white/30 shadow-[0_10px_30px_rgba(0,0,0,0.35)]" />
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2 }}
          className="mt-3 flex items-center justify-between gap-3 text-xs text-white/70 font-medium"
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-flex size-4 rounded-full border border-white/20 shadow-[0_0_0_4px_rgba(255,255,255,0.03)]"
              style={previewStyle}
            />
            <span>
              {t('lightning.colorLabel', { name: t(colorNameKey), hex })}
            </span>
          </div>
          <span />
        </motion.div>
      </AnimatePresence>

      <div className="mt-2 text-[11px] text-white/50">
        {t('lightning.hintSwipe')}
      </div>
    </div>
  );
};

export default ElasticHueSlider;
