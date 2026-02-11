import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TrendingSection = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Define the fetching logic
    const fetchMarketData = async () => {
      try {
        // Pointing to your backend proxy
        const { data } = await axios.get('http://localhost:4000/api/trending'); 
        if (Array.isArray(data)) {
          setCryptoData(data);
        }
        setLoading(false);
      } catch (err) {
        console.error("Market refresh failed", err);
        // We don't set loading(false) here on subsequent failures to keep current data visible
      }
    };

    // 2. Initial fetch when component mounts
    fetchMarketData();

    // 3. Set interval for auto-update (60,000ms = 60 seconds)
    // Note: CoinGecko free data updates roughly every 60s
    const refreshTimer = setInterval(fetchMarketData, 60000);

    // 4. CLEANUP: Clear timer when user leaves the page
    return () => clearInterval(refreshTimer);
  }, []);

  if (loading) return <div className="h-96 flex items-center justify-center text-[#76808f]">Syncing Market Data...</div>;

  return (
    <section className="bg-[#0b0c0e] py-20 px-4 sm:px-10 antialiased font-sans">
      <div className="max-w-[1280px] mx-auto">
        <h2 className="text-white text-4xl font-bold text-center mb-3 tracking-tight">Trending Cryptocurrencies</h2>
        <p className="text-[#76808f] text-center mb-14 text-lg">Trade 1,000+ cryptocurrencies in real time.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <MarketColumn title="Hot" data={cryptoData.slice(0, 5)} />
          <MarketColumn title="New Coins" data={cryptoData.slice(5, 10)} />
          <MarketColumn title="Top Gainers" data={cryptoData.slice(10, 15)} />
        </div>

        <div className="text-center mt-12">
          <button className="text-[#76808f] hover:text-[#00D68F] font-bold text-sm transition-colors cursor-pointer">
            View More →
          </button>
        </div>
      </div>
    </section>
  );
};

// --- Sub-Component for Individual Columns ---
const MarketColumn = ({ title, data }) => (
  <div className="bg-[#181a20] rounded-2xl p-8 border border-[#2b2f36] shadow-2xl">
    <h3 className="text-white text-xl font-bold mb-8">{title}</h3>
    <div className="flex flex-col gap-7">
      {data.map((coin) => (
        <div key={coin.id} className="flex items-center justify-between group cursor-pointer hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-4">
            {/* Real coin icon from API */}
            <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full object-contain bg-white/5" />
            <div>
              <div className="text-white font-bold text-sm leading-none">{coin.symbol.toUpperCase()}</div>
              <div className="text-[#76808f] text-xs font-medium mt-1">{coin.name}</div>
            </div>
          </div>
          <div className="text-right">
            {/* Formatted Price */}
            <div className="text-white font-bold text-sm">
              ${coin.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            {/* Trend Logic */}
            <div className={`text-xs mt-1 font-bold ${coin.price_change_percentage_24h >= 0 ? 'text-[#00D68F]' : 'text-[#ff4d4f]'}`}>
              {coin.price_change_percentage_24h >= 0 ? '+' : ''}
              {coin.price_change_percentage_24h?.toFixed(2)}%
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TrendingSection;