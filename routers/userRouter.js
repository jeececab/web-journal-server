const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const argon2 = require('argon2');

router.post('/users', signupUser);
router.post('/users/login', loginUser);
router.get('/users/me', me);
router.get('/users/logout', logoutUser);

async function signupUser(req, res) {
  try {
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
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');

    const valid = await argon2.verify(user.password, password);
    if (!valid) throw new Error('Invalid credentials');

    req.session.userId = user.id;
    res.status(200).send({ user });
  } catch (error) {
    res.status(401).send({ error: error.message });
  }
}

async function me(req, res) {
  try {
    if (!req.session.userId) {
      return res.status(200).send({ error: 'User not authenticated' });
    }

    const user = await User.findOne({ _id: req.session.userId });

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
      res.status(200).send();
    }
  });
}

module.exports = router;
