'use strict';

const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
  res.json({ ok: true, route: 'GET /api/etm/calibrations', TODO: 'List calibration records.' });
});

router.get('/due', (_req, res) => {
  res.json({ ok: true, route: 'GET /api/etm/calibrations/due', TODO: 'List devices due for calibration.' });
});

router.post('/', (_req, res) => {
  res.status(201).json({ ok: true, route: 'POST /api/etm/calibrations', TODO: 'Create calibration record and optional upload.' });
});

module.exports = router;
