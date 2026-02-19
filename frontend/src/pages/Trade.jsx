// frontend/src/pages/Trade.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { IoWalletOutline, IoList, IoSearch } from 'react-icons/io5';
import API_URL from '../config/api';
import TradingViewChart from '../components/TradingViewChart';
// Add imports for Redux and Router
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

// --- STYLES ---
const s = {
  page: `h-screen bg-black text-white flex flex-col pt-20 overflow-hidden`, 
  container: `flex-1 grid grid-cols-12 gap-2 p-2 h-full`, 
  leftPanel: `col-span-3 bg-[#111] rounded-lg border border-white/5 flex flex-col overflow-hidden h-full`,
  bookHeader: `p-3 border-b border-white/5 font-bold text-sm flex items-center gap-2 text-[#00D68F]`,
  bookTable: `w-full text-xs`,
  th: `text-gray-500 font-normal p-2 text-right first:text-left`,
  td: `p-1.5 text-right first:text-left font-mono text-gray-300`,
  centerPanel: `col-span-6 flex flex-col gap-2 h-full min-h-0`, 
  chartBox: `flex-1 bg-[#111] rounded-lg border border-white/5 overflow-hidden relative min-h-0`,
  formBox: `h-64 bg-[#111] rounded-lg border border-white/5 p-4 flex flex-col shrink-0`, 
  rightPanel: `col-span-3 bg-[#111] rounded-lg border border-white/5 flex flex-col overflow-hidden h-full`,
  searchBox: `p-3 border-b border-white/5`,
  searchInput: `w-full bg-black border border-white/10 rounded p-2 text-sm text-white focus:outline-none focus:border-[#00D68F]`,
  coinList: `flex-1 overflow-y-auto custom-scrollbar`,
  coinItem: `flex items-center justify-between p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 transition-colors`,
  tabGroup: `flex gap-4 border-b border-white/10 mb-4`,
  tab: (active) => `pb-2 text-sm cursor-pointer ${active ? 'text-[#00D68F] border-b-2 border-[#00D68F]' : 'text-gray-500 hover:text-white'}`,
  inputRow: `flex justify-between items-center bg-black/50 p-3 rounded border border-white/10 mb-3`,
  input: `bg-transparent text-white text-lg outline-none w-full`,
  actionBtn: `w-full py-3 rounded font-bold text-black mt-auto transition-transform active:scale-95`,
  loginBtn: `w-full py-3 rounded font-bold bg-[#00D68F] text-black mt-auto`,
};

