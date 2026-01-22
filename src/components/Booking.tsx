import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { useCart } from '../shop/cart';
import { formatMoney, getProductById } from '../shop';
import type { CurrencyCode } from '../shop/types';

// Типы для Telegram WebApp API
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        sendData: (data: string) => void;
        close: () => void;
        ready: () => void;
      };
    };
  }
}

export const Booking = () => {
  const { t, i18n } = useTranslation();
  const cart = useCart();
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    note: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const cartView = useMemo(() => {
    const items = cart.state.lines
      .map((l) => {
        const p = getProductById(l.productId);
        if (!p) return null;
        const lineTotal = p.price * l.quantity;
        return {
          id: p.id,
          qty: l.quantity,
          unitPrice: p.price,
          currency: p.currency as CurrencyCode,
          title: t(p.nameKey),
          lineTotal,
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      qty: number;
      unitPrice: number;
      currency: string;
      title: string;
      lineTotal: number;
    }>;

    const subtotal = items.reduce((sum, x) => sum + x.lineTotal, 0);
    const currency = (items[0]?.currency ?? 'USD') as CurrencyCode;

    return { items, subtotal, currency };
  }, [cart.state.lines, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.contact) {
      alert(t('checkout.validationRequired'));
      return;
    }

    if (cartView.items.length === 0) {
      alert(t('checkout.cartRequired'));
      return;
    }
    
    // Проверяем доступность Telegram WebApp API
    if (!window.Telegram?.WebApp) {
      console.log('Telegram WebApp недоступен, используем локальное сохранение');
      console.log('Данные заказа:', { ...formData, cart: cartView });
      setSubmitted(true);
      setFormData({ name: '', contact: '', note: '' });
      setTimeout(() => setSubmitted(false), 4000);
      return;
    }
    
    const tg = window.Telegram.WebApp;
    
    const bookingData = {
      type: 'order_v1',
      locale: i18n.language,
      customer: {
        name: formData.name,
        contact: formData.contact,
        note: formData.note,
      },
      cart: {
        items: cartView.items,
        subtotal: cartView.subtotal,
        currency: cartView.currency,
      },
      timestamp: new Date().toISOString(),
    };
    
    console.log('📤 Отправляем данные заказа боту:', JSON.stringify(bookingData, null, 2));
    
    // Отправляем данные боту через встроенный API
    try {
        // count bytes length
        const byteLength = new TextEncoder().encode(JSON.stringify(bookingData)).length;
        console.log(`Размер данных: ${byteLength} байт`);
      tg.sendData(JSON.stringify(bookingData));
      console.log('✅ Данные успешно отправлены!');
      cart.clear();
    } catch (error) {
      console.error('❌ Ошибка при отправке данных:', error);
    }
    
    // Показываем успешное сообщение
    setSubmitted(true);
    setFormData({ name: '', contact: '', note: '' });
    setTimeout(() => setSubmitted(false), 4000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section id="booking" className="py-24 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-neon-dark/80 to-neon-darker" />
      {/* Background gradient orbs */}
      <motion.div
        animate={{ x: [-50, 50, -50], y: [0, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-0 right-0 w-96 h-96 bg-neon-blue rounded-full mix-blend-multiply filter blur-3xl opacity-15"
      />
      <motion.div
        animate={{ x: [50, -50, 50] }}
        transition={{ duration: 25, repeat: Infinity }}
        className="absolute bottom-0 left-0 w-96 h-96 bg-neon-green rounded-full mix-blend-multiply filter blur-3xl opacity-10"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={itemVariants}
            className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-neon-purple via-neon-blue to-neon-green bg-clip-text text-transparent"
          >
            {t('booking.title')}
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-xl md:text-2xl text-neon-green font-semibold opacity-90"
          >
            {t('checkout.subtitle')}
          </motion.p>
        </motion.div>

        <motion.form
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
        >
          <div className="p-8 md:p-12 space-y-6">
            <motion.div variants={itemVariants}>
              <label className="block text-neon-green font-bold mb-3 text-lg">
                {t('checkout.name')} ✨
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-neon-dark border-2 border-neon-blue rounded-xl px-5 py-4 text-neon-blue placeholder-neon-blue placeholder-opacity-50 focus:outline-none focus:border-neon-green focus:shadow-neon-green focus:shadow-lg transition-all font-semibold text-lg"
                placeholder={t('checkout.placeholders.name')}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-neon-green font-bold mb-3 text-lg">
                {t('checkout.contact')} 📱
              </label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                className="w-full bg-neon-dark border-2 border-neon-blue rounded-xl px-5 py-4 text-neon-blue placeholder-neon-blue placeholder-opacity-50 focus:outline-none focus:border-neon-green focus:shadow-neon-green focus:shadow-lg transition-all font-semibold text-lg"
                placeholder={t('checkout.placeholders.contact')}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-neon-green font-bold mb-3 text-lg">
                {t('checkout.note')} 💬
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows={5}
                className="w-full bg-neon-dark border-2 border-neon-blue rounded-xl px-5 py-4 text-neon-blue placeholder-neon-blue placeholder-opacity-50 focus:outline-none focus:border-neon-green focus:shadow-neon-green focus:shadow-lg transition-all resize-none font-semibold text-lg leading-relaxed"
                placeholder={t('checkout.placeholders.note')}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <div className="text-white font-extrabold">{t('checkout.yourCart')}</div>
                <div className="text-white/60 text-sm">{t('cart.items', { count: cart.count })}</div>
              </div>
              {cartView.items.length === 0 ? (
                <div className="mt-3 text-white/70 text-sm">{t('cart.emptyDesc')}</div>
              ) : (
                <div className="mt-4 space-y-2">
                  {cartView.items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between text-sm text-white/80">
                      <span className="truncate max-w-[70%]">{it.title} × {it.qty}</span>
                      <span className="font-bold text-white">
                          {formatMoney(it.lineTotal, it.currency, i18n.language)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-white/70">{t('cart.subtotal')}</span>
                    <span className="text-neon-green font-black">
                      {formatMoney(cartView.subtotal, cartView.currency, i18n.language)}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-neon-green text-neon-dark font-bold py-4 rounded-lg border-2 border-neon-green/50 hover:border-neon-green transition-all duration-300 text-lg"
            >
              🚀 {t('checkout.submit')}
            </motion.button>

            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-gradient-to-r from-neon-green to-neon-blue text-neon-dark p-6 rounded-xl font-black text-center text-lg shadow-neon-green"
              >
                ✨ {t('checkout.success')} ✨
              </motion.div>
            )}
          </div>
        </motion.form>
      </div>
    </section>
  );
};
