import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { NeonBackdrop } from './NeonBackdrop';

interface Product {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  shadowColor: string;
}

export const Shows = () => {
  const { t } = useTranslation();

  const handleProductBooking = (productTitle: string) => {
    // Get existing message from sessionStorage
    const existingMessage = sessionStorage.getItem('bookingShowMessage') || '';
    
    // Check if this product is already in the message
    if (existingMessage.includes(productTitle)) {
      // Product is already added, just scroll to booking
      const bookingSection = document.getElementById('booking');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    
    // Append new product to the list
    const newMessage = existingMessage
      ? `${existingMessage}\n✓ ${productTitle}`
      : `${t('shows.interestedIn')}\n✓ ${productTitle}`;
    
    sessionStorage.setItem('bookingShowMessage', newMessage);
    
    // Dispatch custom event to notify Booking component
    window.dispatchEvent(new Event('showAdded'));
    
    // Scroll to booking section
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const shows: Product[] = [
    {
      id: 'dryIce',
      title: t('shows.dryIce'),
      description: t('shows.dryIceDesc'),
      icon: '🧴',
      color: 'from-neon-blue to-neon-purple',
      shadowColor: 'shadow-neon',
    },
    {
      id: 'liquidNitrogen',
      title: t('shows.liquidNitrogen'),
      description: t('shows.liquidNitrogenDesc'),
      icon: '💆',
      color: 'from-neon-purple to-neon-green',
      shadowColor: 'shadow-neon-purple',
    },
    {
      id: 'tesla',
      title: t('shows.tesla'),
      description: t('shows.teslaDesc'),
      icon: '🌀',
      color: 'from-neon-green to-neon-blue',
      shadowColor: 'shadow-neon-green',
    },
    {
      id: 'chemicalFire',
      title: t('shows.chemicalFire'),
      description: t('shows.chemicalFireDesc'),
      icon: '🛡️',
      color: 'from-neon-blue to-neon-green',
      shadowColor: 'shadow-neon',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section id="shows" className="py-20 md:py-28 relative">
      <NeonBackdrop intensity="soft" className="opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-neon-darker/60 to-neon-dark/60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-extrabold tracking-tight text-white text-center mb-8"
        >
          {t('shows.title')}
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {shows.map((show) => (
            <motion.div
              key={show.id}
              variants={cardVariants}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden cursor-pointer group relative h-full"
            >
              <div className="px-6 md:px-8 py-8 md:py-10 h-full flex flex-col">
                <motion.div
                  className="text-5xl md:text-6xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block"
                  whileHover={{ rotate: 5 }}
                >
                  {show.icon}
                </motion.div>
                <h3 className="text-xl md:text-2xl font-semibold text-white mb-3">
                  {show.title}
                </h3>
                <p className="text-white/70 group-hover:text-white/80 transition-colors text-sm md:text-base leading-relaxed flex-grow">
                  {show.description}
                </p>
                
                {/* Book button */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleProductBooking(show.title)}
                  className="mt-6 w-full bg-white text-neon-darker font-semibold py-3 rounded-xl border border-white/10 hover:bg-white/90 transition-all duration-200"
                >
                  {t('shows.book')}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
