'use strict';

function parseDbNameFromUri(uri) {
  const trimmed = String(uri || '').trim();
  if (!trimmed) return '';
  try {
    const withoutQuery = trimmed.split('?')[0];
    const slashIndex = withoutQuery.lastIndexOf('/');
    if (slashIndex < 0) return '';
    const dbName = withoutQuery.slice(slashIndex + 1).trim();
    if (!dbName || dbName.includes(':')) return '';
    return dbName;
  } catch (_) {
    return '';
  }
}

function getCoreMongoUri() {
  return process.env.MASTERAPP_CORE_MONGODB_URI
    || process.env.MAINTENANCE_MONGODB_URI
    || process.env.MONGODB_URI
    || '';
}

function getCoreDbName() {
  if (process.env.MASTERAPP_CORE_DB_NAME) return process.env.MASTERAPP_CORE_DB_NAME;

  const explicitUri = process.env.MASTERAPP_CORE_MONGODB_URI;
  const explicitUriDbName = parseDbNameFromUri(explicitUri);
  if (explicitUriDbName) return explicitUriDbName;
  if (explicitUri) return 'masterapp_core';

  return process.env.MONGODB_DB_NAME
    || parseDbNameFromUri(process.env.MAINTENANCE_MONGODB_URI)
    || 'central_kitchen_maintenance';
}

function getTemplogMongoUri() {
  return process.env.MASTERAPP_TEMPLOG_MONGODB_URI
    || process.env.TEMPLOG_MONGODB_URI
    || process.env.MONGODB_URI
    || '';
}

function getTemplogDbName() {
  if (process.env.MASTERAPP_TEMPLOG_DB_NAME) return process.env.MASTERAPP_TEMPLOG_DB_NAME;

  const explicitUri = process.env.MASTERAPP_TEMPLOG_MONGODB_URI;
  const explicitUriDbName = parseDbNameFromUri(explicitUri);
  if (explicitUriDbName) return explicitUriDbName;
  if (explicitUri) return 'masterapp_templog';

  return process.env.TEMPLOG_DB_NAME
    || process.env.MONGODB_DB_NAME
    || parseDbNameFromUri(process.env.TEMPLOG_MONGODB_URI)
    || 'kitchenlog';
}

const CORE_MONGODB_URI = getCoreMongoUri();
const CORE_DB_NAME = getCoreDbName();
const TEMPLOG_MONGODB_URI = getTemplogMongoUri();
const TEMPLOG_DB_NAME = getTemplogDbName();

module.exports = {
  PORT: Number(process.env.PORT || 3000),
  JWT_SECRET: process.env.JWT_SECRET || '',
  CORE_MONGODB_URI,
  CORE_DB_NAME,
  TEMPLOG_MONGODB_URI,
  TEMPLOG_DB_NAME,
  MASTERAPP_CORE_MONGODB_URI: CORE_MONGODB_URI,
  MASTERAPP_CORE_DB_NAME: CORE_DB_NAME,
  MASTERAPP_TEMPLOG_MONGODB_URI: TEMPLOG_MONGODB_URI,
  MASTERAPP_TEMPLOG_DB_NAME: TEMPLOG_DB_NAME,
  GATEWAY_API_KEY: process.env.GATEWAY_API_KEY || '',
  LORA_HTTP_TOKEN: process.env.LORA_HTTP_TOKEN || '',
  LORA_TCP_PORT: Number(process.env.LORA_TCP_PORT || 4001),
  TEMP_MON_REPORT_TZ: process.env.TEMP_MON_REPORT_TZ || process.env.TZ || 'Asia/Singapore'
};
