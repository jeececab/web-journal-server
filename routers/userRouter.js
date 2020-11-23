const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const argon2 = require('argon2');
const auth = require('../middleware/auth');

router.post('/users', signupUser);
router.post('/users/login', loginUser);
router.get('/users/me', auth, me);
router.get('/users/logout', logoutUser);

async function signupUser(req, res) {
  try {
    const usersCount = await User.find().countDocuments();
    if (usersCount > 5) return res.status(400).send({ error: 'Too many users, sorry' });

    if (req.body.password.length < 8) throw new Error('Password must be at least 7 characters');

    const user = new User(req.body);

    const hashedPassword = await argon2.hash(user.password);
    user.password = hashedPassword;

    await user.save();

    req.session.userId = user._id;

    res.status(201).send({ user });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
}

async function loginUser(req, res) {
  try {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');

    const valid = await argon2.verify(user.password, password);
    if (!valid) throw new Error('Invalid credentials');

    req.session.userId = user.id;
    res.send({ user });
  } catch (error) {
    res.status(401).send({ error: error.message });
  }
}

async function me(req, res) {
  try {
    const user = await User.findOne({ _id: req.userId });
    res.status(200).send({ user });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
}

async function logoutUser(req, res) {
  req.session.destroy(err => {
    if (err) {
      res.status(400).send({ error: 'Failed to destroy session' });
    } else {
      res.clearCookie('mip');
      res.send();
    }
  });
}

module.exports = router;
