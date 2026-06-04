'use strict';

const express = require('express');
const router = express.Router();

router.get('/daily', (_req, res) => {
  res.json({ ok: true, route: 'GET /api/etm/reports/daily', TODO: 'Aggregate daily readings.' });
});

router.get('/compliance', (_req, res) => {
  res.json({ ok: true, route: 'GET /api/etm/reports/compliance', TODO: 'Aggregate compliance data.' });
});

router.get('/monthly-unit', (_req, res) => {
  res.json({ ok: true, route: 'GET /api/etm/reports/monthly-unit', TODO: 'Build monthly equipment report.' });
});

router.post('/monthly-unit/confirm', (_req, res) => {
  res.json({ ok: true, route: 'POST /api/etm/reports/monthly-unit/confirm', TODO: 'Confirm monthly report into Food Safety record.' });
});

module.exports = router;
