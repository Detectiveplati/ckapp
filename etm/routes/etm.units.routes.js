'use strict';

const express = require('express');
const mongoose = require('mongoose');
const EtmUnit = require('../models/EtmUnit');

const router = express.Router();

const TYPE_DEFAULTS = {
  freezer: { criticalMin: -25, criticalMax: -12, targetTemp: -18, warningBuffer: 2 },
  chiller: { criticalMin: 1, criticalMax: 8, targetTemp: 4, warningBuffer: 2 },
  warmer: { criticalMin: 60, criticalMax: 90, targetTemp: 68, warningBuffer: 5 }
};

const WARMER_DEFAULTS = {
  roomTempCeiling: 35,
  warmupStartTemp: 40,
  offConfirmMinutes: 20,
  faultMinutes: 30,
  slopeWindowReadings: 8,
  riseMinPerMin: 0.10,
  fallMinPerMin: 0.08
};

function dbReady() {
  return mongoose.connection.readyState === 1;
}

function toNumber(value, field, errors, required = false) {
  if (value === undefined || value === null || value === '') {
    if (required) errors.push(`${field} is required`);
    return undefined;
  }
  const number = Number(value);
  if (!Number.isFinite(number)) {
    errors.push(`${field} must be a number`);
    return undefined;
  }
  return number;
}

function buildUnitPayload(body, partial = false) {
  const errors = [];
  const update = {};

  const name = String(body.name || '').trim();
  if (!partial || body.name !== undefined) {
    if (!name) errors.push('Equipment name is required');
    else update.name = name;
  }

  const type = String(body.type || '').trim();
  if (!partial || body.type !== undefined) {
    if (!TYPE_DEFAULTS[type]) errors.push('Type must be chiller, freezer, or warmer');
    else update.type = type;
  }

  ['location', 'area', 'inUseComment', 'notes', 'thermometerProbeId'].forEach((field) => {
    if (!partial || body[field] !== undefined) update[field] = String(body[field] || '').trim();
  });

  const requiredRange = !partial || body.criticalMin !== undefined || body.criticalMax !== undefined;
  const criticalMin = toNumber(body.criticalMin, 'Critical minimum temperature', errors, requiredRange);
  const criticalMax = toNumber(body.criticalMax, 'Critical maximum temperature', errors, requiredRange);
  if (criticalMin !== undefined) update.criticalMin = criticalMin;
  if (criticalMax !== undefined) update.criticalMax = criticalMax;
  if (criticalMin !== undefined && criticalMax !== undefined && criticalMin >= criticalMax) {
    errors.push('Critical minimum temperature must be lower than critical maximum temperature');
  }

  const warningBuffer = toNumber(body.warningBuffer, 'Warning buffer', errors, false);
  if (warningBuffer !== undefined) update.warningBuffer = warningBuffer;

  const targetTemp = toNumber(body.targetTemp, 'Target temperature', errors, false);
  if (targetTemp !== undefined) update.targetTemp = targetTemp;

  const alertThresholdMinutes = toNumber(body.alertThresholdMinutes, 'Alert delay minutes', errors, false);
  if (alertThresholdMinutes !== undefined) update.alertThresholdMinutes = alertThresholdMinutes;
  else if (!partial) update.alertThresholdMinutes = 30;

  if (!partial || body.inUse !== undefined) update.inUse = body.inUse !== false;
  if (body.active !== undefined) update.active = !!body.active;

  const resolvedType = update.type || body.type;
  if (resolvedType === 'warmer') {
    const warmerStateConfig = {};
    Object.keys(WARMER_DEFAULTS).forEach((field) => {
      const number = toNumber(body.warmerStateConfig?.[field], `Warmer ${field}`, errors, !partial);
      if (number !== undefined) warmerStateConfig[field] = number;
      else if (!partial) warmerStateConfig[field] = WARMER_DEFAULTS[field];
    });
    update.warmerStateConfig = warmerStateConfig;
  } else if (!partial && resolvedType) {
    update.warmerStateConfig = WARMER_DEFAULTS;
  }

  return { errors, update };
}

function mongoError(err) {
  if (err && err.name === 'ValidationError') {
    return Object.values(err.errors).map((e) => e.message).join('; ');
  }
  if (err && err.name === 'CastError') return 'Equipment not found';
  return err.message || 'Request failed';
}

router.get('/', async (req, res) => {
  try {
    if (!dbReady()) return res.json({ ok: true, data: [] });
    const includeInactive = req.query.includeInactive === 'true';
    const query = includeInactive ? {} : { active: true };
    const units = await EtmUnit.find(query).sort({ active: -1, type: 1, name: 1 }).lean();
    res.json({ ok: true, data: units });
  } catch (err) {
    res.status(500).json({ ok: false, error: mongoError(err) });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!dbReady()) return res.status(503).json({ ok: false, error: 'ETM MongoDB is not connected' });
    const unit = await EtmUnit.findById(req.params.id).lean();
    if (!unit) return res.status(404).json({ ok: false, error: 'Equipment not found' });
    res.json({ ok: true, data: unit });
  } catch (err) {
    res.status(500).json({ ok: false, error: mongoError(err) });
  }
});

router.post('/', async (req, res) => {
  try {
    const { errors, update } = buildUnitPayload(req.body);
    if (errors.length) return res.status(400).json({ ok: false, error: errors.join('; ') });
    if (!dbReady()) return res.status(503).json({ ok: false, error: 'ETM MongoDB is not connected' });
    const unit = await EtmUnit.create(update);
    res.status(201).json({ ok: true, data: unit });
  } catch (err) {
    res.status(400).json({ ok: false, error: mongoError(err) });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (!dbReady()) return res.status(503).json({ ok: false, error: 'ETM MongoDB is not connected' });
    const { errors, update } = buildUnitPayload(req.body, true);
    if (errors.length) return res.status(400).json({ ok: false, error: errors.join('; ') });
    const unit = await EtmUnit.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true });
    if (!unit) return res.status(404).json({ ok: false, error: 'Equipment not found' });
    res.json({ ok: true, data: unit });
  } catch (err) {
    res.status(400).json({ ok: false, error: mongoError(err) });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!dbReady()) return res.status(503).json({ ok: false, error: 'ETM MongoDB is not connected' });
    const unit = await EtmUnit.findByIdAndUpdate(req.params.id, { $set: { active: false } }, { new: true });
    if (!unit) return res.status(404).json({ ok: false, error: 'Equipment not found' });
    res.json({ ok: true, data: unit });
  } catch (err) {
    res.status(400).json({ ok: false, error: mongoError(err) });
  }
});

module.exports = router;
