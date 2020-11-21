const auth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(200).send({ error: 'User not authenticated' });
  } else {
    req.userId = req.session.userId;
    next();
  }
};

module.exports = auth;
