'use strict';

function normalizeSensorId(value) {
  const sensorId = String(value || '').trim().toUpperCase();
  if (/^\d+$/.test(sensorId) && sensorId.length < 8) return sensorId.padStart(8, '0');
  return sensorId;
}

function parseLoraPayloadPlaceholder(payload) {
  // TODO: Parse TZONE HTTP/TCP payloads into normalized sensor rows.
  return { rows: [], payload, TODO: 'loraParser.service.parseLoraPayloadPlaceholder' };
}

module.exports = { normalizeSensorId, parseLoraPayloadPlaceholder };
