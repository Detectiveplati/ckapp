'use strict';

require('dotenv').config();

const { MongoClient } = require('mongodb');
const env = require('../config/env');
const { COLLECTIONS } = require('../config/database');

const WARMER_DEFAULTS = {
  roomTempCeiling: 35,
  warmupStartTemp: 40,
  offConfirmMinutes: 20,
  faultMinutes: 30,
  slopeWindowReadings: 8,
  riseMinPerMin: 0.10,
  fallMinPerMin: 0.08
};

function cleanString(value) {
  return String(value || '').trim();
}

function cleanNumber(value, fallback = null) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeUnit(sourceUnit, migratedAt) {
  const type = ['freezer', 'chiller', 'warmer', 'ambient'].includes(sourceUnit.type)
    ? sourceUnit.type
    : 'ambient';
  const warmerStateConfig = { ...WARMER_DEFAULTS, ...(sourceUnit.warmerStateConfig || {}) };

  return {
    _id: sourceUnit._id,
    name: cleanString(sourceUnit.name),
    type,
    location: cleanString(sourceUnit.location),
    area: cleanString(sourceUnit.area),
    criticalMin: cleanNumber(sourceUnit.criticalMin, 0),
    criticalMax: cleanNumber(sourceUnit.criticalMax, 35),
    warningBuffer: cleanNumber(sourceUnit.warningBuffer, type === 'warmer' ? 5 : 2),
    targetTemp: cleanNumber(sourceUnit.targetTemp, null),
    active: sourceUnit.active !== false,
    inUse: sourceUnit.inUse !== false,
    inUseComment: cleanString(sourceUnit.inUseComment),
    notes: cleanString(sourceUnit.notes),
    alertThresholdMinutes: cleanNumber(sourceUnit.alertThresholdMinutes, 30),
    warmerStateConfig,
    warmerState: {
      state: ['off', 'warming_up', 'active', 'cooling', 'fault', 'unknown'].includes(sourceUnit.warmerState?.state)
        ? sourceUnit.warmerState.state
        : 'unknown',
      since: sourceUnit.warmerState?.since || null
    },
    legacyTempmonUnitId: String(sourceUnit._id),
    source: {
      system: 'masterapp',
      database: env.CORE_DB_NAME,
      collection: COLLECTIONS.core.UNITS,
      id: String(sourceUnit._id),
      migratedAt
    },
    createdAt: sourceUnit.createdAt || migratedAt,
    updatedAt: sourceUnit.updatedAt || migratedAt
  };
}

async function main() {
  if (!env.CORE_MONGODB_URI) {
    throw new Error('Missing source MongoDB URI. Set MASTERAPP_CORE_MONGODB_URI, MAINTENANCE_MONGODB_URI, or MONGODB_URI.');
  }
  if (!env.ETM_MONGODB_URI) {
    throw new Error('Missing target ETM MongoDB URI. Set ETM_MONGODB_URI or a masterapp core URI fallback.');
  }

  const sourceClient = await MongoClient.connect(env.CORE_MONGODB_URI);
  const targetClient = await MongoClient.connect(env.ETM_MONGODB_URI);

  try {
    const sourceDb = sourceClient.db(env.CORE_DB_NAME);
    const targetDb = targetClient.db(env.ETM_DB_NAME);
    const sourceCollection = sourceDb.collection(COLLECTIONS.core.UNITS);
    const targetCollection = targetDb.collection(COLLECTIONS.etm.UNITS);
    const migratedAt = new Date();

    const sourceUnits = await sourceCollection.find({}).sort({ name: 1 }).toArray();
    if (!sourceUnits.length) {
      console.log(`[ETM] No source units found in ${env.CORE_DB_NAME}.${COLLECTIONS.core.UNITS}`);
      return;
    }

    let upserted = 0;
    let modified = 0;
    for (const sourceUnit of sourceUnits) {
      const targetUnit = normalizeUnit(sourceUnit, migratedAt);
      const result = await targetCollection.updateOne(
        { _id: targetUnit._id },
        { $set: targetUnit },
        { upsert: true }
      );
      upserted += result.upsertedCount || 0;
      modified += result.modifiedCount || 0;
    }

    await targetCollection.createIndex({ name: 1 });
    await targetCollection.createIndex({ type: 1, active: 1 });
    await targetCollection.createIndex({ legacyTempmonUnitId: 1 });

    console.log(`[ETM] Migrated ${sourceUnits.length} unit(s).`);
    console.log(`[ETM] Source: ${env.CORE_DB_NAME}.${COLLECTIONS.core.UNITS}`);
    console.log(`[ETM] Target: ${env.ETM_DB_NAME}.${COLLECTIONS.etm.UNITS}`);
    console.log(`[ETM] Upserted: ${upserted}, modified: ${modified}`);
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}

main().catch((err) => {
  console.error('[ETM] Unit migration failed:', err.message);
  process.exit(1);
});
