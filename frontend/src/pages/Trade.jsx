// frontend/src/pages/Trade.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { ethers } from 'ethers'; 
import { tradeStyles as s } from '../components/TradeStyles';
import API_URL from '../config/api';
import { IoWalletOutline, IoSwapVertical, IoList } from 'react-icons/io5';

// Import your custom chart components
import TokenChart from '../components/TokenChart';
import TradingViewChart from '../components/TradingViewChart';

// Preset of common tokens supported by 1inch on Ethereum (Chain 1)
const SUPPORTED_TOKENS = [
  { symbol: 'USDC', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', decimals: 6 },
  { symbol: 'WETH', address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', decimals: 18 },
  { symbol: 'DAI', address: '0x6b175474e89094c44da98b954eedeac495271d0f', decimals: 18 },
  { symbol: '1INCH', address: '0x111111111117dc0aa78b770fa6a738034120c302', decimals: 18 }
];

const Trade = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  
  // Dynamic Token State
  const [payToken, setPayToken] = useState(SUPPORTED_TOKENS[0]); // Default: USDC
  const [receiveToken, setReceiveToken] = useState(SUPPORTED_TOKENS[1]); // Default: WETH
  
  const [payAmount, setPayAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');

  // Connect Wallet Logic
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setAccount(await signer.getAddress());
      } catch (error) { console.error("User rejected connection", error); }
    } else { alert("Please install MetaMask!"); }
  };

  // Dynamic Fetch Orderbook: Filters orders based on selected tokens
  const fetchOrderBook = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/1inch/orderbook/1`, {
        params: { 
          limit: 20, 
          makerAsset: payToken.address, 
          takerAsset: receiveToken.address 
        } 
      });
      setOrders(Array.isArray(data) ? data : (data.items || []));
    } catch (err) {
      console.error("Failed to load orderbook", err);
      setOrders([]);
    } finally { setLoading(false); }
  }, [payToken, receiveToken]);

  // Real-time polling: refresh data every 30 seconds
  useEffect(() => {
    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 30000);
    return () => clearInterval(interval);
  }, [fetchOrderBook]);

  const formatAmount = (amount, decimals = 18) => {
    if (!amount) return '0.00';
    try {
      const formatted = ethers.formatUnits(amount, decimals); 
      return parseFloat(formatted).toFixed(4);
    } catch (e) { return '0.00'; }
  };

  return (
    <div className={s.section}>
      <div className={s.glow} />
      <div className={s.container}>
        
        {/* --- LEFT SIDE: CHARTS & TRADE FORM --- */}
        <div className={s.formSection}>
          
          {/* DYNAMIC CHARTS: Updating via Props */}
          <div className="space-y-4 mb-8">
             <TokenChart 
                token0={payToken.address} 
                token1={receiveToken.address} 
                symbol={`${payToken.symbol}/${receiveToken.symbol}`} 
             />
             <TradingViewChart 
                token0={payToken.address} 
                token1={receiveToken.address} 
             />
          </div>

          <div className={s.header}>
            <h2 className={s.title}>Limit Order</h2>
            {account && (
              <span className="text-xs text-[#00D68F] bg-[#00D68F]/10 px-2 py-1 rounded">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            )}
          </div>

          {/* Token Selection for "You Pay" */}
          <div className={s.inputGroup}>
            <label className={s.label}>You Pay</label>
            <div className="flex gap-2">
              <select 
                className="bg-[#111] text-white p-2 rounded border border-white/10 text-sm"
                value={payToken.symbol}
                onChange={(e) => setPayToken(SUPPORTED_TOKENS.find(t => t.symbol === e.target.value))}
              >
                {SUPPORTED_TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
              </select>
              <div className={s.inputWrapper}>
                <input 
                  type="number" className={s.input} placeholder="0.00"
                  value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center my-4 text-gray-500">
            <IoSwapVertical size={24} />
          </div>

          {/* Token Selection for "You Receive" */}
          <div className={s.inputGroup}>
            <label className={s.label}>You Receive</label>
            <div className="flex gap-2">
              <select 
                className="bg-[#111] text-white p-2 rounded border border-white/10 text-sm"
                value={receiveToken.symbol}
                onChange={(e) => setReceiveToken(SUPPORTED_TOKENS.find(t => t.symbol === e.target.value))}
              >
                {SUPPORTED_TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.symbol}</option>)}
              </select>
              <div className={s.inputWrapper}>
                <input 
                  type="number" className={s.input} placeholder="0.00"
                  value={receiveAmount} onChange={(e) => setReceiveAmount(e.target.value)}
                />
              </div>
            </div>
          </div>

          {!account ? (
            <button onClick={connectWallet} className={s.walletBtn}>
              <IoWalletOutline size={20} /> Connect Wallet
            </button>
          ) : (
            <button className={s.submitBtn}>Place Limit Order</button>
          )}
        </div>

        {/* --- RIGHT SIDE: ORDERBOOK --- */}
        <div className={s.bookSection}>
          <div className={s.bookHeader}>
            <IoList className="text-[#00D68F]" /> 1inch Orderbook: {payToken.symbol}/{receiveToken.symbol}
          </div>

          {loading ? (
            <div className={s.centerState}>Refreshing Orders...</div>
          ) : (
            <div className={s.tableWrapper}>
              <table className={s.table}>
                <thead className={s.thead}>
                  <tr>
                    <th className={s.th}>Maker</th>
                    <th className={s.th}>{payToken.symbol} Amt</th>
                    <th className={s.th}>{receiveToken.symbol} Amt</th>
                    <th className={s.th}>Time</th>
                  </tr>
                </thead>
                <tbody className={s.tbody}>
                  {orders.map((order, idx) => (
                    <tr key={idx} className={s.tr}>
                      <td className={s.td}>
                        <span className="text-[#00D68F]">{order.data?.maker?.slice(0, 6)}...</span>
                      </td>
                      <td className={s.td}>{formatAmount(order.data?.makingAmount, payToken.decimals)}</td>
                      <td className={s.td}>{formatAmount(order.data?.takingAmount, receiveToken.decimals)}</td>
                      <td className={s.td}>{new Date(order.createDateTime).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan="4" className="text-center py-10 text-gray-500">No active orders found for this pair.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trade;