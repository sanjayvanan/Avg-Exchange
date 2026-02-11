// backend/routes/cryptoRoutes.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/trending', async (req, res) => {
  try {
    const response = await axios.get('https://api.coingecko.org/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 15,
        page: 1,
        sparkline: false,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error("CoinGecko Error:", error.message);
    res.status(500).json({ message: "Failed to fetch market data" });
  }
});

module.exports = router;