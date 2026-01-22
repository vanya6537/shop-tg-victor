const svgToDataUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

import { getHelmetCoverImage } from './helmet-image';

export const generateProductImage = (opts: {
  title: string;
  subtitle: string;
  emoji: string;
  accent: string;
  productId?: string;
}): string => {
  const { title, subtitle, emoji, accent, productId } = opts;

  // Use special image for helmet cover
  if (productId === 'helmet-cover-style') {
    return getHelmetCoverImage();
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#050812"/>
      <stop offset="55%" stop-color="#0A0E27"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.40"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.45"/>
      <stop offset="70%" stop-color="${accent}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>

  <rect width="1200" height="800" fill="url(#bg)"/>
  <circle cx="600" cy="260" r="360" fill="url(#glow)" filter="url(#soft)"/>

  <g font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial" fill="#ffffff">
    <text x="80" y="180" font-size="120" opacity="0.95">${emoji}</text>
    <text x="80" y="300" font-size="58" font-weight="800" letter-spacing="-0.5" opacity="0.96">${escapeXml(
      title
    )}</text>
    <text x="80" y="370" font-size="30" font-weight="600" opacity="0.75">${escapeXml(subtitle)}</text>

    <g opacity="0.90">
      <rect x="80" y="430" width="520" height="6" rx="3" fill="${accent}"/>
      <rect x="80" y="456" width="360" height="6" rx="3" fill="#00D9FF" opacity="0.55"/>
      <rect x="80" y="482" width="420" height="6" rx="3" fill="#B300FF" opacity="0.50"/>
    </g>

    <g opacity="0.12" fill="#ffffff">
      <circle cx="980" cy="560" r="220"/>
      <circle cx="1020" cy="540" r="160"/>
    </g>
  </g>
</svg>
`;

  return svgToDataUri(svg);
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&apos;');
