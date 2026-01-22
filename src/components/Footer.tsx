import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export const Footer = () => {
  const { t } = useTranslation();
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      id="contact"
      className="bg-gradient-to-t from-neon-darker to-neon-dark border-t border-white/10 py-16 relative overflow-hidden"
    >
      {/* Background glow */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-neon-green rounded-full mix-blend-multiply filter blur-3xl opacity-5"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <motion.div
            whileHover={{ x: 10, color: '#39FF14' }}
            className="text-neon-blue transition-colors duration-300"
          >
            <h3 className="text-2xl font-black bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent mb-3">
              ⚡ Science Show
            </h3>
            <p className="opacity-80 font-semibold leading-relaxed">
              {t('footer.description')}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ x: 10, color: '#39FF14' }}
            className="text-neon-blue transition-colors duration-300"
          >
            <h3 className="text-2xl font-black text-neon-green mb-4">
              {t('footer.contact')}
            </h3>
            <ul className="space-y-2 opacity-80 font-semibold">
              <li 
                onClick={() => handleCopy('viktorvalmontshow@gmail.com', 'email')}
                className="cursor-pointer hover:text-neon-green transition-all duration-200 flex items-center gap-2 hover:gap-3"
              >
                📧 {copiedText === 'email' ? `✅ ${t('footer.copied')}` : 'viktorvalmontshow@gmail.com'}
              </li>
              <li 
                onClick={() => handleCopy('+84 949197496', 'phone')}
                className="cursor-pointer hover:text-neon-green transition-all duration-200 flex items-center gap-2 hover:gap-3"
              >
                📱 {copiedText === 'phone' ? `✅ ${t('footer.copied')}` : '+84 949197496'}
              </li>
              <li className="flex items-center gap-2">
                📍 {t('footer.location')}
              </li>
            </ul>
          </motion.div>

          <motion.div
            whileHover={{ x: 10, color: '#39FF14' }}
            className="text-neon-blue transition-colors duration-300"
          >
            <h3 className="text-2xl font-black text-neon-green mb-4">{t('footer.followUs')}</h3>
            <div className="flex gap-4 flex-wrap">
              {['f', 'i', 't'].map((icon) => (
                <motion.a
                  key={icon}
                  href="#"
                  whileHover={{ 
                    scale: 1.3,
                    textShadow: '0 0 15px rgba(57, 255, 20, 0.8)',
                    color: '#39FF14'
                  }}
                  className="text-neon-purple text-2xl hover:text-neon-green transition-all duration-300 font-bold"
                >
                  {icon === 'f' && '👍'}
                  {icon === 'i' && '📷'}
                  {icon === 't' && '𝕏'}
                </motion.a>
              ))}
              <motion.a
                href="https://t.me/science_show_dnang_bot"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ 
                  scale: 1.3,
                  textShadow: '0 0 15px rgba(0, 217, 255, 0.8)',
                  color: '#00D9FF'
                }}
                className="text-neon-blue text-2xl hover:text-neon-cyan transition-all duration-300 font-bold"
                title={t('footer.openBotTitle')}
              >
                🤖
              </motion.a>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8 }}
          className="h-1 bg-gradient-to-r from-transparent via-neon-purple to-transparent mb-8 origin-left rounded-full shadow-neon-purple"
        />

        <div className="text-center text-neon-blue opacity-70 text-sm font-semibold">
          <p>
            © {currentYear} Science Show Da Nang. {t('footer.rights')}.
          </p>
        </div>
      </div>
    </motion.footer>
  );
};
