const jwt = require('jsonwebtoken');

const auth = function(req, res, next) {
  // get token from header
  const token = req.header('x-auth-token');

  // if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // verify token valid or not
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;