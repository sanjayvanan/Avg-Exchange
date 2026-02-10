const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

const createToken = (_id) => {
  return jwt.sign({_id}, process.env.SECRET, { expiresIn: '3d' })
}

// login a user
const loginUser = async (req, res, next) => {
  const {email, password} = req.body

  try {
    const user = await User.login(email, password)

    // create a token
    const token = createToken(user._id)

   // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
      sameSite: 'Lax',
      maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
    });

    res.status(200).json({ email }); // Only send email

  } catch (error) {
    res.status(400); // Set status for the global handler
    next(error);     // Forward to errorMiddleware
  }
}

// signup a user
const signupUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.signup(email, password);

    // create a token
    const token = createToken(user._id);

    // Set cookie for the new user [New]
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'Lax',
      maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
    });

    res.status(200).json({ email }); // Only send email back
  } catch (error) {
    res.status(400); 
    next(error); 
  }
};

module.exports = { signupUser, loginUser }