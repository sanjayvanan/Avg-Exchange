const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validator = require('validator');
const crypto = require('crypto');

const createToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET, { expiresIn: '3d' });
};

// Helper: Generate a random referral code (e.g., "AVG-X7Z9")
const generateReferralCode = () => {
  // Generates 4 random bytes and converts to hex, simpler and collision-resistant enough for now
  return 'AVG-' + crypto.randomBytes(3).toString('hex').toUpperCase();
};

const signupUser = async (req, res, next) => {
  const { email, password, referralCode } = req.body;
  
  try {
    if (!email || !password) throw Error('All fields must be filled');
    if (!validator.isEmail(email)) throw Error('Email not valid');
    if (!validator.isStrongPassword(password)) throw Error('Password not strong enough');

    // 1. Check if email already exists
    const userCheck = await db.query('SELECT * FROM "User" WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) throw Error('Email already in use');

    // 2. Handle Referral Logic
    let referredBy_id = null;
    if (referralCode) {
      const referrerCheck = await db.query('SELECT id FROM "User" WHERE referral_code = $1', [referralCode]);
      if (referrerCheck.rows.length > 0) {
        referredBy_id = referrerCheck.rows[0].id;
      } else {
        // Optional: Throw error if code is invalid, or just ignore it. 
        // For better UX, we usually ignore invalid codes or let the user know. 
        // Here we just ignore it to allow signup to proceed.
      }
    }

    // 3. Prepare data for insertion
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    // Generate a unique code for this new user
    // (In a massive scale app, you'd check for collisions here, but unlikely for now)
    const newReferralCode = generateReferralCode();

    // 4. Insert New User
    // We insert email, password, referral_code, and referred_by (which might be null)
    const result = await db.query(
      'INSERT INTO "User" (email, password, referral_code, referred_by) VALUES ($1, $2, $3, $4) RETURNING id, referral_code',
      [email, hash, newReferralCode, referredBy_id]
    );
    
    const user = result.rows[0];

    // 5. Increment Referral Count for the Referrer (if applicable)
    if (referredBy_id) {
      await db.query(
        'UPDATE "User" SET referral_count = referral_count + 1 WHERE id = $1',
        [referredBy_id]
      );
    }

    const token = createToken(user.id);
    
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 3 * 24 * 60 * 60 * 1000 });
    
    // Return email and their new referral code
    res.status(200).json({ email, referralCode: user.referral_code });

  } catch (error) {
    res.status(400);
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) throw Error('All fields must be filled');

    const result = await db.query('SELECT * FROM "User" WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw Error('Invalid credentials');
    }

    const token = createToken(user.id);
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 3 * 24 * 60 * 60 * 1000 });
    res.status(200).json({ email, referralCode: user.referral_code });
  } catch (error) {
    res.status(400);
    next(error);
  }
};

module.exports = { signupUser, loginUser };