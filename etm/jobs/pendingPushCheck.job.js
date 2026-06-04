'use strict';

function startPendingPushCheck() {
  // TODO: Every 60 seconds, send push notifications for pending alert records.
  if (global.__etmPendingPushCheckStarted) return;
  global.__etmPendingPushCheckStarted = true;
  console.log('[ETM] Pending push check placeholder registered.');
}

module.exports = { startPendingPushCheck };
