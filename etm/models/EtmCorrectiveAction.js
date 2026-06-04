'use strict';

const mongoose = require('mongoose');
const { COLLECTIONS } = require('../config/database');

const schema = new mongoose.Schema({
  alert: { type: mongoose.Schema.Types.ObjectId, ref: 'EtmAlert', required: true, unique: true },
  unit: { type: mongoose.Schema.Types.ObjectId, ref: 'EtmUnit', required: true, index: true },
  actionTaken: { type: String, required: true, trim: true },
  takenBy: { type: String, required: true, trim: true },
  takenAt: { type: Date, default: Date.now },
  rootCause: { type: String, default: '', trim: true },
  preventiveMeasure: { type: String, default: '', trim: true },
  productDisposalRequired: { type: Boolean, default: false },
  productDisposalDetails: { type: String, default: '', trim: true },
  verifiedBy: { type: String, default: '', trim: true },
  verifiedAt: { type: Date, default: null },
  outcome: { type: String, enum: ['product_safe', 'product_discarded', 'equipment_repaired', 'other', ''], default: '' }
}, { timestamps: true });

module.exports = mongoose.model('EtmCorrectiveAction', schema, COLLECTIONS.etm.CORRECTIVE_ACTIONS);
