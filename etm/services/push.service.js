'use strict';

function isPushConfigured() {
  return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

async function sendPushPlaceholder(permission, payload) {
  // TODO: Wire to web-push and core_push_subscriptions.
  return { ok: false, configured: isPushConfigured(), permission, payload, TODO: 'push.service.sendPushPlaceholder' };
}

module.exports = { isPushConfigured, sendPushPlaceholder };
