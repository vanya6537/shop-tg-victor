import { motion } from 'framer-motion';

export const FloatingParticles = () => {
  const particles = [...Array(20)].map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 8 + 10,
    color: ['bg-neon-blue', 'bg-neon-purple', 'bg-neon-green'][Math.floor(Math.random() * 3)],
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          animate={{
            y: [-100, window.innerHeight + 100],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'linear',
          }}
          className={`absolute ${particle.color} rounded-full opacity-40`}
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.left}%`,
          }}
        />
      ))}
    </div>
  );
};
