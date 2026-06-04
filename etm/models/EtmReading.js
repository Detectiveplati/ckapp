'use strict';

const mongoose = require('mongoose');
const { COLLECTIONS } = require('../config/database');

const schema = new mongoose.Schema({
  device: { type: mongoose.Schema.Types.ObjectId, ref: 'EtmDevice', required: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'EtmUnit', required: true },
  value: { type: Number, required: true },
  humidity: { type: Number, default: null },
  rssi: { type: Number, default: null },
  battery: { type: Number, default: null },
  recordedAt: { type: Date, required: true },
  receivedAt: { type: Date, default: Date.now },
  gatewayId: { type: String, default: '' },
  flagged: { type: Boolean, default: false }
});

schema.index({ unit: 1, recordedAt: -1 });
schema.index({ device: 1, recordedAt: -1 });
schema.index({ device: 1, recordedAt: 1, value: 1 }, { unique: true });

module.exports = mongoose.model('EtmReading', schema, COLLECTIONS.etm.READINGS);
