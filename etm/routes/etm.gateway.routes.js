'use strict';

const express = require('express');
const {
  getTcpConfig,
  updateTcpConfig,
  receiveHttpPayload,
  listGatewayEvents,
  getGatewayStatus,
  discoverSensors,
  getTcpLog,
  listGatewayDevices
} = require('../services/gateway.service');

const router = express.Router();

function sendError(res, err) {
  res.status(err.status || 500).json({ ok: false, error: err.message || 'Gateway request failed' });
}

router.get('/devices', async (_req, res) => {
  try {
    const devices = await listGatewayDevices();
    res.json({ ok: true, data: devices });
  } catch (err) {
    sendError(res, err);
  }
});

router.post('/devices', (_req, res) => {
  // TODO: Implement sensor registration from discovered sensors.
  res.status(501).json({ ok: false, error: 'Sensor registration will be implemented under Temperature Probe Setup later' });
});

router.put('/devices/:sensorId', (req, res) => {
  // TODO: Link sensors to ETM equipment.
  res.status(501).json({ ok: false, error: `Sensor update for ${req.params.sensorId} will be implemented later` });
});

router.delete('/devices/:sensorId', (req, res) => {
  res.status(501).json({ ok: false, error: `Sensor removal for ${req.params.sensorId} will be implemented later` });
});

router.get('/events', async (req, res) => {
  try {
    const events = await listGatewayEvents(req.query.limit);
    res.json({ ok: true, data: events });
  } catch (err) {
    sendError(res, err);
  }
});

router.get('/status', async (_req, res) => {
  try {
    const status = await getGatewayStatus();
    res.json({ ok: true, data: status });
  } catch (err) {
    sendError(res, err);
  }
});

router.get('/discover', async (req, res) => {
  try {
    const sensors = await discoverSensors(req.query.hours);
    res.json({ ok: true, data: { sensors } });
  } catch (err) {
    sendError(res, err);
  }
});

router.post('/receive', async (req, res) => {
  try {
    const result = await receiveHttpPayload(req);
    res.status(201).json({ ok: true, data: result });
  } catch (err) {
    sendError(res, err);
  }
});

router.get('/tcp-log', (_req, res) => {
  res.json({ ok: true, data: getTcpLog() });
});

router.get('/tcp-config', async (req, res) => {
  try {
    const config = await getTcpConfig(req);
    res.json({ ok: true, data: config });
  } catch (err) {
    sendError(res, err);
  }
});

router.put('/tcp-config', async (req, res) => {
  try {
    const config = await updateTcpConfig(req, req.body || {});
    res.json({ ok: true, data: config });
  } catch (err) {
    sendError(res, err);
  }
});

module.exports = router;
