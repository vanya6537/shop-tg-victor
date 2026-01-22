# 🛍️ Wellness Shop - Quick Start Guide

Welcome to the Premium Wellness Shop Telegram Mini App! This document will help you get started quickly.

## 🚀 Getting Started (2 minutes)

### 1. Install Dependencies
```bash
cd /Users/netslayer/WebstormProjects/shop-tg
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Opens automatically at: http://localhost:5173

### 3. See Changes Live
Edit any file in `src/` and see changes instantly!

## 📱 What's New?

This is now a **Wellness Shop** featuring:
- 💆 **Massage Sticks** - Professional therapeutic tools
- 🛡️ **Helmet Covers** - Protective, stylish covers
- 🌍 **3 Languages** - English, Russian, Vietnamese
- 📧 **Order Form** - Customer inquiry system
- ✨ **Beautiful UI** - Neon animations, smooth transitions

## 🎯 Main Sections

### Home (Hero)
- Product showcase
- Call-to-action button
- Interactive animations

### Products
- 4 Premium products
- Descriptions in 3 languages
- Easy ordering

### About
- Why choose our products
- Quality information
- Benefits

### Order Form
- Name, email, date
- Product interest selection
- Special requests

## 🌐 Language Support

Switch languages using the buttons in header:
- **EN** - English
- **RU** - Русский (Russian)
- **VI** - Tiếng Việt (Vietnamese)

## 🔧 Quick Customization

### Change Products
Edit `/src/components/Shows.tsx`:
```tsx
const shows: Product[] = [
  {
    id: 'product1',
    title: t('shows.dryIce'),        // Change product name
    description: t('shows.dryIceDesc'), // Change description
    icon: '🧴',                       // Change emoji
    // ... rest of config
  }
]
```

Then update translations in:
- `src/locales/en.json`
- `src/locales/ru.json`
- `src/locales/vi.json`

### Change Colors
Edit `/tailwind.config.js`:
```js
colors: {
  neon: {
    blue: '#00D9FF',    // Neon Blue
    purple: '#B300FF',  // Neon Purple
    green: '#39FF14',   // Neon Green
  }
}
```

### Update Shop Info
Edit `/src/components/Footer.tsx`:
- Phone number
- Email address
- Social media links
- Address

## 📝 Translation Files

All text is in these files:

| Language | File | Key Prefix |
|----------|------|-----------|
| English | `src/locales/en.json` | `en` |
| Russian | `src/locales/ru.json` | `ru` |
| Vietnamese | `src/locales/vi.json` | `vi` |

### Available Keys:
- `nav.*` - Navigation items
- `hero.*` - Hero section
- `shows.*` - Products section
- `booking.*` - Order form
- `about.*` - About section
- `footer.*` - Footer

## 🤖 Telegram Integration

### To Deploy as Telegram Mini App:

1. **Create Telegram Bot**
   ```
   Talk to @BotFather on Telegram
   /newbot → name your bot
   ```

2. **Build Production**
   ```bash
   npm run build
   ```

3. **Deploy Build**
   - Upload `dist/` folder to your hosting
   - Get public URL (e.g., https://yourshop.com)

4. **Configure in Bot**
   - Set Mini App URL in @BotFather
   - Users click → opens your shop in Telegram

5. **Handle Orders**
   - Form data sent to Telegram WebApp API
   - Backend receives order notifications

## 📂 File Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Navigation & brand
│   ├── Hero.tsx        # Product showcase
│   ├── Shows.tsx       # Product gallery
│   ├── Booking.tsx     # Order form
│   ├── About.tsx       # Why us section
│   └── ...
├── locales/            # Translations
│   ├── en.json         # English
│   ├── ru.json         # Russian
│   └── vi.json         # Vietnamese
├── i18n/
│   └── config.ts       # i18n setup
└── App.tsx             # Main app
```

## 🎨 Customization Examples

### Add New Product
1. Edit `Shows.tsx` and add to `shows` array
2. Update all 3 translation files with new keys
3. Restart dev server

### Add New Section
1. Create new component in `src/components/`
2. Import in `App.tsx`
3. Add section ID for navigation
4. Add translation keys

### Change Brand Name
1. Edit `Header.tsx` - Change "Wellness Shop"
2. Edit logo/emoji if needed
3. Update `README.md`

## 🐛 Troubleshooting

### Translations not showing?
- Check key names in JSON files match component calls
- Ensure i18n config loads all languages
- Clear browser cache

### Styling looks wrong?
- Run `npm run build` to check for errors
- Verify Tailwind CSS is processing
- Check `tailwind.config.js` for color definitions

### Form not working?
- Check Telegram WebApp API is available
- Verify form validation logic
- Check browser console for errors

## 📦 Production Checklist

- [ ] Update shop name/branding
- [ ] Add product images
- [ ] Set contact info in footer
- [ ] Configure payment (if needed)
- [ ] Add terms & privacy pages
- [ ] Test all languages
- [ ] Test on mobile
- [ ] Deploy to production
- [ ] Configure Telegram bot
- [ ] Test order submission

## 🚢 Deploy to Production

### Option 1: Vercel (Recommended)
```bash
npm run build
# Connect to Vercel and deploy `dist/` folder
```

### Option 2: Netlify
```bash
npm run build
# Drag & drop `dist/` to Netlify
```

### Option 3: Your Server
```bash
npm run build
# Upload `dist/` folder to your hosting
# Configure static site serving
```

## 📞 Support

For questions about:
- **Telegram Bot**: Visit @BotFather
- **Deployment**: Check Vercel/Netlify docs
- **React/TypeScript**: React documentation
- **Tailwind CSS**: Tailwind CSS docs

## 🎉 Next Steps

1. ✅ Start dev server (`npm run dev`)
2. ✅ Customize shop info
3. ✅ Update products
4. ✅ Add images
5. ✅ Test all languages
6. ✅ Deploy to production
7. ✅ Create Telegram bot
8. ✅ Launch!

---

**Happy selling!** 🎊

For more details, see README_NEW.md or TRANSFORMATION_SUMMARY.md
