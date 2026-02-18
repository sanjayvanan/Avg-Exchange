// frontend/src/components/TradingViewChart.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../config/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const TradingViewChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
  const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";

  useEffect(() => {
    const fetchTradingView = async () => {
      try {
        setLoading(true);
        // Set a 7-day window for historical data
        const now = Math.floor(Date.now() / 1000);
        const sevenDaysAgo = now - (7 * 86400);

        const { data } = await axios.get(`${API_URL}/api/1inch/charts/tradingview/1`, {
          params: {
            token0: WETH,
            token1: USDC,
            seconds: 3600, // 1H candles
            fromTimestamp: sevenDaysAgo,
            toTimestamp: now
          }
        });

        const rawItems = data.data || [];
        
        if (rawItems.length === 0) {
          setError("No historical data found.");
          return;
        }

        // Mapping 'timestamp' from the TradingView API response
        const formatted = rawItems.map(item => ({
          displayDate: new Date(item.timestamp * 1000).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          price: parseFloat(item.close)
        }));

        setChartData(formatted);
      } catch (err) {
        setError("Failed to fetch TradingView data");
      } finally {
        setLoading(false);
      }
    };

    fetchTradingView();
  }, []);

  if (loading) return <div className="h-48 flex items-center justify-center text-gray-500">Loading Historical...</div>;
  if (error) return <div className="h-48 flex items-center justify-center text-red-400 text-xs">{error}</div>;

  return (
    <div className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl p-4 mb-6">
      <h4 className="text-gray-400 text-[10px] uppercase font-bold mb-3">Historical Trend (TradingView)</h4>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <XAxis dataKey="displayDate" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px' }}
              itemStyle={{ color: '#8884d8' }}
            />
            <Area type="monotone" dataKey="price" stroke="#8884d8" fill="#8884d8" fillOpacity={0.1} strokeWidth={1} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TradingViewChart;