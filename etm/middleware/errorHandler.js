'use strict';

function errorHandler(err, _req, res, _next) {
  console.error('[ETM] Request error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
}

module.exports = errorHandler;
