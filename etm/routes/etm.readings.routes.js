'use strict';

const express = require('express');
const router = express.Router();

router.get('/:unitId', (req, res) => {
  res.json({ ok: true, route: 'GET /api/etm/readings/:unitId', unitId: req.params.unitId, TODO: 'Return readings for charts.' });
});

router.get('/:unitId/export', (req, res) => {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.send('timestamp,device,value,humidity,rssi,battery,flagged\n');
});

module.exports = router;
