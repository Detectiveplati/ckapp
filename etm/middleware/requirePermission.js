'use strict';

function requirePermission(permission) {
  return (req, res, next) => {
    if (req.user && req.user.role === 'admin') return next();
    if (req.user && req.user.permissions && req.user.permissions[permission]) return next();
    return res.status(403).json({ error: `Missing permission: ${permission}` });
  };
}

module.exports = requirePermission;
