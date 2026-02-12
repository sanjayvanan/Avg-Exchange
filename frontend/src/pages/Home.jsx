// src/pages/Home.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  heroStyles, 
  statsStyles, 
  ctaStyles 
} from '../components/HomeStyles';
import TrendingSection from '../components/TrendingSection';
import FeaturesSection from '../components/FeaturesSection';
import StepsSection from '../components/StepsSection'; // <--- New Import
import Footer from '../components/Footer';
import heroVideo from '../assets/Droneshot.mp4';

const Home = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="bg-[#0b0c0e] min-h-screen selection:bg-[#00D68F] selection:text-black">
      
      {/* --- HERO SECTION --- */}
      <section className={heroStyles.section}>
        <video
          className={heroStyles.video}
          autoPlay loop muted playsInline
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className={heroStyles.overlay} />

        <motion.div 
          className={heroStyles.content}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className={heroStyles.title}>
            The Future of <span className="text-[#00D68F]">Exchange</span>
          </h1>
          
          <p className={heroStyles.subtitle}>
            {user
              ? `Welcome back, ${user.email}. Your portfolio is ready.`
              : "Trade, swap, and manage your assets with the world's most secure and advanced crypto exchange platform."
            }
          </p>

          <div className={heroStyles.ctaGroup}>
            <button className={heroStyles.ctaPrimary}>
              Start Trading Now
            </button>
            <button className={heroStyles.ctaSecondary}>
              Explore Markets
            </button>
          </div>
        </motion.div>
      </section>

      {/* --- STATS BAR --- */}
      <div className={statsStyles.section}>
        <div className={statsStyles.container}>
          <div className={statsStyles.grid}>
            <StatItem value="$48 Billion" label="Quarterly Volume" />
            <StatItem value="100+" label="Countries Supported" />
            <StatItem value="10 Million+" label="Verified Users" />
            <StatItem value="<0.10%" label="Lowest Fees" />
          </div>
        </div>
      </div>

      {/* --- TRENDING MARKETS --- */}
      <TrendingSection />

      {/* --- NEW: STEPS SECTION (Get Started) --- */}
      <StepsSection />

      {/* --- FEATURES SECTION --- */}
      <FeaturesSection />

      {/* --- CALL TO ACTION (CTA) --- */}
      <section className={ctaStyles.section}>
        <motion.div 
          className={ctaStyles.container}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className={ctaStyles.glow} />
          <div className={ctaStyles.content}>
            <h2 className={ctaStyles.title}>Ready to start your journey?</h2>
            <p className={ctaStyles.desc}>
              Join millions of users worldwide and trade with confidence on the most secure platform.
            </p>
            <div className={ctaStyles.buttonGroup}>
              <button className={ctaStyles.primaryBtn}>Create Free Account</button>
              <button className={ctaStyles.secondaryBtn}>Download App</button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- FOOTER --- */}
      <Footer />
    </div>
  );
};

// Helper Component for Stats
const StatItem = ({ value, label }) => (
  <div className={statsStyles.item}>
    <div className={statsStyles.value}>{value}</div>
    <div className={statsStyles.label}>{label}</div>
  </div>
);

export default Home;