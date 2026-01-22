import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PRODUCTS, formatMoney, generateProductImage } from '../shop';
import type { ProductCategory } from '../shop/types';
import { useCart } from '../shop/cart';
import { NeonBackdrop } from './NeonBackdrop';
import { ProductDetailsModal } from './ProductDetailsModal';
import { useToast } from '../lib/toast';

type SortKey = 'featured' | 'priceAsc' | 'priceDesc';

export const Shop = () => {
  const { t, i18n } = useTranslation();
  const cart = useCart();
  const toast = useToast();

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<ProductCategory | 'all'>('all');
  const [sort, setSort] = useState<SortKey>('featured');
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [sortOpen, setSortOpen] = useState(false);

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = PRODUCTS;

    if (category !== 'all') {
      list = list.filter((p) => p.category === category);
    }

    if (q) {
      list = list.filter((p) => {
        const name = t(p.nameKey).toLowerCase();
        const short = t(p.shortDescKey).toLowerCase();
        return name.includes(q) || short.includes(q);
      });
    }

    if (sort === 'priceAsc') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'priceDesc') list = [...list].sort((a, b) => b.price - a.price);

    return list;
  }, [category, query, sort, t]);

  return (
    <section id="products" className="py-20 md:py-28 relative">
      {/* Back-compat anchor */}
      <div id="shows" />

      <NeonBackdrop intensity="soft" className="opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-neon-darker/60 to-neon-dark/60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            {t('shop.title')}
          </h2>
          <p className="mt-3 text-white/70 max-w-2xl mx-auto">{t('shop.subtitle')}</p>
        </motion.div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('shop.searchPlaceholder')}
              className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-5 py-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-neon-green/50"
            />
          </div>

          <div className="md:col-span-3 relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-neon-green/50 flex items-center justify-between hover:bg-white/10 transition"
            >
              <span>
                {sort === 'featured' && t('shop.sort.featured')}
                {sort === 'priceAsc' && t('shop.sort.priceAsc')}
                {sort === 'priceDesc' && t('shop.sort.priceDesc')}
              </span>
              <span className="text-white/60">▼</span>
            </button>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/10 bg-neon-darker/95 backdrop-blur-sm shadow-lg z-10 overflow-hidden"
              >
                {(['featured', 'priceAsc', 'priceDesc'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSort(s);
                      setSortOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left transition ${
                      sort === s
                        ? 'bg-neon-green/20 text-neon-green font-semibold border-l-2 border-neon-green'
                        : 'text-white/80 hover:bg-white/10 border-l-2 border-transparent'
                    }`}
                  >
                    {s === 'featured' && t('shop.sort.featured')}
                    {s === 'priceAsc' && t('shop.sort.priceAsc')}
                    {s === 'priceDesc' && t('shop.sort.priceDesc')}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <div className="md:col-span-2 flex gap-2">
            {(['all', 'massage', 'helmet'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`flex-1 rounded-2xl border px-3 py-4 text-sm font-semibold transition ${
                  category === c
                    ? 'bg-white text-neon-darker border-white/10'
                    : 'bg-white/5 text-white/80 border-white/10 hover:bg-white/10'
                }`}
              >
                {c === 'all' ? t('shop.categories.all') : t(`products.categories.${c}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => {
            const image = generateProductImage({
              title: t(p.nameKey),
              subtitle: t(p.shortDescKey),
              emoji: p.emoji,
              accent: p.accent,
            });

            return (
              <motion.div
                key={p.id}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
              >
                <button className="block w-full" onClick={() => setDetailsId(p.id)}>
                  <img src={image} alt={t(p.nameKey)} className="w-full h-44 object-cover" />
                </button>

                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-white font-extrabold leading-snug truncate">{t(p.nameKey)}</h3>
                      <p className="text-white/65 text-sm mt-1 overflow-hidden text-ellipsis">
                        {t(p.shortDescKey)}
                      </p>
                    </div>
                    <div className="text-neon-green font-black whitespace-nowrap">
                      {formatMoney(p.price, p.currency, i18n.language)}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-1">
                    <button
                      className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 hover:bg-white/10"
                      onClick={() => setDetailsId(p.id)}
                    >
                      {t('shop.viewDetails')}
                    </button>
                    <button
                      className="flex-1 px-4 py-3 rounded-xl bg-neon-green text-neon-darker font-black border border-neon-green/40 hover:brightness-110"
                      onClick={() => {
                        cart.add(p.id, 1);
                        toast.push({
                          variant: 'success',
                          title: t('toast.addedTitle'),
                          message: t('toast.addedMessage', { name: t(p.nameKey) }),
                        });
                      }}
                    >
                      {t('shop.addToCart')}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 text-center text-white/60 text-sm">
          {t('shop.testCatalogNote')}
        </div>
      </div>

      <ProductDetailsModal
        open={Boolean(detailsId)}
        productId={detailsId}
        onClose={() => setDetailsId(null)}
      />
    </section>
  );
};
