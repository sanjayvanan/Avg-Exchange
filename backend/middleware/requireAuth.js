const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

const requireAuth = async (req, res, next) => {
  const token = req.cookies.token; // Look in cookies instead of headers

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const { _id } = jwt.verify(token, process.env.SECRET);
    req.user = await User.findOne({ _id }).select('_id');
    next();
  } catch (error) {
    res.status(401).json({ error: 'Request is not authorized' });
  }
};

module.exports = requireAuth