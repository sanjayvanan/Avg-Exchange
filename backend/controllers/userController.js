const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validator = require('validator');

const createToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET, { expiresIn: '3d' });
};

const signupUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) throw Error('All fields must be filled');
    if (!validator.isEmail(email)) throw Error('Email not valid');
    if (!validator.isStrongPassword(password)) throw Error('Password not strong enough');

    // SQL check for existing user
    const userCheck = await db.query('SELECT * FROM "User" WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) throw Error('Email already in use');

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // SQL Insert
    const result = await db.query(
      'INSERT INTO "User" (email, password) VALUES ($1, $2) RETURNING id',
      [email, hash]
    );

    const token = createToken(result.rows[0].id);
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'Lax', maxAge: 3 * 24 * 60 * 60 * 1000 });
    res.status(200).json({ email });
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
    res.status(200).json({ email });
  } catch (error) {
    res.status(400);
    next(error);
  }
};

module.exports = { signupUser, loginUser };