// --- CONSTANTS ---
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
  const [account, setAccount] = useState(null);
  
  // Get user from Redux store
  const { user } = useSelector((state) => state.auth);
  
  // --- STATE ---
  const [tokenList, setTokenList] = useState(DEFAULT_TOKENS); 
  const [selectedCoin, setSelectedCoin] = useState(DEFAULT_TOKENS[0]); // Default: ETH
  
  // Right Panel Data
  const [marketList, setMarketList] = useState([]); 
  const [search, setSearch] = useState('');
  
  // Orderbook Data
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const [loadingBook, setLoadingBook] = useState(false);
  
  // Form Data
  const [side, setSide] = useState('buy'); 
  const [inputPrice, setInputPrice] = useState('');
  const [inputAmount, setInputAmount] = useState('');

  // --- 1. FETCH TOKENS ---
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

  // --- 2. FETCH MARKETS (Right Panel) ---
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const { data } = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
            params: { vs_currency: 'usd', order: 'market_cap_desc', per_page: 50, page: 1 }
        });
        setMarketList(data);
      } catch (err) {}
    };
    fetchMarkets();
  }, []);

  // --- 3. FETCH ORDERBOOK (ALWAYS vs USDT) ---
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
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setAccount(await signer.getAddress());
      } catch (e) {}
    } else { alert("Install MetaMask"); }
  };

  const handleCoinClick = (coin) => {
    const symbol = coin.symbol.toUpperCase();
    const foundToken = tokenList.find(t => t.symbol === symbol);
    if (foundToken) setSelectedCoin(foundToken);
    else setSelectedCoin({ symbol, address: null, decimals: 18 }); 
  };

  const filteredCoins = marketList.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={s.page}>
      <div className={s.container}>
        
        {/* LEFT: ORDERBOOK */}
        <div className={s.leftPanel}>
          <div className={s.bookHeader}>
            <IoList /> Order Book <span className="text-gray-500">({selectedCoin.symbol}/USDT)</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className={s.bookTable}>
              <thead>
                <tr><th className={s.th}>Price (USDT)</th><th className={s.th}>Amount</th><th className={s.th}>Total</th></tr>
              </thead>
              <tbody>
                {loadingBook && <tr><td colSpan="3" className="text-center py-4 text-gray-500">Loading...</td></tr>}
                {!loadingBook && asks.length === 0 && bids.length === 0 && (
                  <tr><td colSpan="3" className="text-center py-10 text-gray-600">No Limit Orders</td></tr>
                )}
                {asks.slice(0, 15).reverse().map((o, i) => (
                  <tr key={i} className="hover:bg-red-500/10 cursor-pointer">
                    <td className={`${s.td} text-red-400`}>{o.price.toFixed(4)}</td>
                    <td className={s.td}>{o.amount.toFixed(4)}</td>
                    <td className={s.td}>{(o.price * o.amount).toFixed(2)}</td>
                  </tr>
                ))}
                {bids.slice(0, 15).map((o, i) => (
                  <tr key={i} className="hover:bg-green-500/10 cursor-pointer">
                    {/* Fixed Green Color Visibility with !important */}
                    <td className={`${s.td} !text-[#00D68F]`}>{o.price.toFixed(4)}</td>
                    <td className={s.td}>{o.amount.toFixed(4)}</td>
                    <td className={s.td}>{(o.price * o.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CENTER: CHART & FORM */}
        <div className={s.centerPanel}>
          <div className={s.chartBox}>
             <TradingViewChart symbol={`BINANCE:${selectedCoin.symbol}USDT`} />
          </div>
          <div className={s.formBox}>
            <div className={s.tabGroup}>
              <div onClick={() => setSide('buy')} className={s.tab(side === 'buy')}>Buy {selectedCoin.symbol}</div>
              <div onClick={() => setSide('sell')} className={s.tab(side === 'sell')}>Sell {selectedCoin.symbol}</div>
            </div>
            <div className={s.inputRow}>
              <span className="text-gray-500 text-sm">Price (USDT)</span>
              <input type="number" className={`${s.input} text-right`} placeholder="0.00" value={inputPrice} onChange={e => setInputPrice(e.target.value)} />
            </div>
            <div className={s.inputRow}>
              <span className="text-gray-500 text-sm">Amount ({selectedCoin.symbol})</span>
              <input type="number" className={`${s.input} text-right`} placeholder="0.00" value={inputAmount} onChange={e => setInputAmount(e.target.value)} />
            </div>

            {/* NEW BOTTOM SECTION: LOGIN / SIGNUP or BUY / SELL */}
            <div className="mt-auto flex gap-3">
              {!user ? (
                <>
                  <Link to="/login" className="flex-1 bg-[#111] border border-white/10 text-white py-3 rounded text-center font-bold hover:bg-white/5 transition">
                    Log In
                  </Link>
                  <Link to="/signup" className="flex-1 bg-[#00D68F] text-black py-3 rounded text-center font-bold hover:bg-[#00c080] transition">
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => alert("Please complete KYC verification to trade.")} 
                    className="flex-1 bg-[#00D68F] text-black py-3 rounded font-bold hover:bg-[#00c080] transition"
                  >
                    Buy {selectedCoin.symbol}
                  </button>
                  <button 
                    onClick={() => alert("Please complete KYC verification to trade.")} 
                    className="flex-1 bg-[#ff4d4f] text-white py-3 rounded font-bold hover:bg-[#e04445] transition"
                  >
                    Sell {selectedCoin.symbol}
                  </button>
                </>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT: MARKET LIST */}
        <div className={s.rightPanel}>
          <div className={s.searchBox}>
            <div className="relative">
                <IoSearch className="absolute left-3 top-2.5 text-gray-500" />
                <input type="text" placeholder="Search..." className={`${s.searchInput} pl-9`} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          <div className={s.coinList}>
             {filteredCoins.map(coin => (
               <div key={coin.id} onClick={() => handleCoinClick(coin)} className={s.coinItem}>
                 <div className="flex items-center gap-2">
                   <img src={coin.image} alt={coin.symbol} className="w-6 h-6 rounded-full" />
                   <div>
                     <div className="font-bold text-sm uppercase">{coin.symbol}</div>
                     <div className="text-xs text-gray-500">{coin.name}</div>
                   </div>
                 </div>
                 <div className="text-right">
                   <div className="text-sm font-mono">${coin.current_price.toLocaleString()}</div>
                   <div className={`text-xs ${coin.price_change_percentage_24h >= 0 ? 'text-[#00D68F]' : 'text-red-500'}`}>
                     {coin.price_change_percentage_24h.toFixed(2)}%
                   </div>
                 </div>
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Trade;