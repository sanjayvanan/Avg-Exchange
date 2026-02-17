// frontend/src/pages/Trade.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers'; 
import { tradeStyles as s } from '../components/TradeStyles';
import API_URL from '../config/api';
import { IoWalletOutline, IoSwapVertical, IoList } from 'react-icons/io5';

const Trade = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  
  // Form States
  const [payAmount, setPayAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');

  // 1. Connect Wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setAccount(await signer.getAddress());
      } catch (error) {
        console.error("User rejected connection", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  // 2. Fetch Orderbook from YOUR Backend
  useEffect(() => {
    const fetchOrderBook = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/1inch/orderbook/1`, {
          params: { limit: 50 } 
        });

        // Handle 1inch response structure
        if (data && Array.isArray(data.items)) {
           setOrders(data.items); 
        } else if (Array.isArray(data)) {
           setOrders(data);
        } else {
           setOrders([]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Failed to load orderbook", err);
        setOrders([]);
        setLoading(false);
      }
    };

    fetchOrderBook();
  }, []);

  // Helper: Format raw big numbers to readable strings
  const formatAmount = (amount) => {
    if (!amount) return '0.00';
    try {
      // Defaulting to 18 decimals for generic display. 
      // In a real app, you'd check the token address to know if it's 6 (USDC) or 18 (ETH).
      const formatted = ethers.formatUnits(amount, 18); 
      return parseFloat(formatted).toFixed(4); // Show 4 decimal places
    } catch (e) {
      return '0.00';
    }
  };

  const handleSubmitOrder = async () => {
    if (!account) return alert("Connect wallet first");
    
    try {
      const payload = {
        orderHash: "0x123...", 
        signature: "0xabc...", 
        data: {
          makerAsset: "0x...", 
          takerAsset: "0x...", 
          makingAmount: payAmount,
          takingAmount: receiveAmount,
          maker: account,
        }
      };

      const res = await axios.post(`${API_URL}/api/1inch/orderbook/1`, payload);
      alert("Order Placed! Response: " + JSON.stringify(res.data));
      
    } catch (err) {
      console.error("Order Failed", err);
      alert("Failed to place order. Check console.");
    }
  };

  return (
    <div className={s.section}>
      <div className={s.glow} />
      <div className={s.container}>
        
        {/* --- LEFT SIDE: TRADE FORM --- */}
        <div className={s.formSection}>
          <div className={s.header}>
            <h2 className={s.title}>Limit Order</h2>
            {account && (
              <span className="text-xs text-[#00D68F] bg-[#00D68F]/10 px-2 py-1 rounded">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            )}
          </div>

          <div className={s.inputGroup}>
            <label className={s.label}>You Pay</label>
            <div className={s.inputWrapper}>
              <input 
                type="number" 
                className={s.input} 
                placeholder="0.00"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />
              <span className={s.currency}>USDC</span>
            </div>
          </div>

          <div className="flex justify-center mb-6 text-gray-500">
            <IoSwapVertical size={24} />
          </div>

          <div className={s.inputGroup}>
            <label className={s.label}>You Receive</label>
            <div className={s.inputWrapper}>
              <input 
                type="number" 
                className={s.input} 
                placeholder="0.00"
                value={receiveAmount}
                onChange={(e) => setReceiveAmount(e.target.value)}
              />
              <span className={s.currency}>ETH</span>
            </div>
          </div>

          {!account ? (
            <button onClick={connectWallet} className={s.walletBtn}>
              <IoWalletOutline size={20} /> Connect Wallet
            </button>
          ) : (
            <button onClick={handleSubmitOrder} className={s.submitBtn}>
              Place Limit Order
            </button>
          )}
        </div>

        {/* --- RIGHT SIDE: ORDERBOOK --- */}
        <div className={s.bookSection}>
          <div className={s.bookHeader}>
            <IoList className="text-[#00D68F]" /> 1inch Orderbook (Mainnet)
          </div>

          {loading ? (
            <div className={s.centerState}>Loading Orders...</div>
          ) : (
            <div className={s.tableWrapper}>
              <table className={s.table}>
                <thead className={s.thead}>
                  <tr>
                    <th className={s.th}>Maker</th>
                    <th className={s.th}>Maker Amt</th>
                    <th className={s.th}>Taker Amt</th>
                    <th className={s.th}>Created</th>
                  </tr>
                </thead>
                <tbody className={s.tbody}>
                  {orders.map((order, idx) => (
                    <tr key={idx} className={s.tr}>
                      <td className={s.td}>
                        <span className="text-[#00D68F]">
                          {order.data?.maker?.slice(0, 6)}...
                        </span>
                      </td>
                      <td className={s.td}>
                        {/* Use the new formatAmount helper */}
                        {formatAmount(order.data?.makingAmount)}
                      </td>
                      <td className={s.td}>
                        {formatAmount(order.data?.takingAmount)}
                      </td>
                      <td className={s.td}>
                        {new Date(order.createDateTime).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-10 text-gray-500">
                        No active orders found.
                      </td>
                    </tr>
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