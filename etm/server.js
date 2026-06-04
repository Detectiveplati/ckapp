'use strict';

require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const { connectDatabases } = require('./config/database');
const etmRoutes = require('./routes/etm.routes');
const errorHandler = require('./middleware/errorHandler');
const { startOfflineDeviceCheck } = require('./jobs/offlineDeviceCheck.job');
const { startPendingPushCheck } = require('./jobs/pendingPushCheck.job');
const { runStartupCleanup } = require('./jobs/startupCleanup.job');

const app = express();

app.set('trust proxy', 1);
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, app: 'Equipment Temperature Monitor', module: 'ETM' });
});

app.use('/etm', express.static(path.join(__dirname, 'public', 'etm')));
app.get('/etm', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'etm', 'index.html'));
});
app.get('/etm/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'etm', 'index.html'));
});

app.use('/api/etm', etmRoutes);
app.use(errorHandler);

async function start() {
  await connectDatabases();
  runStartupCleanup();
  startOfflineDeviceCheck();
  startPendingPushCheck();

  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`ETM server listening on http://localhost:${env.PORT}`);
  });
}

start().catch((err) => {
  console.error('[ETM] Startup failed:', err.message);
  process.exit(1);
});
