import { motion } from 'framer-motion';

interface NeonBackdropProps {
  className?: string;
  intensity?: 'soft' | 'medium';
}

export const NeonBackdrop = ({ className, intensity = 'soft' }: NeonBackdropProps) => {
  const opacity = intensity === 'medium' ? 'opacity-80' : 'opacity-60';

  return (
    <div aria-hidden className={['pointer-events-none absolute inset-0', className].filter(Boolean).join(' ')}>
      {/* Soft neon orbs */}
      <div className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-neon-purple/20 blur-3xl" />
      <div className="absolute -bottom-28 -right-28 h-[520px] w-[520px] rounded-full bg-neon-blue/15 blur-3xl" />
      <div className="absolute top-1/3 -right-24 h-[360px] w-[360px] rounded-full bg-neon-green/10 blur-3xl" />

      {/* SVG grid + arcs */}
      <motion.svg
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className={`absolute inset-0 h-full w-full ${opacity}`}
        viewBox="0 0 1200 700"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="neonLine" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00D9FF" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#B300FF" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#39FF14" stopOpacity="0.5" />
          </linearGradient>

          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </pattern>

          <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -6"
              result="glow"
            />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="1200" height="700" fill="url(#grid)" />

        {/* arcs */}
        <path
          d="M -50 560 C 220 380, 420 720, 740 520 S 1150 360, 1260 540"
          fill="none"
          stroke="url(#neonLine)"
          strokeWidth="2"
          opacity="0.65"
          filter="url(#glow)"
        />
        <path
          d="M -70 180 C 180 40, 360 260, 620 160 S 980 40, 1260 210"
          fill="none"
          stroke="url(#neonLine)"
          strokeWidth="1.6"
          opacity="0.5"
          filter="url(#glow)"
        />

        {/* dotted constellation */}
        {Array.from({ length: 36 }).map((_, i) => {
          const x = (i * 97) % 1200;
          const y = (i * 53) % 700;
          const r = (i % 3) + 1;
          return (
            <circle key={i} cx={x} cy={y} r={r} fill="rgba(255,255,255,0.18)" />
          );
        })}
      </motion.svg>

      {/* vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-neon-darker/40 via-transparent to-neon-darker/70" />
    </div>
  );
};
