'use strict';

function startOfflineDeviceCheck() {
  // TODO: Every 5 minutes, detect active devices older than the offline threshold.
  if (global.__etmOfflineDeviceCheckStarted) return;
  global.__etmOfflineDeviceCheckStarted = true;
  console.log('[ETM] Offline device check placeholder registered.');
}

module.exports = { startOfflineDeviceCheck };
