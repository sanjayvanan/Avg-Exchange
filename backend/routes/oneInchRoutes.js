// backend/routes/oneInchRoutes.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = process.env.ONE_INCH_API_KEY;

// Helper to get headers
const getHeaders = () => ({
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
});

// @desc    Submit a limit order to 1inch Orderbook
// @route   POST /api/1inch/orderbook/:chainId
router.post('/orderbook/:chainId', async (req, res) => {
  const { chainId } = req.params;
  const orderData = req.body; // Expects the signed order object from frontend

  // 1inch API URL for submitting orders
  const url = `https://api.1inch.dev/orderbook/v4.1/${chainId}`;

  try {
    const response = await axios.post(url, orderData, {
      headers: getHeaders(),
      params: {},
      paramsSerializer: {
        indexes: null,
      },
    });
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error("1inch Post Order Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      message: "Failed to submit order to 1inch", 
      details: error.response?.data 
    });
  }
});

// @desc    Get Limit Orders (Orderbook)
// @route   GET /api/1inch/orderbook/:chainId
router.get('/orderbook/:chainId', async (req, res) => {
  const { chainId } = req.params;
  // Pass query params like limit, page, statuses from frontend
  const queryParams = req.query; 

  const url = `https://api.1inch.dev/orderbook/v4.1/${chainId}/all`;

  try {
    const response = await axios.get(url, {
      headers: getHeaders(),
      params: queryParams // e.g., ?limit=100&sortBy=createDateTime
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("1inch Get Orderbook Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      message: "Failed to fetch 1inch orderbook" 
    });
  }
});

module.exports = router;