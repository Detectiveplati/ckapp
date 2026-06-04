'use strict';

const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
  res.json({ ok: true, route: 'GET /api/etm/devices', TODO: 'List probes/devices.' });
});

router.post('/', (_req, res) => {
  res.status(201).json({ ok: true, route: 'POST /api/etm/devices', TODO: 'Register probe/device.' });
});

router.put('/:id', (req, res) => {
  res.json({ ok: true, route: 'PUT /api/etm/devices/:id', id: req.params.id, TODO: 'Update probe/device.' });
});

router.delete('/:id', (req, res) => {
  res.json({ ok: true, route: 'DELETE /api/etm/devices/:id', id: req.params.id, TODO: 'Soft-decommission probe/device.' });
});

router.get('/:id/diag', (req, res) => {
  res.json({ ok: true, route: 'GET /api/etm/devices/:id/diag', id: req.params.id, TODO: 'Return diagnostic snapshot.' });
});

module.exports = router;
