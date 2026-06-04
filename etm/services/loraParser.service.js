'use strict';

function normalizeSensorId(value) {
  const sensorId = String(value || '').trim().toUpperCase();
  if (/^\d+$/.test(sensorId) && sensorId.length < 8) return sensorId.padStart(8, '0');
  return sensorId;
}

function normalizeModel(value) {
  const model = String(value || '').trim().toUpperCase();
  if (!model) return '';
  if (model.startsWith('TAG07')) return 'TAG07';
  if (model.startsWith('TAG09')) return 'TAG09';
  if (model.startsWith('TAG08L')) return 'TAG08L';
  if (model.startsWith('TAG08')) return model.includes('L') ? 'TAG08L' : 'TAG08B';
  return model;
}

function pickFirst(obj, keys) {
  if (!obj || typeof obj !== 'object') return undefined;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key];
  }
  return undefined;
}

function parseRecordedAt(value) {
  if (value === undefined || value === null || value === '') return new Date();
  if (typeof value === 'number' && Number.isFinite(value)) {
    const ms = value > 1e12 ? value : value * 1000;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }

  const text = String(value).trim();
  const compact = text.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (compact) {
    const [, yy, mo, dd, hh, mm, ss] = compact;
    const date = new Date(Date.UTC(2000 + Number(yy), Number(mo) - 1, Number(dd), Number(hh), Number(mm), Number(ss)));
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }

  const numeric = Number(text);
  if (Number.isFinite(numeric) && /^\d+$/.test(text)) {
    const ms = numeric > 1e12 ? numeric : numeric * 1000;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function parseNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function parseLoraPayload(payload) {
  const root = payload && typeof payload === 'object' ? payload : {};
  const groups = [];
  const data = root.data;

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value) && /^tag/i.test(key)) {
        groups.push({ rows: value, model: normalizeModel(key) });
      }
    }
  }

  if (!groups.length && !(data && typeof data === 'object' && !Array.isArray(data))) {
    for (const [key, value] of Object.entries(root)) {
      if (Array.isArray(value) && /^tag/i.test(key)) {
        groups.push({ rows: value, model: normalizeModel(key) });
      }
    }
  }

  const rows = [];
  for (const group of groups) {
    for (const row of group.rows) {
      if (!row || typeof row !== 'object') continue;
      const sensorId = normalizeSensorId(pickFirst(row, ['id', 'sensorId', 'sensorID', 'sensor_id', 'SN', 'sn', 'tagId', 'deviceId', 'mac']));
      if (!sensorId) continue;

      const temperature = parseNumber(pickFirst(row, ['temp', 'temperature', 'Temperature', 'Temp', 'T']));
      const humidity = parseNumber(pickFirst(row, ['humi', 'humidity', 'Humidity', 'H']));
      const rssi = parseNumber(pickFirst(row, ['rssi', 'RSSI']));
      const battery = parseNumber(pickFirst(row, ['bat', 'battery', 'Battery', 'BAT', 'batt']));
      const model = normalizeModel(pickFirst(row, ['model', 'deviceModel', 'tagModel', 'HardwareType', 'hardwareType', 'TagType'])) || group.model;
      const recordedAt = parseRecordedAt(
        pickFirst(row, ['recordedAt', 'time', 'timestamp', 'rtc', 'RTC'])
          || root.recordedAt
          || root.rtc
          || root.RTC
      );

      rows.push({
        sensorId,
        model,
        temperature,
        humidity: humidity === -1000 ? null : humidity,
        rssi,
        battery,
        recordedAt,
        raw: row
      });
    }
  }

  return rows;
}

module.exports = {
  normalizeSensorId,
  parseLoraPayload
};
