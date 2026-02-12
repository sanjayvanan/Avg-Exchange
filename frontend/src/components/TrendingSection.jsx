// temp/frontend/src/components/TrendingSection.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion'; //

const TrendingSection = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const { data } = await axios.get('http://localhost:4000/api/trending'); 
        if (Array.isArray(data)) setCryptoData(data);
        setLoading(false);
      } catch (err) { console.error("Market refresh failed", err); }
    };
    fetchMarketData();
    const refreshTimer = setInterval(fetchMarketData, 60000);
    return () => clearInterval(refreshTimer);
  }, []);

  if (loading) return <div className="h-96 flex items-center justify-center text-[#76808f]">Syncing Market Data...</div>;

  return (
    <section className="bg-[#0b0c0e] py-20 px-4 sm:px-10 antialiased font-sans overflow-hidden">
      <div className="max-w-[1280px] mx-auto">
        {/* Header Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-white text-4xl font-bold text-center mb-3 tracking-tight">Trending Cryptocurrencies</h2>
          <p className="text-[#76808f] text-center mb-14 text-lg">Trade 1,000+ cryptocurrencies in real time.</p>
        </motion.div>

        {/* Cards Animation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <MarketColumn title="Hot" data={cryptoData.slice(0, 5)} delay={0.1} />
          <MarketColumn title="New Coins" data={cryptoData.slice(5, 10)} delay={0.2} />
          <MarketColumn title="Top Gainers" data={cryptoData.slice(10, 15)} delay={0.3} />
        </div>
      </div>
    </section>
  );
};

const MarketColumn = ({ title, data, delay }) => (
  <motion.div 
    className="bg-[#181a20] rounded-2xl p-8 border border-[#2b2f36] shadow-2xl"
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.7, delay: delay }}
  >
    <h3 className="text-white text-xl font-bold mb-8">{title}</h3>
    <div className="flex flex-col gap-7">
      {data.map((coin) => (
        <div key={coin.id} className="flex items-center justify-between group cursor-pointer hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-4">
            <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full object-contain" />
            <div>
              <div className="text-white font-bold text-sm">{coin.symbol.toUpperCase()}</div>
              <div className="text-[#76808f] text-xs mt-1">{coin.name}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold text-sm">${coin.current_price?.toLocaleString()}</div>
            <div className={`text-xs mt-1 font-bold ${coin.price_change_percentage_24h >= 0 ? 'text-[#00D68F]' : 'text-[#ff4d4f]'}`}>
              {coin.price_change_percentage_24h?.toFixed(2)}%
            </div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

export default TrendingSection;