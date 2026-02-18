// frontend/src/pages/Trade.jsx
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { IoWalletOutline, IoList, IoSearch } from 'react-icons/io5';
import API_URL from '../config/api';
import TradingViewChart from '../components/TradingViewChart';

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

// Default list for instant load (Good practice to keep this!)
const DEFAULT_TOKENS = [
  { symbol: 'ETH', address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', decimals: 18, logoURI: 'https://tokens.1inch.io/0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee.png' },
  { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6, logoURI: 'https://tokens.1inch.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png' },
  { symbol: 'USDT', address: '0xdac17f958d2ee523a2206206994597c13d831ec7', decimals: 6, logoURI: 'https://tokens.1inch.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png' },
];

const Trade = () => {
  const [account, setAccount] = useState(null);
  
  // --- DYNAMIC TOKEN STATE ---
  const [tokenList, setTokenList] = useState(DEFAULT_TOKENS); // Start with default, fill with API later
  const [selectedCoin, setSelectedCoin] = useState(DEFAULT_TOKENS[0]); // ETH
  const [quoteToken, setQuoteToken] = useState(DEFAULT_TOKENS[1]);     // USDC
  
  const [marketList, setMarketList] = useState([]); // For Right Panel (Price data)
  const [search, setSearch] = useState('');
  
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const [loadingBook, setLoadingBook] = useState(false);
  const [side, setSide] = useState('buy'); 
  const [inputPrice, setInputPrice] = useState('');
  const [inputAmount, setInputAmount] = useState('');

  // --- 1. FETCH ALL TOKENS (The "Correct" Way) ---
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/1inch/tokens`);
        // We assume 1inch returns a massive array. 
        // We prioritize our default list at the top, then add the rest.
        // Filter out tokens without symbols to keep list clean
        const validTokens = data.filter(t => t.symbol && t.address);
        setTokenList(validTokens); 
      } catch (err) {
        console.error("Failed to load token list, falling back to defaults", err);
      }
    };
    fetchTokens();
  }, []);

  // --- 2. FETCH MARKET DATA (Right Panel) ---
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const { data } = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
            params: { vs_currency: 'usd', order: 'market_cap_desc', per_page: 50, page: 1 }
        });
        setMarketList(data);
      } catch (err) {
        // Fallback data
        setMarketList([
            { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 65000, price_change_percentage_24h: 2.5, image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
            { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3500, price_change_percentage_24h: 1.2, image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
        ]);
      }
    };
    fetchMarkets();
  }, []);

  // --- 3. FETCH ORDERBOOK ---
  const fetchOrderBook = useCallback(async () => {
    // Look up the full token details from our Dynamic List
    const baseToken = tokenList.find(t => t.symbol === selectedCoin.symbol);

    if (!baseToken || !baseToken.address) {
      setAsks([]); setBids([]); return; 
    }

    try {
      setLoadingBook(true);
      const quote = quoteToken; // Still hardcoded USDC for the "Quote" side usually

      const [asksRes, bidsRes] = await Promise.all([
        axios.get(`${API_URL}/api/1inch/orderbook/1`, { params: { limit: 15, makerAsset: baseToken.address, takerAsset: quote.address } }),
        axios.get(`${API_URL}/api/1inch/orderbook/1`, { params: { limit: 15, makerAsset: quote.address, takerAsset: baseToken.address } })
      ]);

      const formatOrder = (items, isAsk) => (items || []).map(o => {
          const makerAmt = parseFloat(ethers.formatUnits(o.data.makingAmount, isAsk ? baseToken.decimals : quote.decimals));
          const takerAmt = parseFloat(ethers.formatUnits(o.data.takingAmount, isAsk ? quote.decimals : baseToken.decimals));
          // Price = Taker / Maker
          const price = isAsk ? (takerAmt / makerAmt) : (makerAmt / takerAmt);
          return { price, amount: isAsk ? makerAmt : takerAmt };
      }).sort((a, b) => isAsk ? a.price - b.price : b.price - a.price);

      setAsks(formatOrder(asksRes.data.items, true));
      setBids(formatOrder(bidsRes.data.items, false));
    } catch (err) {
      setAsks([]); setBids([]);
    } finally {
      setLoadingBook(false);
    }
  }, [selectedCoin, quoteToken, tokenList]);

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
      } catch (e) { console.error(e); }
    } else { alert("Install MetaMask"); }
  };

  const handleCoinClick = (coin) => {
    const symbol = coin.symbol.toUpperCase();
    const foundToken = tokenList.find(t => t.symbol === symbol);
    
    // If found in 1inch list, use it. If not, just update symbol for Chart.
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
            <IoList /> Order Book <span className="text-gray-500">({selectedCoin.symbol}/{quoteToken.symbol})</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <table className={s.bookTable}>
              <thead>
                <tr><th className={s.th}>Price</th><th className={s.th}>Amount</th><th className={s.th}>Total</th></tr>
              </thead>
              <tbody>
                {loadingBook && <tr><td colSpan="3" className="text-center py-4 text-gray-500">Loading...</td></tr>}
                {!loadingBook && asks.length === 0 && bids.length === 0 && (
                  <tr><td colSpan="3" className="text-center py-10 text-gray-600">No orders for {selectedCoin.symbol}</td></tr>
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
                    <td className={`${s.td} text-[#00D68F]`}>{o.price.toFixed(4)}</td>
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
              <span className="text-gray-500 text-sm">Price ({quoteToken.symbol})</span>
              <input type="number" className={`${s.input} text-right`} placeholder="0.00" value={inputPrice} onChange={e => setInputPrice(e.target.value)} />
            </div>
            <div className={s.inputRow}>
              <span className="text-gray-500 text-sm">Amount ({selectedCoin.symbol})</span>
              <input type="number" className={`${s.input} text-right`} placeholder="0.00" value={inputAmount} onChange={e => setInputAmount(e.target.value)} />
            </div>
            {!account ? (
               <button onClick={connectWallet} className={s.loginBtn}><IoWalletOutline className="inline mr-2" /> Connect Wallet</button>
            ) : (
               <button onClick={() => alert("KYC Required")} className={`${s.actionBtn} ${side === 'buy' ? 'bg-[#00D68F]' : 'bg-[#ff4d4f] text-white'}`}>
                 {side === 'buy' ? 'Buy' : 'Sell'} {selectedCoin.symbol}
               </button>
            )}
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