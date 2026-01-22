import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatMoney, generateProductImage, getProductById } from '../shop';
import type { ShopProduct } from '../shop/types';
import { useCart } from '../shop/cart';
import { useToast } from '../lib/toast';

export const CartDrawer = ({
  open,
  onClose,
  onCheckout,
}: {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
}) => {
  const { t, i18n } = useTranslation();
  const cart = useCart();
  const toast = useToast();

  const lines = useMemo(
    () =>
      cart.state.lines
        .map((l) => {
          const product = getProductById(l.productId);
          return product ? { line: l, product: product as ShopProduct } : null;
        })
        .filter(Boolean) as Array<{ line: { productId: string; quantity: number }; product: ShopProduct }>,
    [cart.state.lines]
  );

  const subtotal = useMemo(() => {
    return lines.reduce((sum, x) => sum + x.product.price * x.line.quantity, 0);
  }, [lines]);

  const currency = lines[0]?.product.currency ?? 'USD';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />

          <motion.aside
            className="absolute right-0 top-0 h-full w-full max-w-md bg-neon-darker/95 backdrop-blur-xl border-l border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.55)]"
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-white font-extrabold text-xl">{t('cart.title')}</h3>
                <p className="text-white/60 text-xs">{t('cart.items', { count: cart.count })}</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/80 hover:bg-white/10"
              >
                {t('common.close')}
              </button>
            </div>

            <div className="p-5 overflow-auto h-[calc(100%-220px)]">
              {lines.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70">
                  <p className="font-semibold">{t('cart.emptyTitle')}</p>
                  <p className="mt-1 text-sm">{t('cart.emptyDesc')}</p>
                  <button
                    className="mt-4 w-full px-4 py-3 rounded-xl bg-white text-neon-darker font-black"
                    onClick={() => {
                      onClose();
                      const el = document.getElementById('products') ?? document.getElementById('shows');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {t('cart.continueShopping')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {lines.map(({ line, product }) => {
                    const image = generateProductImage({
                      title: t(product.nameKey),
                      subtitle: t(product.shortDescKey),
                      emoji: product.emoji,
                      accent: product.accent,
                    });

                    return (
                      <div
                        key={product.id}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4 flex gap-3"
                      >
                        <img
                          src={image}
                          alt={t(product.nameKey)}
                          className="w-20 h-20 rounded-xl object-cover border border-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-white font-semibold truncate">{t(product.nameKey)}</div>
                              <div className="text-white/60 text-xs truncate">{t(product.shortDescKey)}</div>
                            </div>
                            <button
                              className="text-white/60 hover:text-white text-sm"
                              onClick={() => {
                                cart.remove(product.id);
                                toast.push({
                                  variant: 'info',
                                  title: t('toast.removedTitle'),
                                  message: t('toast.removedMessage', { name: t(product.nameKey) }),
                                });
                              }}
                            >
                              {t('cart.remove')}
                            </button>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="inline-flex items-center rounded-xl border border-white/10 bg-white/5">
                              <button
                                className="px-2 py-1.5 text-white/80 hover:bg-white/10 rounded-l-xl"
                                onClick={() => cart.setQty(product.id, Math.max(1, line.quantity - 1))}
                                aria-label={t('cart.decreaseQty')}
                              >
                                −
                              </button>
                              <div className="px-3 py-1.5 text-white font-semibold min-w-10 text-center">
                                {line.quantity}
                              </div>
                              <button
                                className="px-2 py-1.5 text-white/80 hover:bg-white/10 rounded-r-xl"
                                onClick={() => cart.setQty(product.id, Math.min(99, line.quantity + 1))}
                                aria-label={t('cart.increaseQty')}
                              >
                                +
                              </button>
                            </div>

                            <div className="text-neon-green font-black">
                              {formatMoney(product.price * line.quantity, product.currency, i18n.language)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-5 border-t border-white/10">
              <div className="flex items-center justify-between text-white/80">
                <span>{t('cart.subtotal')}</span>
                <span className="text-white font-extrabold">{formatMoney(subtotal, currency, i18n.language)}</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10"
                  onClick={() => {
                    cart.clear();
                    toast.push({ variant: 'info', title: t('toast.clearedTitle'), message: t('toast.clearedMessage') });
                  }}
                  disabled={lines.length === 0}
                >
                  {t('cart.clear')}
                </button>
                <button
                  className="px-4 py-3 rounded-xl bg-neon-green text-neon-darker font-black border border-neon-green/40 hover:brightness-110 disabled:opacity-50"
                  onClick={() => {
                    onClose();
                    toast.push({ variant: 'success', title: t('toast.checkoutTitle'), message: t('toast.checkoutMessage') });
                    onCheckout();
                  }}
                  disabled={lines.length === 0}
                >
                  {t('cart.checkout')}
                </button>
              </div>

              <p className="mt-3 text-xs text-white/50">{t('cart.checkoutHint')}</p>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
