import type { ShopProduct } from './types';

export const PRODUCTS: ShopProduct[] = [
  {
    id: 'stick-acupressure-pro',
    category: 'massage',
    price: 19.99,
    currency: 'USD',
    accent: '#39FF14',
    emoji: '🧴',
    nameKey: 'products.items.stick-acupressure-pro.name',
    shortDescKey: 'products.items.stick-acupressure-pro.short',
    detailsKey: 'products.items.stick-acupressure-pro.details',
    featuresKeys: [
      'products.items.stick-acupressure-pro.f1',
      'products.items.stick-acupressure-pro.f2',
      'products.items.stick-acupressure-pro.f3',
    ],
  },
  {
    id: 'stick-therapy-ergonomic',
    category: 'massage',
    price: 24.99,
    currency: 'USD',
    accent: '#00D9FF',
    emoji: '💆',
    nameKey: 'products.items.stick-therapy-ergonomic.name',
    shortDescKey: 'products.items.stick-therapy-ergonomic.short',
    detailsKey: 'products.items.stick-therapy-ergonomic.details',
    featuresKeys: [
      'products.items.stick-therapy-ergonomic.f1',
      'products.items.stick-therapy-ergonomic.f2',
      'products.items.stick-therapy-ergonomic.f3',
    ],
  },
  {
    id: 'stick-mini-pocket',
    category: 'massage',
    price: 12.99,
    currency: 'USD',
    accent: '#39FF14',
    emoji: '🧊',
    nameKey: 'products.items.stick-mini-pocket.name',
    shortDescKey: 'products.items.stick-mini-pocket.short',
    detailsKey: 'products.items.stick-mini-pocket.details',
    featuresKeys: [
      'products.items.stick-mini-pocket.f1',
      'products.items.stick-mini-pocket.f2',
      'products.items.stick-mini-pocket.f3',
    ],
  },
  {
    id: 'helmet-cover-style',
    category: 'helmet',
    price: 8.99,
    currency: 'USD',
    accent: '#00D9FF',
    emoji: '🧸',
    nameKey: 'products.items.helmet-cover-style.name',
    shortDescKey: 'products.items.helmet-cover-style.short',
    detailsKey: 'products.items.helmet-cover-style.details',
    featuresKeys: [
      'products.items.helmet-cover-style.f1',
      'products.items.helmet-cover-style.f2',
      'products.items.helmet-cover-style.f3',
    ],
  },
];

export const getProductById = (id: string) => PRODUCTS.find((p) => p.id === id);
