# Premium Wellness Shop - Telegram Mini App

💆🛡️ **Massage Sticks & Helmet Cover Shop**

A stunning React web application for a premium wellness shop featuring high-quality massage sticks and protective helmet covers. Built with Framer Motion, Tailwind CSS, and full internationalization (English, Russian, Vietnamese).

## 🌟 Features

### Visual Design
- **UV/Neon Theme**: Vibrant blue (#00D9FF), purple (#B300FF), and green (#39FF14) colors
- **Smooth Animations**: Framer Motion animations on all components
- **Interactive Elements**: Hover effects, glowing shadows, and particle effects
- **Responsive Design**: Mobile-first, works on all devices

### Components
- **Header**: Sticky navigation with language switcher (English, Russian, Vietnamese)
- **Hero Section**: Full-screen intro with animated background orbs and product showcase
- **Products Gallery**: 4 product types with gradient borders and hover effects
  - Acupressure Massage Stick
  - Therapeutic Massage Stick
  - Professional Roller Stick
  - Protective Helmet Covers
- **Order Form**: Complete form with date/contact selection and product inquiry
- **Footer**: Contact info and social links
- **Floating Particles**: Background animation system

### Internationalization
- **Languages**: English (en), Russian (ru), Vietnamese (vi)
- **Auto-Detection**: Automatically detects user's browser language
- **Language Switcher**: Easy language switching in header

### Products Featured
- 🧴 **Acupressure Massage Stick** - Professional-grade with traditional acupressure points
- 💆 **Therapeutic Massage Stick** - Ergonomic design for neck, shoulder and back
- 🌀 **Professional Roller Stick** - Advanced roller technology for fascia release
- 🛡️ **Protective Helmet Covers** - Durable, breathable covers for all helmet types

## 🛠 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Framer Motion** - Advanced animations
- **Tailwind CSS** - Utility-first CSS
- **i18next** - Internationalization
- **Vite** - Build tool
- **Telegram Mini App SDK** - Telegram integration

## 🚀 Quick Start

### Installation
```bash
cd /Users/netslayer/WebstormProjects/shop-tg
npm install
```

### Development
```bash
npm run dev
```
Opens at http://localhost:3000

### Production Build
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.tsx              # Navigation & language switcher
│   ├── Hero.tsx                # Hero section with animations
│   ├── Shows.tsx               # Products gallery grid
│   ├── Booking.tsx             # Order/inquiry form
│   ├── About.tsx               # Why choose us section
│   ├── Footer.tsx              # Footer with contact info
│   ├── FloatingParticles.tsx   # Background particles
│   ├── Lightning.tsx           # Lightning effect component
│   ├── LightningWishControl.tsx # Lightning settings control
│   ├── NeonBackdrop.tsx        # Neon background effects
│   ├── ElasticHueSlider.tsx    # Color slider component
│   ├── Calendar.tsx            # Date picker component
│   └── index.ts                # Component exports
├── i18n/
│   └── config.ts               # i18next configuration
├── locales/
│   ├── en.json                 # English translations
│   ├── ru.json                 # Russian translations
│   └── vi.json                 # Vietnamese translations
├── lib/
│   └── utils.ts                # Utility functions
├── App.tsx                     # Main app component
├── main.tsx                    # React entry point
└── index.css                   # Global styles
```

## 🎨 Color Palette

| Color | Hex Code | CSS Class |
|-------|----------|-----------|
| Neon Blue | #00D9FF | `text-neon-blue`, `bg-neon-blue` |
| Neon Purple | #B300FF | `text-neon-purple`, `bg-neon-purple` |
| Neon Green | #39FF14 | `text-neon-green`, `bg-neon-green` |
| Dark | #0A0E27 | `bg-neon-dark` |
| Darker | #050812 | `bg-neon-darker` |

## 🎬 Animation Features

- **Rotating gradient orbs** in hero section
- **Staggered text animations** on page load
- **Card hover effects** with glow shadows
- **Glowing text effect** on headings
- **Floating particles** throughout the page
- **Smooth scroll behavior** for all sections
- **Button interactions** with scale and shadow effects
- **Lightning effects** with color customization
- **Interactive wish/settings controls**

## 🌐 Telegram Integration

This app is designed to work as a Telegram Mini App. To integrate:

1. Create a Telegram bot with @BotFather
2. Get your bot token and user ID
3. Update the Telegram bot webhook to point to your server
4. Users can access via: `https://t.me/YourBotName/YourAppName`

The form data is sent directly to Telegram via the WebApp API when submitted.

## 📱 Responsive Breakpoints

- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px+

## 🔧 Customization

### Change Colors
Edit `tailwind.config.js`:
```js
colors: {
  neon: {
    blue: '#00D9FF',    // Change here
    purple: '#B300FF',
    green: '#39FF14',
  }
}
```

### Add New Languages
1. Create new file in `src/locales/` (e.g., `fr.json`)
2. Add to `src/i18n/config.ts`
3. Add language button in `Header.tsx`

### Update Products
Edit `src/components/Shows.tsx` and corresponding translation files in `src/locales/`:
- Modify product titles and descriptions
- Change emojis for visual representation
- Update pricing or specifications

### Modify Order Form Fields
Edit `src/components/Booking.tsx` to add/remove form fields as needed.

## 📝 Translations

All content is fully translated in three languages:
- **English** - `src/locales/en.json`
- **Russian** - `src/locales/ru.json`
- **Vietnamese** - `src/locales/vi.json`

### Language Keys Available
- `nav.*` - Navigation items
- `hero.*` - Hero section
- `shows.*` - Products section
- `booking.*` - Order form
- `about.*` - About section
- `footer.*` - Footer
- `lightning.*` - Lightning effects & wishes

## 🐛 Browser Support

- Chrome/Edge (Latest)
- Firefox (Latest)
- Safari (Latest)
- Mobile browsers

## 📄 License

Commercial use for wellness shop.

## 👨‍💻 Development

The app follows these principles:
- **Component-based architecture** for reusability
- **Minimal, clean code** with proper separation of concerns
- **Performance optimized** animations using Framer Motion
- **Accessible design** with semantic HTML
- **Mobile-first** responsive design
- **Full i18n support** for 3 languages

## 🎯 Next Steps

1. Deploy to hosting (Vercel, Netlify, or custom server)
2. Set up Telegram bot integration
3. Configure contact email/phone in Footer
4. Add actual product images
5. Implement backend for order form submissions
6. Set up payment processing (if needed)
7. Add product pricing and specifications
8. Implement analytics tracking

---

Made with 💆 and 🛡️ for Wellness & Safety
