// frontend/src/pages/Trade.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { IoSearch } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import API_URL from '../config/api';
import TradingViewChart from '../components/TradingViewChart';

// --- CONFIG ---
const USDT_TOKEN = {
  symbol: 'USDT',
  address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  decimals: 6,
};

const DEFAULT_TOKENS = [
  { symbol: 'ETH', address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', decimals: 18 },
  USDT_TOKEN,
];

const MAX_ROWS = 12; // rows per side in order book
const ROW_H    = 22; // px — fixed row height

// --- ORDER BOOK ROW ---
const ObRow = ({ o, side }) => {
  const isAsk = side === 'ask';
  if (!o) return <div style={{ height: ROW_H }} />;
  const w = Math.min((o.amount / Math.max(o.amount, 1)) * 60, 60); // relative width capped
  return (
    <div
      className={`flex text-xs px-3 relative cursor-pointer group hover:bg-[#2b3139]`}
      style={{ height: ROW_H }}
    >
      <div
        className={`absolute inset-y-0 right-0 z-0 ${isAsk ? 'bg-[#f6465d]/10' : 'bg-[#0ecb81]/10'}`}
        style={{ width: `${w}%` }}
      />
      <span className={`flex-1 z-10 font-mono flex items-center ${isAsk ? 'text-[#f6465d]' : 'text-[#0ecb81]'}`}>
        {o.price.toFixed(4)}
      </span>
      <span className="flex-1 text-right z-10 font-mono text-[#eaecef] flex items-center justify-end">
        {o.amount.toFixed(4)}
      </span>
      <span className="flex-1 text-right z-10 font-mono text-[#eaecef] opacity-50 group-hover:opacity-100 flex items-center justify-end">
        {(o.price * o.amount).toFixed(2)}
      </span>
    </div>
  );
};

// --- MAIN COMPONENT ---
const Trade = () => {
  const { user } = useSelector((state) => state.auth);

  const [tokenList,    setTokenList]    = useState(DEFAULT_TOKENS);
  const [selectedCoin, setSelectedCoin] = useState(DEFAULT_TOKENS[0]);
  const [marketList,   setMarketList]   = useState([]);
  const [search,       setSearch]       = useState('');
  const [bids,         setBids]         = useState([]);
  const [asks,         setAsks]         = useState([]);
  const [loadingBook,  setLoadingBook]  = useState(false);
  const [inputPrice,   setInputPrice]   = useState('');
  const [inputAmount,  setInputAmount]  = useState('');
  const [sellAmount,   setSellAmount]   = useState('');

  // FETCH TOKENS
  useEffect(() => {
    axios.get(`${API_URL}/api/1inch/tokens`)
      .then(({ data }) => { if (Array.isArray(data)) setTokenList(data); })
      .catch(() => {});
  }, []);

  // FETCH MARKETS
  useEffect(() => {
    axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: { vs_currency: 'usd', order: 'market_cap_desc', per_page: 50, page: 1 },
    }).then(({ data }) => setMarketList(data)).catch(() => {});
  }, []);

  // FETCH ORDER BOOK
  const fetchOrderBook = useCallback(async () => {
    if (!selectedCoin.address || selectedCoin.symbol === 'USDT') {
      setAsks([]); setBids([]); return;
    }
    try {
      setLoadingBook(true);
      const [ar, br] = await Promise.all([
        axios.get(`${API_URL}/api/1inch/orderbook/1`, {
          params: { limit: MAX_ROWS, makerAsset: selectedCoin.address, takerAsset: USDT_TOKEN.address },
        }),
        axios.get(`${API_URL}/api/1inch/orderbook/1`, {
          params: { limit: MAX_ROWS, makerAsset: USDT_TOKEN.address, takerAsset: selectedCoin.address },
        }),
      ]);
      const fmt = (items, isAsk) =>
        (items || []).map((o) => {
          const ma = parseFloat(ethers.formatUnits(o.data.makingAmount, isAsk ? selectedCoin.decimals : USDT_TOKEN.decimals));
          const ta = parseFloat(ethers.formatUnits(o.data.takingAmount, isAsk ? USDT_TOKEN.decimals : selectedCoin.decimals));
          const price = isAsk ? ta / ma : ma / ta;
          return { price, amount: isAsk ? ma : ta };
        }).sort((a, b) => isAsk ? a.price - b.price : b.price - a.price);
      setAsks(fmt(ar.data.items, true));
      setBids(fmt(br.data.items, false));
    } catch { setAsks([]); setBids([]); }
    finally { setLoadingBook(false); }
  }, [selectedCoin]);

  useEffect(() => {
    fetchOrderBook();
    const i = setInterval(fetchOrderBook, 15000);
    return () => clearInterval(i);
  }, [fetchOrderBook]);

  // HANDLERS
  const handleCoinClick = (coin) => {
    const symbol = coin.symbol.toUpperCase();
    setSelectedCoin(tokenList.find(t => t.symbol === symbol) || { symbol, address: null, decimals: 18 });
    setInputPrice(''); setInputAmount(''); setSellAmount('');
  };

  // DERIVED STATE
  const filteredCoins = marketList.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  );
  const mkt = marketList.find(m => m.symbol.toUpperCase() === selectedCoin.symbol) || {};
  const up  = (mkt.price_change_percentage_24h ?? 0) >= 0;
  const buyTotal  = inputPrice && inputAmount ? (parseFloat(inputPrice) * parseFloat(inputAmount)).toFixed(2) : '0';
  const sellTotal = inputPrice && sellAmount  ? (parseFloat(inputPrice) * parseFloat(sellAmount)).toFixed(2)  : '0';

  /*
    ORDER BOOK SLOT LOGIC
    ─────────────────────
    Asks: sorted ascending (lowest price = index 0).
    We want to display MAX_ROWS slots. The lowest ask must appear at the
    BOTTOM slot (row MAX_ROWS-1), immediately above the mid-price.
    So slot[i] = asks[i - (MAX_ROWS - askCount)] — negative index → null (blank).

    Example: 5 asks, MAX_ROWS=12
      slots 0-6  → null  (blank rows, shown at top)
      slots 7-11 → asks[0..4] (lowest ask at slot 11 = bottom)

    Bids: sorted descending (highest bid = index 0).
    Highest bid appears at TOP slot (row 0), immediately below mid-price.
    Extra blank rows pad the bottom.
  */
  const askCount  = Math.min(asks.length, MAX_ROWS);
  const askSlots  = Array.from({ length: MAX_ROWS }, (_, i) => {
    const askIdx = i - (MAX_ROWS - askCount); // negative when i < blank rows
    return askIdx >= 0 ? asks[askIdx] : null;
  });
  const bidSlots = Array.from({ length: MAX_ROWS }, (_, i) => bids[i] ?? null);

  const PANEL_H = 'lg:h-[800px]';

  return (
    <div className="min-h-screen bg-[#0b0e11] text-[#eaecef] flex flex-col pt-4 pb-8 font-sans">

      {/* MOBILE TICKER */}
      <div className="lg:hidden p-4 border-b border-[#2b3139] flex items-center justify-between bg-[#1e2329]">
        <div className="flex items-center gap-2">
          {mkt.image && <img src={mkt.image} alt="" className="w-6 h-6 rounded-full" />}
          <span className="text-lg font-bold">{selectedCoin.symbol}/USDT</span>
        </div>
        <span className={up ? 'text-[#0ecb81]' : 'text-[#f6465d]'}>
          {mkt.price_change_percentage_24h?.toFixed(2)}%
        </span>
      </div>

      {/* DESKTOP TICKER BAR */}
      <div className="hidden lg:flex items-center gap-6 px-4 py-2 bg-[#1e2329] border-b border-[#2b3139] text-xs overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          {mkt.image && <img src={mkt.image} alt="" className="w-5 h-5 rounded-full" />}
          <span className="font-bold text-sm">
            {selectedCoin.symbol}<span className="text-[#848e9c] font-normal">/USDT</span>
          </span>
        </div>
        <span className={`font-bold text-base shrink-0 ${up ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
          ${mkt.current_price?.toLocaleString() ?? '—'}
        </span>
        {[
          ['24h Change', `${up ? '+' : ''}${mkt.price_change_percentage_24h?.toFixed(2)}%`, up],
          ['24h High',   `$${mkt.high_24h?.toLocaleString() ?? '—'}`,  null],
          ['24h Low',    `$${mkt.low_24h?.toLocaleString() ?? '—'}`,   null],
          ['Volume',     mkt.total_volume ? `$${(mkt.total_volume / 1e9).toFixed(2)}B` : '—', null],
        ].map(([label, val, colored]) => (
          <div key={label} className="flex flex-col shrink-0">
            <span className="text-[#848e9c] text-[10px]">{label}</span>
            <span className={
              colored === true  ? 'text-[#0ecb81] font-semibold' :
              colored === false ? 'text-[#f6465d] font-semibold' :
                                  'text-[#eaecef] font-semibold'
            }>{val}</span>
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2 p-2 max-w-[1600px] mx-auto w-full">

        {/* ── LEFT: ORDER BOOK ── */}
        <div className={`order-4 lg:order-1 lg:col-span-3 bg-[#1e2329] rounded-sm flex flex-col overflow-hidden border border-[#2b3139] min-h-[400px] ${PANEL_H}`}>

          {/* Column headers */}
          <div className="flex px-3 py-2 border-b border-[#2b3139] text-[10px] font-semibold text-[#848e9c] uppercase tracking-wide shrink-0">
            <span className="flex-1">Price (USDT)</span>
            <span className="flex-1 text-right">Amount</span>
            <span className="flex-1 text-right">Total</span>
          </div>

          {/* ASKS — nulls at top, real orders at bottom, flush against mid */}
          <div className="shrink-0">
            {askSlots.map((o, i) => <ObRow key={i} o={o} side="ask" />)}
          </div>

          {/* MID PRICE */}
          <div className="px-3 py-2 border-y border-[#2b3139] flex items-center justify-between bg-[#0b0e11] shrink-0">
            <span className={`text-sm font-bold ${up ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
              ${mkt.current_price?.toLocaleString() || '---'}
            </span>
            <span className="text-[10px] text-[#848e9c]">≈ ${mkt.current_price?.toLocaleString()}</span>
          </div>

          {/* BIDS — real orders at top, nulls at bottom */}
          <div className="shrink-0">
            {bidSlots.map((o, i) => <ObRow key={i} o={o} side="bid" />)}
          </div>

          {/* Empty state */}
          {!loadingBook && asks.length === 0 && bids.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-[#848e9c] text-sm">
              No open orders
            </div>
          )}
        </div>

        {/* ── CENTER: CHART + FORM ── */}
        <div className={`order-1 lg:order-2 lg:col-span-6 flex flex-col gap-2 min-h-0 ${PANEL_H}`}>

          {/* CHART */}
          <div className="h-[320px] lg:h-auto lg:flex-1 lg:min-h-0 bg-[#1e2329] rounded-sm border border-[#2b3139] overflow-hidden">
            <TradingViewChart symbol={`BINANCE:${selectedCoin.symbol}USDT`} />
          </div>

          {/* FORM */}
          <div className="shrink-0 bg-[#1e2329] rounded-sm border border-[#2b3139] p-4">
            <div className="flex flex-col lg:flex-row gap-4">

              {/* BUY SIDE */}
              <div className="flex-1 flex flex-col gap-2.5">
                <h3 className="text-[#0ecb81] font-bold text-sm">Buy {selectedCoin.symbol}</h3>

                <div className="relative">
                  <select className="w-full bg-[#2b3139] border border-[#363c45] text-[#eaecef] text-sm rounded px-3 py-2 appearance-none outline-none focus:border-[#f0b90b] cursor-pointer transition-colors">
                    <option value="limit">Limit Order</option>
                    <option value="market">Market Order</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#848e9c] text-[10px]">▼</span>
                </div>

                <div>
                  <label className="text-[#848e9c] text-[10px] mb-1 block">Price</label>
                  <div className="bg-[#2b3139] border border-[#363c45] focus-within:border-[#f0b90b] rounded flex items-center px-3 py-1.5 transition-colors">
                    <input type="number" className="bg-transparent text-[#eaecef] text-sm w-full outline-none font-mono placeholder-[#848e9c]" placeholder="0.00" value={inputPrice} onChange={e => setInputPrice(e.target.value)} />
                    <span className="text-[#848e9c] text-[10px] font-semibold pl-2 shrink-0">USDT</span>
                  </div>
                </div>

                <div>
                  <label className="text-[#848e9c] text-[10px] mb-1 block">Amount</label>
                  <div className="bg-[#2b3139] border border-[#363c45] focus-within:border-[#f0b90b] rounded flex items-center px-3 py-1.5 transition-colors">
                    <input type="number" className="bg-transparent text-[#eaecef] text-sm w-full outline-none font-mono placeholder-[#848e9c]" placeholder="0.00" value={inputAmount} onChange={e => setInputAmount(e.target.value)} />
                    <span className="text-[#848e9c] text-[10px] font-semibold pl-2 shrink-0">{selectedCoin.symbol}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1">
                  {['25%', '50%', '75%', '100%'].map(p => (
                    <button key={p} className="text-[10px] py-1 rounded border border-[#363c45] text-[#848e9c] hover:border-[#0ecb81] hover:text-[#0ecb81] bg-[#2b3139] transition-colors">{p}</button>
                  ))}
                </div>

                <div>
                  <label className="text-[#848e9c] text-[10px] mb-1 block">Total</label>
                  <div className="bg-[#2b3139] border border-[#363c45] rounded flex items-center px-3 py-1.5 opacity-60">
                    <input type="text" disabled className="bg-transparent text-[#eaecef] text-sm w-full outline-none font-mono cursor-not-allowed" value={buyTotal} />
                    <span className="text-[#848e9c] text-[10px] font-semibold pl-2 shrink-0">USDT</span>
                  </div>
                </div>

                <p className="text-[#0ecb81] text-[10px] font-medium">Available: 0.00 USDT</p>

                {!user ? (
                  <Link to="/login" className="block w-full py-2 bg-[#0ecb81] hover:bg-[#0bb874] text-white font-bold text-sm rounded text-center transition-colors">
                    Login / Sign Up
                  </Link>
                ) : (
                  <button onClick={() => alert('Complete KYC to trade.')} className="w-full py-2 bg-[#0ecb81] hover:bg-[#0bb874] text-white font-bold text-sm rounded transition-colors active:scale-[0.98]">
                    Buy {selectedCoin.symbol}
                  </button>
                )}
              </div>

              {/* DIVIDER */}
              <div className="hidden lg:block w-px bg-[#2b3139] self-stretch" />

              {/* SELL SIDE */}
              <div className="flex-1 flex flex-col gap-2.5">
                <h3 className="text-[#f6465d] font-bold text-sm">Sell {selectedCoin.symbol}</h3>

                <div className="relative">
                  <select className="w-full bg-[#2b3139] border border-[#363c45] text-[#eaecef] text-sm rounded px-3 py-2 appearance-none outline-none focus:border-[#f0b90b] cursor-pointer transition-colors">
                    <option value="limit">Limit Order</option>
                    <option value="market">Market Order</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#848e9c] text-[10px]">▼</span>
                </div>

                <div>
                  <label className="text-[#848e9c] text-[10px] mb-1 block">Price</label>
                  <div className="bg-[#2b3139] border border-[#363c45] focus-within:border-[#f0b90b] rounded flex items-center px-3 py-1.5 transition-colors">
                    <input type="number" className="bg-transparent text-[#eaecef] text-sm w-full outline-none font-mono placeholder-[#848e9c]" placeholder="0.00" value={inputPrice} readOnly />
                    <span className="text-[#848e9c] text-[10px] font-semibold pl-2 shrink-0">USDT</span>
                  </div>
                </div>

                <div>
                  <label className="text-[#848e9c] text-[10px] mb-1 block">Amount</label>
                  <div className="bg-[#2b3139] border border-[#363c45] focus-within:border-[#f0b90b] rounded flex items-center px-3 py-1.5 transition-colors">
                    <input type="number" className="bg-transparent text-[#eaecef] text-sm w-full outline-none font-mono placeholder-[#848e9c]" placeholder="0.00" value={sellAmount} onChange={e => setSellAmount(e.target.value)} />
                    <span className="text-[#848e9c] text-[10px] font-semibold pl-2 shrink-0">{selectedCoin.symbol}</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1">
                  {['25%', '50%', '75%', '100%'].map(p => (
                    <button key={p} className="text-[10px] py-1 rounded border border-[#363c45] text-[#848e9c] hover:border-[#f6465d] hover:text-[#f6465d] bg-[#2b3139] transition-colors">{p}</button>
                  ))}
                </div>

                <div>
                  <label className="text-[#848e9c] text-[10px] mb-1 block">Total</label>
                  <div className="bg-[#2b3139] border border-[#363c45] rounded flex items-center px-3 py-1.5 opacity-60">
                    <input type="text" disabled className="bg-transparent text-[#eaecef] text-sm w-full outline-none font-mono cursor-not-allowed" value={sellTotal} />
                    <span className="text-[#848e9c] text-[10px] font-semibold pl-2 shrink-0">USDT</span>
                  </div>
                </div>

                <p className="text-[#f6465d] text-[10px] font-medium">Available: 0.00 {selectedCoin.symbol}</p>

                {!user ? (
                  <Link to="/login" className="block w-full py-2 bg-[#f6465d] hover:bg-[#e03d52] text-white font-bold text-sm rounded text-center transition-colors">
                    Login / Sign Up
                  </Link>
                ) : (
                  <button onClick={() => alert('Complete KYC to trade.')} className="w-full py-2 bg-[#f6465d] hover:bg-[#e03d52] text-white font-bold text-sm rounded transition-colors active:scale-[0.98]">
                    Sell {selectedCoin.symbol}
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* ── RIGHT: MARKET LIST ── */}
        <div className={`order-3 lg:order-3 lg:col-span-3 bg-[#1e2329] rounded-sm flex flex-col overflow-hidden border border-[#2b3139] h-[400px] ${PANEL_H}`}>
          <div className="p-2.5 border-b border-[#2b3139]">
            <div className="relative">
              <IoSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#848e9c] text-xs" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-[#2b3139] border border-transparent focus:border-[#f0b90b] rounded py-1.5 pl-7 pr-3 text-xs text-white focus:outline-none transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center px-3 py-1.5 text-[10px] font-semibold text-[#848e9c] uppercase tracking-wide border-b border-[#2b3139] shrink-0">
            <span className="flex-1">Pair</span>
            <span className="w-20 text-right">Price</span>
            <span className="w-14 text-right">24h</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredCoins.map(coin => {
              const isSelected = selectedCoin.symbol === coin.symbol.toUpperCase();
              const positive   = (coin.price_change_percentage_24h ?? 0) >= 0;
              return (
                <div
                  key={coin.id}
                  onClick={() => handleCoinClick(coin)}
                  className={`flex items-center px-3 py-[5px] cursor-pointer border-b border-[#2b3139]/40 transition-colors ${isSelected ? 'bg-[#2b3139]' : 'hover:bg-[#2b3139]/50'}`}
                >
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <img src={coin.image} alt={coin.symbol} className="w-4 h-4 rounded-full shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-[#eaecef] uppercase leading-tight">{coin.symbol}</div>
                      <div className="text-[9px] text-[#848e9c] leading-tight">{(coin.total_volume / 1e6).toFixed(1)}M vol</div>
                    </div>
                  </div>
                  <div className="w-20 text-right text-[11px] font-mono text-[#eaecef]">
                    ${coin.current_price?.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </div>
                  <div className={`w-14 text-right text-[10px] font-semibold ${positive ? 'text-[#0ecb81]' : 'text-[#f6465d]'}`}>
                    {positive ? '+' : ''}{coin.price_change_percentage_24h?.toFixed(2)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Trade;