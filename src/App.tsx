import './index.css';
import { Suspense } from 'react';
import { useState } from 'react';
import { Header, Hero, About, Booking, Footer, FloatingParticles, Shop, CartDrawer } from './components';
import AdminPanel from './components/AdminPanel';
import { CartProvider, useCart } from './shop/cart';
import { ToastProvider } from './lib/toast';

function AppInner() {
  const cart = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  
  const handleLanguageChange = (_lang: string) => {
    // i18n change handled inside Header; this is kept for API compatibility
  };

  const handleCheckout = () => {
    const el = document.getElementById('booking');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  // Check if admin panel should be shown via URL hash
  if (typeof window !== 'undefined' && window.location.hash === '#admin') {
    return <AdminPanel />;
  }

  return (
    <Suspense fallback={<div className="bg-neon-darker min-h-screen flex items-center justify-center text-white/70">Loading…</div>}>
      <div className="min-h-screen text-white overflow-hidden bg-neon-darker">
        <FloatingParticles />
        <Header
          onLanguageChange={handleLanguageChange}
          cartCount={cart.count}
          onOpenCart={() => setCartOpen(true)}
        />
        <main>
          <Hero />
          <Shop />
          <About />
          <Booking />
        </main>
        <Footer />

        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={handleCheckout} />
      </div>
    </Suspense>
  );
}

function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <AppInner />
      </CartProvider>
    </ToastProvider>
  );
}

export default App;
