import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const About = () => {
  const { t } = useTranslation();

  return (
    <section id="about" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start"
        >
          <div className="md:col-span-5">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              {t('about.title')}
            </h2>
            <p className="mt-4 text-white/75 text-base md:text-lg leading-relaxed">
              {t('about.subtitle')}
            </p>
          </div>

          <div className="md:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 md:p-8">
              <ul className="space-y-4 text-white/80">
                {[0, 1, 2].map((idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="mt-1 inline-flex size-5 items-center justify-center rounded-full bg-neon-blue/20 text-neon-blue">
                      ✓
                    </span>
                    <span className="leading-relaxed">{t(`about.bullets.${idx}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
