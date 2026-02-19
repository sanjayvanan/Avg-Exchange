// frontend/src/pages/Trade.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { IoList, IoSearch } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import API_URL from '../config/api';
import TradingViewChart from '../components/TradingViewChart';

// --- CONFIG ---
const USDT_TOKEN = { 
  symbol: 'USDT', 
  address: '0xdac17f958d2ee523a2206206994597c13d831ec7', 
  decimals: 6 
};

const DEFAULT_TOKENS = [
  { symbol: 'ETH', address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', decimals: 18 },
  USDT_TOKEN
];

const Trade = () => {
  // --- REDUX & STATE ---
  const { user } = useSelector((state) => state.auth);
  
  const [tokenList, setTokenList] = useState(DEFAULT_TOKENS); 
  const [selectedCoin, setSelectedCoin] = useState(DEFAULT_TOKENS[0]); 
  const [marketList, setMarketList] = useState([]); 
  const [search, setSearch] = useState('');
  
  // Orderbook
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const [loadingBook, setLoadingBook] = useState(false);
  
  // Trade Form
  const [side, setSide] = useState('buy'); 
  const [inputPrice, setInputPrice] = useState('');
  const [inputAmount, setInputAmount] = useState('');

  // --- DATA FETCHING ---

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/1inch/tokens`); 
        if (Array.isArray(data)) setTokenList(data); 
      } catch (err) {
        console.error("Token Fetch Error", err);
      }
    };
    fetchTokens();
  }, []);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const { data } = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
            params: { vs_currency: 'usd', order: 'market_cap_desc', per_page: 50, page: 1 }
        });
        setMarketList(data);
      } catch (err) {
        console.error("Market Data Error", err);
      }
    };
    fetchMarkets();
  }, []);

  const fetchOrderBook = useCallback(async () => {
    if (!selectedCoin.address || selectedCoin.symbol === 'USDT') {
      setAsks([]); setBids([]); return;
    }

    try {
      setLoadingBook(true);
      const [asksRes, bidsRes] = await Promise.all([
        axios.get(`${API_URL}/api/1inch/orderbook/1`, { 
          params: { limit: 15, makerAsset: selectedCoin.address, takerAsset: USDT_TOKEN.address } 
        }),
        axios.get(`${API_URL}/api/1inch/orderbook/1`, { 
          params: { limit: 15, makerAsset: USDT_TOKEN.address, takerAsset: selectedCoin.address } 
        })
      ]);

      const formatOrder = (items, isAsk) => (items || []).map(o => {
          const makerAmt = parseFloat(ethers.formatUnits(o.data.makingAmount, isAsk ? selectedCoin.decimals : USDT_TOKEN.decimals));
          const takerAmt = parseFloat(ethers.formatUnits(o.data.takingAmount, isAsk ? USDT_TOKEN.decimals : selectedCoin.decimals));
          const price = isAsk ? (takerAmt / makerAmt) : (makerAmt / takerAmt);
          return { price, amount: isAsk ? makerAmt : takerAmt };
      }).sort((a, b) => isAsk ? a.price - b.price : b.price - a.price);

      setAsks(formatOrder(asksRes.data.items, true));
      setBids(formatOrder(bidsRes.data.items, false));
    } catch (err) {
      console.warn("Orderbook Fetch Failed");
      setAsks([]); setBids([]);
    } finally {
      setLoadingBook(false);
    }
  }, [selectedCoin]);

  useEffect(() => {
    fetchOrderBook();
    const i = setInterval(fetchOrderBook, 15000);
    return () => clearInterval(i);
  }, [fetchOrderBook]);

  // --- HANDLERS ---
  const handleCoinClick = (coin) => {
    const symbol = coin.symbol.toUpperCase();
    const foundToken = tokenList.find(t => t.symbol === symbol);
    setSelectedCoin(foundToken || { symbol, address: null, decimals: 18 }); 
    setInputPrice('');
    setInputAmount('');
  };

  const filteredCoins = marketList.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const currentMarketData = marketList.find(m => m.symbol.toUpperCase() === selectedCoin.symbol) || {};

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] flex flex-col pt-4 pb-8 font-sans">
      
      {/* --- MOBILE TICKER HEADER --- */}
      <div className="lg:hidden p-4 border-b border-[#2b3139] flex items-center justify-between bg-[#1e2329]">
        <div className="flex items-center gap-2">
          {currentMarketData.image && <img src={currentMarketData.image} alt="coin" className="w-6 h-6 rounded-full" />}
          <span className="text-lg font-bold">{selectedCoin.symbol}/USDT</span>
        </div>
        <div className={currentMarketData.price_change_percentage_24h >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"}>
          {currentMarketData.price_change_percentage_24h?.toFixed(2)}%
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 p-2 max-w-[1600px] mx-auto w-full">
        
        {/* --- LEFT PANEL: ORDER BOOK --- */}
        {/* FIXED: Added lg:h-[800px] to constrain height and force scroll */}
        <div className="order-4 lg:order-1 lg:col-span-3 bg-[#1e2329] rounded-sm flex flex-col overflow-hidden border border-[#2b3139] min-h-[400px] lg:h-[800px]">
          <div className="flex p-3 border-b border-[#2b3139] font-semibold text-xs text-[#848e9c]">
            <span className="flex-1 text-left">Price(USDT)</span>
            <span className="flex-1 text-right">Amount</span>
            <span className="flex-1 text-right">Total</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            {/* ASKS */}
            <div className="flex flex-col-reverse">
                {asks.slice(0, 15).map((o, i) => {
                    const width = Math.min((o.amount / 10) * 100, 100); 
                    return (
                        <div key={i} className="flex text-xs py-1 px-3 relative hover:bg-[#2b3139] cursor-pointer group">
                            <div className="absolute top-0 right-0 bottom-0 bg-[#f6465d]/10 z-0 transition-all" style={{ width: `${width}%` }}></div>
                            <span className="flex-1 text-left z-10 font-mono text-[#f6465d]">{o.price.toFixed(4)}</span>
                            <span className="flex-1 text-right z-10 font-mono text-[#eaecef]">{o.amount.toFixed(4)}</span>
                            <span className="flex-1 text-right z-10 font-mono text-[#eaecef] opacity-60 group-hover:opacity-100">{(o.price * o.amount).toFixed(2)}</span>
                        </div>
                    );
                })}
            </div>

            {/* Current Price */}
            <div className="py-2 px-3 border-y border-[#2b3139] my-1 flex items-center justify-between bg-[#0b0e11] sticky top-0 bottom-0 z-20">
                <span className={`text-lg font-bold ${currentMarketData.price_change_percentage_24h >= 0 ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                    ${currentMarketData.current_price?.toLocaleString() || '---'}
                </span>
                <span className="text-xs text-[#848e9c]">≈ ${currentMarketData.current_price?.toLocaleString()}</span>
            </div>

            {/* BIDS */}
            <div>
                {bids.slice(0, 15).map((o, i) => {
                     const width = Math.min((o.amount / 10) * 100, 100);
                     return (
                        <div key={i} className="flex text-xs py-1 px-3 relative hover:bg-[#2b3139] cursor-pointer group">
                            <div className="absolute top-0 right-0 bottom-0 bg-[#0ecb81]/10 z-0 transition-all" style={{ width: `${width}%` }}></div>
                            <span className="flex-1 text-left z-10 font-mono text-[#0ecb81]">{o.price.toFixed(4)}</span>
                            <span className="flex-1 text-right z-10 font-mono text-[#eaecef]">{o.amount.toFixed(4)}</span>
                            <span className="flex-1 text-right z-10 font-mono text-[#eaecef] opacity-60 group-hover:opacity-100">{(o.price * o.amount).toFixed(2)}</span>
                        </div>
                    );
                })}
            </div>

            {!loadingBook && asks.length === 0 && bids.length === 0 && (
                 <div className="absolute inset-0 flex items-center justify-center text-[#848e9c] text-sm">No open orders</div>
            )}
          </div>
        </div>

        {/* --- CENTER PANEL: CHART & FORM --- */}
        <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col gap-2 min-h-0">
          <div className="h-[400px] lg:h-[500px] bg-[#1e2329] rounded-sm border border-[#2b3139] overflow-hidden relative">
             <TradingViewChart symbol={`BINANCE:${selectedCoin.symbol}USDT`} />
          </div>

          <div className="bg-[#1e2329] rounded-sm border border-[#2b3139] p-4 flex flex-col shrink-0">
             <div className="flex gap-4 border-b border-[#2b3139] mb-4">
                <button onClick={() => setSide('buy')} className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${side === 'buy' ? 'text-[#0ecb81] border-[#0ecb81]' : 'text-[#848e9c] border-transparent hover:text-[#eaecef]'}`}>Buy {selectedCoin.symbol}</button>
                <button onClick={() => setSide('sell')} className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${side === 'sell' ? 'text-[#f6465d] border-[#f6465d]' : 'text-[#848e9c] border-transparent hover:text-[#eaecef]'}`}>Sell {selectedCoin.symbol}</button>
             </div>
             <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 flex flex-col gap-3 justify-center">
                    <div className="bg-[#2b3139] rounded-md px-3 py-2 flex items-center border border-transparent focus-within:border-[#f0b90b] transition-colors">
                        <span className="text-[#848e9c] text-xs font-bold uppercase w-16">Price</span>
                        <input type="number" className="bg-transparent text-right text-white w-full outline-none font-mono" placeholder="0.00" value={inputPrice} onChange={e => setInputPrice(e.target.value)} />
                        <span className="text-[#eaecef] text-xs pl-2">USDT</span>
                    </div>
                    <div className="bg-[#2b3139] rounded-md px-3 py-2 flex items-center border border-transparent focus-within:border-[#f0b90b] transition-colors">
                        <span className="text-[#848e9c] text-xs font-bold uppercase w-16">Amount</span>
                        <input type="number" className="bg-transparent text-right text-white w-full outline-none font-mono" placeholder="0.00" value={inputAmount} onChange={e => setInputAmount(e.target.value)} />
                        <span className="text-[#eaecef] text-xs pl-2">{selectedCoin.symbol}</span>
                    </div>
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                   <div className="flex justify-between text-xs text-[#848e9c] mb-2 lg:mb-0">
                      <span>Avbl Balance:</span>
                      <span className="text-[#eaecef] font-mono">0.00 USDT</span> 
                   </div>
                   {!user ? (
                      <div className="flex gap-2 mt-auto">
                        <Link to="/login" className="flex-1 py-3 bg-[#2b3139] hover:bg-[#363c45] text-[#eaecef] rounded font-bold text-center transition">Log In</Link>
                        <Link to="/signup" className="flex-1 py-3 bg-[#f0b90b] hover:bg-[#d9a505] text-black rounded font-bold text-center transition">Register</Link>
                      </div>
                   ) : (
                      <button onClick={() => alert("Please complete KYC verification to trade.")} className={`w-full py-3 rounded font-bold text-lg shadow-lg mt-auto transition-transform active:scale-[0.98] ${side === 'buy' ? 'bg-[#0ecb81] hover:bg-[#0bb874] text-white' : 'bg-[#f6465d] hover:bg-[#e03d52] text-white'}`}>
                        {side === 'buy' ? 'Buy' : 'Sell'} {selectedCoin.symbol}
                      </button>
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* --- RIGHT PANEL: MARKET LIST --- */}
        {/* FIXED: Added lg:h-[800px] to constrain height and force scroll */}
        <div className="order-3 lg:order-3 lg:col-span-3 bg-[#1e2329] rounded-sm flex flex-col overflow-hidden border border-[#2b3139] h-[400px] lg:h-[800px]">
            <div className="p-3 border-b border-[#2b3139]">
                <div className="relative group">
                    <IoSearch className="absolute left-3 top-2.5 text-[#848e9c] group-focus-within:text-[#f0b90b]" />
                    <input type="text" placeholder="Search Coin" className="w-full bg-[#2b3139] border border-transparent focus:border-[#f0b90b] rounded-full py-1.5 pl-9 pr-3 text-sm text-white focus:outline-none transition-all" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredCoins.map(coin => (
                    <div key={coin.id} onClick={() => handleCoinClick(coin)} className={`flex items-center justify-between p-3 cursor-pointer transition-colors border-b border-[#2b3139]/50 ${selectedCoin.symbol === coin.symbol.toUpperCase() ? 'bg-[#2b3139]' : 'hover:bg-[#2b3139]/50'}`}>
                        <div className="flex items-center gap-2 flex-1">
                            <img src={coin.image} alt={coin.symbol} className="w-5 h-5 rounded-full" />
                            <div className="flex flex-col">
                                <span className="font-bold text-sm text-[#eaecef] uppercase">{coin.symbol}</span>
                                <span className="text-[10px] text-[#848e9c]">Vol {coin.total_volume?.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex-1 text-right text-sm font-mono text-[#eaecef]">${coin.current_price?.toLocaleString()}</div>
                    </div>
                ))}
            </div>
        </div>
      </div>
      
    </div>
  );
};

export default Trade;