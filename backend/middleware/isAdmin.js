// middleware to check if user is admin

const isAdmin = function (req, res, next) {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({ msg: 'Admin access denied' });
  }
  next();
};


module.exports = isAdmin;
