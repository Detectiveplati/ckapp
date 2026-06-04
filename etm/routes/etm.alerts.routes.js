'use strict';

const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
  res.json({ ok: true, route: 'GET /api/etm/alerts', TODO: 'List alerts.' });
});

router.get('/:id', (req, res) => {
  res.json({ ok: true, route: 'GET /api/etm/alerts/:id', id: req.params.id, TODO: 'Return alert detail.' });
});

router.put('/:id/acknowledge', (req, res) => {
  res.json({ ok: true, route: 'PUT /api/etm/alerts/:id/acknowledge', id: req.params.id, TODO: 'Acknowledge alert.' });
});

router.put('/:id/resolve', (req, res) => {
  res.json({ ok: true, route: 'PUT /api/etm/alerts/:id/resolve', id: req.params.id, TODO: 'Resolve alert.' });
});

module.exports = router;
