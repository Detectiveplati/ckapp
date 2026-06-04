'use strict';

const mongoose = require('mongoose');
const { COLLECTIONS } = require('../config/database');

const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['freezer', 'chiller', 'warmer'], required: true },
  location: { type: String, default: '', trim: true },
  area: { type: String, default: '', trim: true },
  criticalMin: { type: Number, required: true },
  criticalMax: { type: Number, required: true },
  warningBuffer: { type: Number, default: 2 },
  targetTemp: { type: Number },
  active: { type: Boolean, default: true },
  inUse: { type: Boolean, default: true },
  inUseComment: { type: String, default: '', trim: true },
  notes: { type: String, default: '', trim: true },
  thermometerProbeId: { type: String, default: '', trim: true },
  alertThresholdMinutes: { type: Number, default: 30 },
  warmerStateConfig: {
    roomTempCeiling: { type: Number, default: 35 },
    warmupStartTemp: { type: Number, default: 40 },
    offConfirmMinutes: { type: Number, default: 20 },
    faultMinutes: { type: Number, default: 30 },
    slopeWindowReadings: { type: Number, default: 8 },
    riseMinPerMin: { type: Number, default: 0.10 },
    fallMinPerMin: { type: Number, default: 0.08 }
  },
  warmerState: {
    state: { type: String, enum: ['off', 'warming_up', 'active', 'cooling', 'fault', 'unknown'], default: 'unknown' },
    since: { type: Date }
  },
  legacyTempmonUnitId: { type: String, default: '', index: true },
  source: {
    system: { type: String, default: 'etm' },
    database: { type: String, default: '' },
    collection: { type: String, default: '' },
    id: { type: String, default: '' },
    migratedAt: { type: Date, default: null }
  }
}, { timestamps: true });

module.exports = mongoose.model('EtmUnit', schema, COLLECTIONS.etm.UNITS);
