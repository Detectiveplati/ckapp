'use strict';

const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const env = require('./env');

const COLLECTIONS = {
  etm: {
    UNITS: 'etm_units',
    DEVICES: 'etm_devices',
    READINGS: 'etm_readings',
    ALERTS: 'etm_alerts',
    CORRECTIVE_ACTIONS: 'etm_corrective_actions',
    CALIBRATIONS: 'etm_calibrations',
    CONFIGS: 'etm_configs',
    GATEWAY_CONFIGS: 'etm_gateway_configs',
    FOOD_SAFETY_MONTHLY_REPORTS: 'etm_food_safety_monthly_reports',
    PUSH_SUBSCRIPTIONS: 'etm_push_subscriptions',
    USERS: 'etm_users'
  },
  core: {
    UNITS: 'core_tempmon_units',
    DEVICES: 'core_tempmon_devices',
    READINGS: 'core_tempmon_readings',
    ALERTS: 'core_tempmon_alerts',
    CORRECTIVE_ACTIONS: 'core_tempmon_corrective_actions',
    CALIBRATIONS: 'core_tempmon_calibrations',
    CONFIGS: 'core_tempmon_configs',
    FOOD_SAFETY_CHECKLIST_MONTHS: 'core_food_safety_checklist_months',
    PUSH_SUBSCRIPTIONS: 'core_push_subscriptions',
    USERS: 'core_users'
  },
  templog: {
    LORA_DEVICES: 'templog_lora_devices',
    LORA_GATEWAY_EVENTS: 'templog_lora_gateway_events',
    EQUIPMENT_TEMP_READINGS: 'templog_equipment_temp_readings',
    EQUIPMENT_TEMP_CONFIGS: 'templog_equipment_temp_configs',
    EQUIPMENT_TEMP_ALERTS: 'templog_equipment_temp_alerts',
    EQUIPMENT_TEMP_STATES: 'templog_equipment_temp_states'
  }
};

let templogClient = null;
let templogDb = null;

async function connectDatabases() {
  if (env.ETM_MONGODB_URI) {
    await mongoose.connect(env.ETM_MONGODB_URI, {
      dbName: env.ETM_DB_NAME
    });
    console.log(`[ETM] ETM MongoDB connected: ${env.ETM_DB_NAME}`);
  } else {
    console.warn('[ETM] ETM MongoDB URI not set; ETM DB connection skipped.');
  }

  if (env.TEMPLOG_MONGODB_URI) {
    templogClient = await MongoClient.connect(env.TEMPLOG_MONGODB_URI);
    templogDb = templogClient.db(env.TEMPLOG_DB_NAME);
    console.log(`[ETM] TempLog MongoDB connected: ${env.TEMPLOG_DB_NAME}`);
  } else {
    console.warn('[ETM] TempLog MongoDB URI not set; templog DB connection skipped.');
  }
}

function getTemplogDb() {
  return templogDb;
}

module.exports = {
  COLLECTIONS,
  connectDatabases,
  getTemplogDb
};
