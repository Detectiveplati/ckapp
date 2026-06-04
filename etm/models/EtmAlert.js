'use strict';

const mongoose = require('mongoose');
const { COLLECTIONS } = require('../config/database');

const schema = new mongoose.Schema({
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'EtmUnit', required: true, index: true },
  device: { type: mongoose.Schema.Types.ObjectId, ref: 'EtmDevice', required: true },
  reading: { type: mongoose.Schema.Types.ObjectId, ref: 'EtmReading', default: null },
  type: { type: String, enum: ['critical_high', 'critical_low', 'warning_high', 'warning_low', 'device_offline', 'warmer_fault'], required: true },
  value: { type: Number, default: null },
  status: { type: String, enum: ['open', 'acknowledged', 'resolved'], default: 'open', index: true },
  acknowledgedBy: { type: String, default: '' },
  acknowledgedAt: { type: Date, default: null },
  resolvedBy: { type: String, default: '' },
  resolvedAt: { type: Date, default: null },
  resolveNote: { type: String, default: '' },
  correctiveAction: { type: mongoose.Schema.Types.ObjectId, ref: 'EtmCorrectiveAction', default: null },
  notificationSent: { type: Boolean, default: false },
  pushSentAt: { type: Date, default: null }
}, { timestamps: true });

schema.index({ status: 1, unit: 1 });

module.exports = mongoose.model('EtmAlert', schema, COLLECTIONS.etm.ALERTS);
