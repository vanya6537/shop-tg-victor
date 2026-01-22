import type { CurrencyCode } from './types';

export const formatMoney = (amount: number, currency: CurrencyCode, locale?: string) => {
  try {
    return new Intl.NumberFormat(locale ?? undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'VND' ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(currency === 'VND' ? 0 : 2)} ${currency}`;
  }
};
