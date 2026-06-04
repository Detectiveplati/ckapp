'use strict';

const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const requirePermission = require('../middleware/requirePermission');

const router = express.Router();

router.use(requireAuth);
router.use(requirePermission('etm'));

router.get('/dashboard', (_req, res) => {
  res.json({ ok: true, route: 'GET /api/etm/dashboard', TODO: 'Return ETM dashboard summary.' });
});

router.use('/units', require('./etm.units.routes'));
router.use('/devices', require('./etm.devices.routes'));
router.use('/readings', require('./etm.readings.routes'));
router.use('/alerts', require('./etm.alerts.routes'));
router.use('/calibrations', require('./etm.calibrations.routes'));
router.use('/reports', require('./etm.reports.routes'));
router.use('/config', require('./etm.config.routes'));
router.use('/gateway', require('./etm.gateway.routes'));

router.post('/ingest', (_req, res) => {
  res.json({ ok: true, route: 'POST /api/etm/ingest', TODO: 'Validate gateway key and store readings.' });
});

router.post('/corrective-actions', (_req, res) => {
  res.json({ ok: true, route: 'POST /api/etm/corrective-actions', TODO: 'Create corrective action.' });
});

router.get('/corrective-actions/:id', (req, res) => {
  res.json({ ok: true, route: 'GET /api/etm/corrective-actions/:id', id: req.params.id, TODO: 'Return corrective action.' });
});

router.put('/corrective-actions/:id', (req, res) => {
  res.json({ ok: true, route: 'PUT /api/etm/corrective-actions/:id', id: req.params.id, TODO: 'Update corrective action.' });
});

router.post('/test-push', (_req, res) => {
  res.json({ ok: true, route: 'POST /api/etm/test-push', TODO: 'Send test web push.' });
});

module.exports = router;
