'use strict';

const mongoose = require('mongoose');
const { COLLECTIONS } = require('../config/database');

const schema = new mongoose.Schema({
  key: { type: String, default: 'global', unique: true },
  pushDelayCriticalMinutes: { type: Number, default: 60 },
  pushDelayWarningMinutes: { type: Number, default: 120 }
}, { timestamps: true });

module.exports = mongoose.model('EtmConfig', schema, COLLECTIONS.core.CONFIGS);
