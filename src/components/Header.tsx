import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';

interface NavProps {
  onLanguageChange: (lang: string) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const Header = ({ onLanguageChange, cartCount, onOpenCart }: NavProps) => {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (!mobileMenuRef.current?.contains(target)) {
        setMobileMenuOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown, { passive: true });
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 border-b border-white/10 bg-neon-darker/70 backdrop-blur"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
            whileHover={{ scale: 1.05, textShadow: '0 0 20px rgba(179, 0, 255, 0.8)' }}
            className="font-extrabold bg-gradient-to-r from-neon-blue via-neon-purple to-neon-green bg-clip-text text-transparent cursor-pointer flex items-center min-w-0"
          >
            <span className="truncate whitespace-nowrap">
              {t('brand.name')}
            </span>
          </motion.div>

          <nav className="hidden md:flex gap-8">
            {['home', 'products', 'about', 'contact'].map((item) => (
              <motion.a
                key={item}
                href={`#${item === 'products' ? 'products' : item === 'contact' ? 'booking' : item}`}
                whileHover={{ 
                  color: '#00D9FF',
                  textShadow: '0 0 15px rgba(0, 217, 255, 0.8)',
                  scale: 1.1
                }}
                className="text-white/75 font-medium hover:text-white transition-colors"
              >
                {t(`nav.${item}`)}
              </motion.a>
            ))}
          </nav>

          <div ref={mobileMenuRef} className="relative flex gap-2 items-center">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/#admin'}
              className="flex px-2 sm:px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 bg-purple-600/20 text-purple-300 border border-purple-500/50 hover:bg-purple-600/40 hover:text-purple-200 items-center gap-1"
              title="Admin Panel (requires login)"
              aria-label="Admin Panel"
            >
              <span className="leading-none">🔐</span>
              <span className="hidden sm:inline">Admin</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenCart}
              className="relative px-2 sm:px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white"
              aria-label={t('cart.open')}
            >
              🛒
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-neon-green text-neon-darker rounded-full text-[10px] font-black px-1.5 py-0.5 border border-neon-green/40">
                  {cartCount}
                </span>
              )}
            </motion.button>

            <div className="hidden md:flex gap-2 items-center">
              {['en', 'ru', 'vi'].map((lang) => (
                <motion.button
                  key={lang}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    i18n.changeLanguage(lang);
                    onLanguageChange(lang);
                  }}
                  className={`px-2 sm:px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    i18n.language === lang
                      ? 'bg-white text-neon-darker'
                      : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {lang.toUpperCase()}
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:text-white"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </motion.button>

            {mobileMenuOpen && (
              <div className="md:hidden absolute right-0 top-full mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-white/10 bg-neon-darker/95 backdrop-blur shadow-xl p-2">
                <div className="flex flex-col">
                  {['home', 'products', 'about', 'contact'].map((item) => (
                    <motion.a
                      key={item}
                      href={`#${item === 'products' ? 'products' : item === 'contact' ? 'booking' : item}`}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition"
                    >
                      {t(`nav.${item}`)}
                    </motion.a>
                  ))}

                  <div className="h-px bg-white/10 my-2" />

                  <div className="grid grid-cols-3 gap-2">
                    {['en', 'ru', 'vi'].map((lang) => (
                      <motion.button
                        key={lang}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          i18n.changeLanguage(lang);
                          onLanguageChange(lang);
                          setMobileMenuOpen(false);
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                          i18n.language === lang
                            ? 'bg-white text-neon-darker'
                            : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {lang.toUpperCase()}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};
