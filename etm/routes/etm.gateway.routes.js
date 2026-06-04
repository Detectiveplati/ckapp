'use strict';

const express = require('express');
const router = express.Router();

router.get('/devices', (_req, res) => {
  res.json({ ok: true, route: 'GET /api/etm/gateway/devices', TODO: 'List LoRa device mappings.' });
});

router.post('/devices', (_req, res) => {
  res.status(201).json({ ok: true, route: 'POST /api/etm/gateway/devices', TODO: 'Register LoRa device mapping.' });
});

router.put('/devices/:sensorId', (req, res) => {
  res.json({ ok: true, route: 'PUT /api/etm/gateway/devices/:sensorId', sensorId: req.params.sensorId, TODO: 'Update LoRa mapping.' });
});

router.delete('/devices/:sensorId', (req, res) => {
  res.json({ ok: true, route: 'DELETE /api/etm/gateway/devices/:sensorId', sensorId: req.params.sensorId, TODO: 'Delete LoRa mapping.' });
});

router.get('/events', (_req, res) => {
  res.json({ ok: true, route: 'GET /api/etm/gateway/events', TODO: 'Return gateway events.' });
});

router.get('/status', (_req, res) => {
  res.json({ ok: true, route: 'GET /api/etm/gateway/status', TODO: 'Return registered sensor live status.' });
});

router.get('/discover', (_req, res) => {
  res.json({ ok: true, route: 'GET /api/etm/gateway/discover', TODO: 'Return unregistered discovered sensors.' });
});

router.post('/receive', (_req, res) => {
  res.json({ ok: true, route: 'POST /api/etm/gateway/receive', TODO: 'Parse LoRa HTTP gateway payload.' });
});

router.get('/tcp-log', (_req, res) => {
  res.json({ ok: true, route: 'GET /api/etm/gateway/tcp-log', TODO: 'Return TCP diagnostic log.' });
});

router.get('/tcp-config', (_req, res) => {
  res.json({ ok: true, route: 'GET /api/etm/gateway/tcp-config', TODO: 'Return TCP host/port config.' });
});

module.exports = router;
