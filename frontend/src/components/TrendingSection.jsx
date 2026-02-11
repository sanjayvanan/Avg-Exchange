import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TrendingSection = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const { data } = await axios.get(
          'https://api.coingecko.org/api/v3/coins/markets', 
          { params: { vs_currency: 'usd', order: 'market_cap_desc', per_page: 15, page: 1 } }
        );
        setCryptoData(data);
        setLoading(false);
      } catch (err) {
        console.error("Market data fetch failed", err);
        setLoading(false);
      }
    };
    fetchMarketData();
  }, []);

  if (loading) return <div className="h-96 flex items-center justify-center text-[#76808f]">Syncing Market Data...</div>;

  return (
    <section className="bg-[#0b0c0e] py-20 px-4 sm:px-10 antialiased">
      <div className="max-w-[1280px] mx-auto">
        <h2 className="text-white text-4xl font-bold text-center mb-3">Trending Cryptocurrencies</h2>
        <p className="text-[#76808f] text-center mb-14 text-lg">Trade 1,000+ cryptocurrencies in real time.</p>

        {/* Triple Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <MarketColumn title="Hot" data={cryptoData.slice(0, 5)} />
          <MarketColumn title="New Coins" data={cryptoData.slice(5, 10)} />
          <MarketColumn title="Top Gainers" data={cryptoData.slice(10, 15)} />
        </div>

        <div className="text-center mt-12">
          <button className="text-[#76808f] hover:text-[#00D68F] font-semibold transition-colors">
            View More →
          </button>
        </div>
      </div>
    </section>
  );
};

const MarketColumn = ({ title, data }) => (
  <div className="bg-[#181a20] rounded-2xl p-8 border border-[#2b2f36] shadow-2xl">
    <h3 className="text-white text-xl font-bold mb-8">{title}</h3>
    <div className="flex flex-col gap-7">
      {data.map((coin) => (
        <div key={coin.id} className="flex items-center justify-between group cursor-pointer">
          <div className="flex items-center gap-4">
            <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
            <div>
              <div className="text-white font-bold text-sm">{coin.symbol.toUpperCase()}</div>
              <div className="text-[#76808f] text-xs font-medium">{coin.name}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white font-bold text-sm">${coin.current_price.toLocaleString()}</div>
            <div className={`text-xs mt-1 font-bold ${coin.price_change_percentage_24h >= 0 ? 'text-[#00D68F]' : 'text-[#ff4d4f]'}`}>
              {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TrendingSection;