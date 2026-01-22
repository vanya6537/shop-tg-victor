# Science Show Telegram Mini App

🔬✨ **Mind-Blowing Science Show Experience for Da Nang Expats**

A stunning React web application for a science show company featuring dry ice, liquid nitrogen, Tesla coils, and chemical fire demonstrations. Built with Framer Motion, Tailwind CSS, and full internationalization.

## 🌟 Features

### Visual Design
- **UV/Neon Theme**: Vibrant blue (#00D9FF), purple (#B300FF), and green (#39FF14) colors
- **Smooth Animations**: Framer Motion animations on all components
- **Interactive Elements**: Hover effects, glowing shadows, and particle effects
- **Responsive Design**: Mobile-first, works on all devices

### Components
- **Header**: Sticky navigation with language switcher
- **Hero Section**: Full-screen intro with animated background orbs
- **Shows Gallery**: 4 main show types with gradient borders and hover effects
- **Booking Form**: Complete form with date/time/guest selection
- **Footer**: Contact info and social links
- **Floating Particles**: Background animation system

### Internationalization
- **Languages**: English, Russian, Vietnamese
- **Auto-Detection**: Automatically detects user's browser language
- **Language Switcher**: Easy language switching in header

### Shows Featured
- ❄️ **Dry Ice Explosion** - Mesmerizing fog effects with LED synchronization
- 🧊 **Liquid Nitrogen Magic** - Extreme cold demonstrations
- ⚡ **Tesla Coil Lightning** - High-voltage spectacular displays
- 🔥 **Chemical Fire Show** - Colored flames and pyrotechnic effects

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
cd /Users/netslayer/WebstormProjects/science-show
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
│   ├── Header.tsx           # Navigation & language switcher
│   ├── Hero.tsx             # Hero section with animations
│   ├── Shows.tsx            # Show gallery grid
│   ├── Booking.tsx          # Booking form
│   ├── Footer.tsx           # Footer with contact info
│   ├── FloatingParticles.tsx # Background particles
│   └── index.ts             # Component exports
├── i18n/
│   └── config.ts            # i18next configuration
├── locales/
│   ├── en.json              # English translations
│   ├── ru.json              # Russian translations
│   └── vi.json              # Vietnamese translations
├── App.tsx                  # Main app component
├── main.tsx                 # React entry point
└── index.css                # Global styles
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

## 🌐 Telegram Integration

This app is designed to work as a Telegram Mini App. To integrate:

1. Create a Telegram bot with @BotFather
2. Get your bot token and user ID
3. Update the Telegram bot webhook to point to your server
4. Users can access via: `https://t.me/YourBotName/YourAppName`

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

### Add New Sections
Create new component in `src/components/` following the pattern of existing components.

## 📝 Translations

All content is fully translated in three languages. Update by editing JSON files in `src/locales/`.

## 🐛 Browser Support

- Chrome/Edge (Latest)
- Firefox (Latest)
- Safari (Latest)
- Mobile browsers

## 📄 License

Commercial use for Science Show Da Nang company.

## 👨‍💻 Development

The app follows these principles:
- **Component-based architecture** for reusability
- **Minimal, clean code** with proper separation of concerns
- **Performance optimized** animations using Framer Motion
- **Accessible design** with semantic HTML
- **Mobile-first** responsive design

## 🎯 Next Steps

1. Deploy to hosting (Vercel, Netlify, or custom server)
2. Set up Telegram bot integration
3. Configure contact email/phone in Footer
4. Add actual show images/videos
5. Implement backend for booking form submissions
6. Add analytics tracking

---

Made with ⚡ and 🧪 for Science Show Da Nang
