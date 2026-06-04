'use strict';

const { ObjectId } = require('mongodb');
const env = require('../config/env');
const { COLLECTIONS, getTemplogDb } = require('../config/database');
const { normalizeSensorId, parseLoraPayload } = require('./loraParser.service');

const HTTP_RECEIVE_PATH = '/api/etm/gateway/receive';
const TCP_LOG = [];

function requireTemplogDb() {
  const db = getTemplogDb();
  if (!db) {
    const err = new Error('TempLog database is not connected');
    err.status = 503;
    throw err;
  }
  return db;
}

function getRequestHost(req) {
  const forwardedHost = String(req.headers['x-forwarded-host'] || '').split(',')[0].trim();
  return forwardedHost || req.get('host') || 'localhost';
}

function getRequestProtocol(req) {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  return forwardedProto || req.protocol || 'http';
}

function getTcpConfig(req) {
  const tcpHost = env.LORA_TCP_PROXY_HOST
    || env.RAILWAY_TCP_PROXY_DOMAIN
    || getRequestHost(req).split(':')[0];
  const tcpPort = env.LORA_TCP_PROXY_PORT
    || env.RAILWAY_TCP_PROXY_PORT
    || env.LORA_TCP_PORT
    || 4001;
  const origin = `${getRequestProtocol(req)}://${getRequestHost(req)}`;

  return {
    tcpHost,
    tcpPort,
    httpReceiveUrl: `${origin}${HTTP_RECEIVE_PATH}`,
    tokenRequired: !!env.LORA_HTTP_TOKEN,
    lastRefreshedAt: new Date().toISOString()
  };
}

function tokenMatches(req) {
  if (!env.LORA_HTTP_TOKEN) return true;
  const supplied = String(req.headers['x-lora-token'] || req.query.token || req.body?.token || '');
  return supplied === env.LORA_HTTP_TOKEN;
}

function parseGatewayId(payload) {
  return String(payload.gatewayId || payload.gatewayID || payload.gateway || payload.imei || payload.IMEI || payload.serial || payload.Serial || payload.gw || '').trim();
}

async function getRegisteredDeviceMap(db) {
  const devices = await db.collection(COLLECTIONS.templog.LORA_DEVICES).find({}).toArray();
  return new Map(devices.map((device) => [normalizeSensorId(device.sensorId), device]));
}

async function receiveHttpPayload(req) {
  if (!tokenMatches(req)) {
    const err = new Error('Invalid or missing LoRa HTTP token');
    err.status = 401;
    throw err;
  }

  const db = requireTemplogDb();
  const rawPayload = req.body || {};
  const gatewayId = parseGatewayId(rawPayload);
  const rows = parseLoraPayload(rawPayload);
  const registeredMap = await getRegisteredDeviceMap(db);
  const now = new Date();

  let matchedCount = 0;
  const storedRows = rows.map((row) => {
    const registered = registeredMap.get(row.sensorId);
    if (registered && registered.enabled !== false) matchedCount += 1;
    return {
      ...row,
      recordedAt: row.recordedAt,
      matched: !!registered,
      registered: !!registered,
      enabled: registered ? registered.enabled !== false : false
    };
  });

  const event = {
    gatewayId,
    receivedAt: now,
    source: 'http',
    rawPayload,
    rows: storedRows,
    sensorCount: storedRows.length,
    matchedCount,
    unmatchedCount: storedRows.length - matchedCount,
    createdAt: now
  };

  const result = await db.collection(COLLECTIONS.templog.LORA_GATEWAY_EVENTS).insertOne(event);

  // TODO: Forward matched sensor readings into core_tempmon_readings.
  return {
    gatewayId,
    receivedRows: storedRows.length,
    matchedCount,
    unmatchedCount: storedRows.length - matchedCount,
    eventId: String(result.insertedId)
  };
}

function eventRows(event) {
  if (Array.isArray(event.rows)) return event.rows;
  return parseLoraPayload(event.rawPayload || event.payload || {});
}

