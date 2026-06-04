'use strict';

const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
  res.json({ ok: true, route: 'GET /api/etm/config', TODO: 'Return ETM config.' });
});

router.put('/', (_req, res) => {
  res.json({ ok: true, route: 'PUT /api/etm/config', TODO: 'Update ETM config.' });
});

module.exports = router;
