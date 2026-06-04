'use strict';

const mongoose = require('mongoose');
const { COLLECTIONS } = require('../config/database');

const schema = new mongoose.Schema({
  device: { type: mongoose.Schema.Types.ObjectId, ref: 'EtmDevice', required: true, index: true },
  calibratedBy: { type: String, required: true, trim: true },
  calibratedAt: { type: Date, required: true },
  referenceTemp: { type: Number, default: null },
  readingBefore: { type: Number, default: null },
  readingAfter: { type: Number, default: null },
  offsetApplied: { type: Number, default: 0 },
  certificate: { type: String, default: '' },
  certificateId: { type: String, default: '' },
  nextDueDate: { type: Date, default: null },
  notes: { type: String, default: '', trim: true }
}, { timestamps: true });

module.exports = mongoose.model('EtmCalibration', schema, COLLECTIONS.core.CALIBRATIONS);
