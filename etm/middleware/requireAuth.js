'use strict';

function requireAuth(req, _res, next) {
  // TODO: Verify JWT cookie and attach the authenticated user.
  req.user = req.user || { id: 'placeholder', role: 'admin', permissions: { etm: true, tempmon: true } };
  next();
}

module.exports = requireAuth;