async function listGatewayEvents(limit = 50) {
  const db = requireTemplogDb();
  const safeLimit = Math.max(1, Math.min(200, Number(limit) || 50));
  const events = await db.collection(COLLECTIONS.templog.LORA_GATEWAY_EVENTS)
    .find({})
    .sort({ receivedAt: -1, createdAt: -1 })
    .limit(safeLimit)
    .toArray();

  return events.map((event) => {
    const rows = eventRows(event);
    return {
      _id: String(event._id),
      gatewayId: event.gatewayId || '',
      receivedAt: event.receivedAt || event.createdAt || null,
      source: event.source || 'unknown',
      sensorCount: event.sensorCount ?? rows.length,
      matchedCount: event.matchedCount ?? event.ingestedCount ?? 0,
      unmatchedCount: event.unmatchedCount ?? Math.max(0, rows.length - (event.matchedCount || 0)),
      rows,
      rawPayload: event.rawPayload || event.payload || null
    };
  });
}

async function discoverSensors(hours = 24) {
  const db = requireTemplogDb();
  const safeHours = Math.max(1, Math.min(720, Number(hours) || 24));
  const since = new Date(Date.now() - safeHours * 60 * 60 * 1000);
  const registered = await getRegisteredDeviceMap(db);
  const events = await db.collection(COLLECTIONS.templog.LORA_GATEWAY_EVENTS)
    .find({ receivedAt: { $gte: since } })
    .sort({ receivedAt: -1 })
    .limit(500)
    .toArray();

  const bySensor = new Map();
  for (const event of events) {
    for (const row of eventRows(event)) {
      const sensorId = normalizeSensorId(row.sensorId);
      if (!sensorId || registered.has(sensorId)) continue;
      const eventTime = new Date(event.receivedAt || event.createdAt || row.recordedAt || Date.now());
      const existing = bySensor.get(sensorId);
      if (!existing || eventTime > new Date(existing.lastSeen)) {
        bySensor.set(sensorId, {
          sensorId,
          model: row.model || '',
          lastTemperature: row.temperature ?? row.temp ?? null,
          lastSeen: eventTime,
          gatewayId: event.gatewayId || ''
        });
      }
    }
  }

  return [...bySensor.values()].sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));
}

async function getGatewayStatus() {
  const db = requireTemplogDb();
  const [devices, latestEvent, discovered] = await Promise.all([
    db.collection(COLLECTIONS.templog.LORA_DEVICES).find({}).toArray(),
    db.collection(COLLECTIONS.templog.LORA_GATEWAY_EVENTS).find({}).sort({ receivedAt: -1, createdAt: -1 }).limit(1).next(),
    discoverSensors(24)
  ]);

  const registeredIds = new Set(devices.map((device) => normalizeSensorId(device.sensorId)));
  const recentSince = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const recentEvents = await db.collection(COLLECTIONS.templog.LORA_GATEWAY_EVENTS)
    .find({ receivedAt: { $gte: recentSince } })
    .sort({ receivedAt: -1 })
    .limit(300)
    .toArray();
  const recentlySeen = new Set();
  for (const event of recentEvents) {
    for (const row of eventRows(event)) {
      const sensorId = normalizeSensorId(row.sensorId);
      if (registeredIds.has(sensorId)) recentlySeen.add(sensorId);
    }
  }

  return {
    registeredCount: devices.length,
    enabledCount: devices.filter((device) => device.enabled !== false).length,
    recentlySeenCount: recentlySeen.size,
    unregisteredCount: discovered.length,
    latestEventAt: latestEvent ? latestEvent.receivedAt || latestEvent.createdAt || null : null
  };
}

async function listGatewayDevices() {
  const db = requireTemplogDb();
  return db.collection(COLLECTIONS.templog.LORA_DEVICES).find({}).sort({ sensorId: 1 }).toArray();
}

function getTcpLog() {
  // TODO: Implement full TCP listener.
  return TCP_LOG.slice(-200);
}

async function findEvent(id) {
  const db = requireTemplogDb();
  if (!ObjectId.isValid(id)) return null;
  return db.collection(COLLECTIONS.templog.LORA_GATEWAY_EVENTS).findOne({ _id: new ObjectId(id) });
}

module.exports = {
  getTcpConfig,
  receiveHttpPayload,
  listGatewayEvents,
  getGatewayStatus,
  discoverSensors,
  getTcpLog,
  listGatewayDevices,
  findEvent
};
