import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generateProductImage, formatMoney, getProductById } from '../shop';
import { useCart } from '../shop/cart';
import { BackgroundGradient } from './BackgroundGradient';
import { useToast } from '../lib/toast';

export const ProductDetailsModal = ({
  productId,
  open,
  onClose,
}: {
  productId: string | null;
  open: boolean;
  onClose: () => void;
}) => {
  const { t, i18n } = useTranslation();
  const cart = useCart();
  const toast = useToast();
  const [qty, setQty] = useState(1);

  const product = useMemo(() => (productId ? getProductById(productId) : undefined), [productId]);

  const image = useMemo(() => {
    if (!product) return '';
    return generateProductImage({
      title: t(product.nameKey),
      subtitle: t(product.shortDescKey),
      emoji: product.emoji,
      accent: product.accent,
    });
  }, [product, t]);

  if (!open || !product) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/70" onClick={onClose} />

        <motion.div
          role="dialog"
          aria-modal="true"
          className="relative w-full h-full p-3 sm:p-4 md:p-8"
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <BackgroundGradient containerClassName="w-full h-full" className="h-full">
            <div className="h-full rounded-3xl border border-white/10 bg-neon-darker/90 backdrop-blur-xl overflow-hidden shadow-[0_30px_120px_rgba(0,0,0,0.65)]">
              <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-5 py-4 border-b border-white/10 bg-neon-darker/70 backdrop-blur-xl">
                <div className="min-w-0">
                  <div className="text-white/70 text-xs">{t(`products.categories.${product.category}`)}</div>
                  <div className="text-white font-extrabold truncate">{t(product.nameKey)}</div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/80 hover:bg-white/10"
                >
                  {t('common.close')}
                </button>
              </div>

              <div className="h-[calc(100%-64px)] overflow-auto">
                <div className="p-5 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 min-h-56">
                    <img src={image} alt={t(product.nameKey)} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex flex-col">
                    <p className="text-white/75">{t(product.shortDescKey)}</p>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-neon-green font-black text-2xl">
                        {formatMoney(product.price, product.currency, i18n.language)}
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                        <span>{product.emoji}</span>
                        <span>{t(`products.categories.${product.category}`)}</span>
                      </div>
                    </div>

                    <div className="mt-5 text-white/80 text-sm leading-relaxed">
                      {t(product.detailsKey)}
                    </div>

                    <ul className="mt-5 space-y-2 text-white/75 text-sm">
                      {product.featuresKeys.map((k) => (
                        <li key={k} className="flex gap-2">
                          <span className="text-neon-green">✓</span>
                          <span>{t(k)}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 flex items-center gap-3">
                      <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/5">
                        <button
                          className="px-3 py-2 text-white/80 hover:bg-white/10 rounded-l-xl"
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          aria-label={t('cart.decreaseQty')}
                        >
                          −
                        </button>
                        <div className="px-3 py-2 text-white font-semibold min-w-12 text-center">{qty}</div>
                        <button
                          className="px-3 py-2 text-white/80 hover:bg-white/10 rounded-r-xl"
                          onClick={() => setQty((q) => Math.min(99, q + 1))}
                          aria-label={t('cart.increaseQty')}
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="flex-1 px-5 py-3 rounded-xl bg-neon-green text-neon-darker font-black border border-neon-green/40 hover:brightness-110 transition"
                        onClick={() => {
                          cart.add(product.id, qty);
                          toast.push({
                            variant: 'success',
                            title: t('toast.addedTitle'),
                            message: t('toast.addedQtyMessage', { name: t(product.nameKey), qty }),
                          });
                          onClose();
                        }}
                      >
                        {t('shop.addToCart')}
                      </button>
                    </div>

                    <p className="mt-3 text-xs text-white/55">{t('shop.testProductNote')}</p>
                  </div>
                </div>
              </div>
            </div>
          </BackgroundGradient>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
