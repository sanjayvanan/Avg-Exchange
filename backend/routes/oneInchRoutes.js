// backend/routes/oneInchRoutes.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = process.env.ONE_INCH_API_KEY;
const BASE_URL = 'https://api.1inch.dev';

// Helper to get headers
const getHeaders = () => ({
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
});

// Helper for error handling
const handleRequest = async (res, promise) => {
  try {
    const response = await promise;
    res.status(200).json(response.data);
  } catch (error) {
    console.error("1inch API Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      message: "1inch API Request Failed", 
      details: error.response?.data || error.message 
    });
  }
};

// ==========================================
// 1️⃣ SWAP API (Pathfinder)
// ==========================================

// @route   GET /api/1inch/swap/quote
// @desc    Get a quote for a swap (Read-only preview)
router.get('/swap/quote', async (req, res) => {
  const { chainId, src, dst, amount } = req.query;
  const url = `${BASE_URL}/swap/v6.0/${chainId}/quote`;
  await handleRequest(res, axios.get(url, { headers: getHeaders(), params: req.query }));
});

// @route   GET /api/1inch/swap/build
// @desc    Get executable swap transaction (Calldata)
router.get('/swap/build', async (req, res) => {
  const { chainId, src, dst, amount, from, slippage } = req.query;
  const url = `${BASE_URL}/swap/v6.0/${chainId}/swap`;
  await handleRequest(res, axios.get(url, { headers: getHeaders(), params: req.query }));
});

// @route   GET /api/1inch/approve/spender
// @desc    Get the 1inch router address to approve tokens for
router.get('/approve/spender', async (req, res) => {
  const { chainId } = req.query;
  const url = `${BASE_URL}/swap/v6.0/${chainId}/approve/spender`;
  await handleRequest(res, axios.get(url, { headers: getHeaders() }));
});

// ==========================================
// 5️⃣ & 9️⃣ TOKENS & BALANCES
// ==========================================

// @route   GET /api/1inch/tokens
// @desc    Get supported token list
router.get('/tokens', async (req, res) => {
  const { chainId } = req.query;
  const url = `${BASE_URL}/token/v1.2/${chainId}`;
  await handleRequest(res, axios.get(url, { headers: getHeaders() }));
});

// @route   GET /api/1inch/balances/:address
// @desc    Get wallet balances for specific tokens
router.get('/balances/:address', async (req, res) => {
  const { chainId } = req.query;
  const { address } = req.params;
  const url = `${BASE_URL}/balance/v1.2/${chainId}/balances/${address}`;
  
  // 1inch Balance API usually requires a POST body with a list of token addresses 
  // or checks all whitelisted if simpler. We'll forward the POST body if provided,
  // or change to POST if you want to send a specific list of tokens.
  // For simplicity, we use the method that checks all non-zero balances if available, 
  // otherwise, we assume the frontend sends the token addresses in the body (switch to POST).
  
  // NOTE: For specific token balances, 1inch v1.2 usually expects a POST with valid token addresses.
  // We will assume this is a POST route masquerading as GET for simplicity, or change to router.post below.
  // Let's implement a clean POST for balances.
});

router.post('/balances/:address', async (req, res) => {
  const { chainId } = req.query;
  const { address } = req.params;
  const tokenAddresses = req.body.tokens; // Array of token addresses
  
  const url = `${BASE_URL}/balance/v1.2/${chainId}/balances/${address}`;
  await handleRequest(res, axios.post(url, tokenAddresses, { headers: getHeaders() }));
});

// ==========================================
// 4️⃣ SPOT PRICE API
// ==========================================

// @route   POST /api/1inch/price
// @desc    Get spot prices for tokens
router.post('/price', async (req, res) => {
  const { chainId } = req.query;
  const { tokens, currency } = req.body; // tokens: array of addresses
  const url = `${BASE_URL}/price/v1.1/${chainId}`;
  await handleRequest(res, axios.post(url, { tokens, currency }, { headers: getHeaders() }));
});

// ==========================================
// 3️⃣ ORDERBOOK API (Limit Orders)
// ==========================================

// @route   GET /api/1inch/orderbook/:chainId
// @desc    Get Limit Orders
router.get('/orderbook/:chainId', async (req, res) => {
  const { chainId } = req.params;
  const url = `${BASE_URL}/orderbook/v4.1/${chainId}/all`;
  await handleRequest(res, axios.get(url, { headers: getHeaders(), params: req.query }));
});

// @route   POST /api/1inch/orderbook/:chainId
// @desc    Submit a limit order
router.post('/orderbook/:chainId', async (req, res) => {
  const { chainId } = req.params;
  const url = `${BASE_URL}/orderbook/v4.1/${chainId}`;
  await handleRequest(res, axios.post(url, req.body, { headers: getHeaders() }));
});

// ==========================================
// 8️⃣ CHARTS API
// ==========================================

router.get('/charts/candle/:chainId', async (req, res) => {
  const { chainId } = req.params;
  const { token0, token1, seconds } = req.query;
  const url = `${BASE_URL}/charts/v1.0/chart/aggregated/candle/${token0}/${token1}/${seconds}/${chainId}`;
  await handleRequest(res, axios.get(url, { headers: getHeaders() }));
});

router.get('/tokens', async (req, res) => {
  const { chainId = 1 } = req.query;
  const url = `https://api.1inch.dev/token/v1.2/${chainId}`;
  
  try {
    const response = await axios.get(url, { headers: getHeaders() });
    
    // 1inch returns an object { "0x..": { symbol: "ETH".. } }
    // We convert it to an array for easier frontend use: [{ symbol: "ETH", address: "0x.." }, ...]
    const tokenList = Object.values(response.data).map(t => ({
      symbol: t.symbol,
      name: t.name,
      address: t.address,
      decimals: t.decimals,
      logoURI: t.logoURI
    }));

    res.status(200).json(tokenList);
  } catch (error) {
    console.error("Token Fetch Error:", error.message);
    res.status(500).json({ message: "Failed to fetch tokens" });
  }
});

module.exports = router;