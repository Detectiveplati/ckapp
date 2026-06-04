'use strict';

const mongoose = require('mongoose');
const { COLLECTIONS } = require('../config/database');

const schema = new mongoose.Schema({
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'EtmUnit', required: true, index: true },
  deviceId: { type: String, required: true, unique: true, trim: true },
  label: { type: String, default: '', trim: true },
  firmware: { type: String, default: '', trim: true },
  batteryPct: { type: Number, default: null },
  expectedIntervalMinutes: { type: Number, default: 5 },
  lastSeenAt: { type: Date, default: null },
  lastCalibratedAt: { type: Date, default: null },
  calibrationDue: { type: Date, default: null },
  calibrationIntervalDays: { type: Number, default: 180 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('EtmDevice', schema, COLLECTIONS.etm.DEVICES);
