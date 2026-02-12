// temp/frontend/src/pages/Home.jsx
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { heroStyles as h } from '../components/NavbarStyles';
import TrendingSection from '../components/TrendingSection';
import heroVideo from '../assets/hero_video.mp4';

const Home = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="bg-[#0b0c0e]">
      {/* h-screen: Ensures section is 100% of the viewport height.
        overflow-hidden: Prevents video overflow from causing scrollbars.
      */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* object-cover: Makes the video fill the area like a background image.
          min-w-full min-h-full: Guarantees coverage across all aspect ratios.
        */}
        <video
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        {/* Semi-transparent overlay to make text readable */}
        <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10" />

        {/* Content Animation: Fades and slides up on page load */}
        <motion.div 
          className="relative z-20 text-center px-4 max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h1 className="text-white text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            The Future of <span className="text-[#00D68F]">Exchange</span>
          </h1>

          <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            {user
              ? `Welcome back, ${user.email}. Access your dashboard to manage your global assets.`
              : "Trade, swap, and manage your digital assets with professional-grade tools and industry-leading security."
            }
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#00D68F] text-black px-10 py-4 rounded-lg font-bold text-lg hover:bg-[#00b377] transition-all">
              Get Started
            </button>
            <button className="px-10 py-4 rounded-lg font-bold text-lg border border-white/20 text-white hover:bg-white/10 transition-all">
              Learn More
            </button>
          </div>
        </motion.div>
      </section>

      {/* Scroll-triggered reveal for TrendingSection.
        viewport={{ once: true }}: Animation only plays the first time it's seen.
      */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
      >
        <TrendingSection />
      </motion.div>
    </div>
  );
};

export default Home;