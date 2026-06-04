'use strict';

renderEtmShell('Gateway Log');

let events = [];

document.getElementById('pageRoot').innerHTML = `
  <section class="panel">
    <div class="page-head">
      <div>
        <h1>Gateway Troubleshooting</h1>
        <p class="muted">Review gateway configuration, recent HTTP events, and TCP diagnostics.</p>
      </div>
      <button class="btn primary" type="button" id="refreshBtn">Refresh</button>
    </div>
    <div id="logNotice" hidden></div>
    <div class="kv-grid" id="configSummary"></div>
  </section>

  <section class="panel">
    <h2>TCP Log</h2>
    <pre class="raw-json" id="tcpLogViewer">Loading TCP log...</pre>
    <p class="table-note">TODO: Implement full TCP listener.</p>
  </section>

  <section class="panel">
    <h2>Recent Gateway Events</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Received At</th><th>Gateway ID</th><th>Source</th><th>Sensor Count</th><th>Matched</th><th>Unmatched</th><th>Action</th></tr>
        </thead>
        <tbody id="eventRows"></tbody>
      </table>
    </div>
  </section>

  <section class="panel">
    <h2>Raw Event JSON</h2>
    <pre class="raw-json" id="rawViewer">Select an event to inspect its raw JSON.</pre>
  </section>
`;

function showNotice(message, type) {
  const el = document.getElementById('logNotice');
  el.hidden = false;
  el.className = `notice ${type}`;
  el.textContent = message;
}

function clearNotice() {
  const el = document.getElementById('logNotice');
  el.hidden = true;
  el.textContent = '';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function fmtDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
}

async function gatewayApi(path) {
  const response = await fetch('/api/etm/gateway' + path, { credentials: 'include' });
  const data = await response.json();
  if (!response.ok || data.ok === false) throw new Error(data.error || 'Gateway request failed');
  return data.data;
}

function renderConfig(config) {
  document.getElementById('configSummary').innerHTML = [
    ['TCP Host', config.tcpHost],
    ['TCP Port', config.tcpPort],
    ['HTTP Receive URL', config.httpReceiveUrl],
    ['HTTP Token Required', config.tokenRequired ? 'Yes' : 'No']
  ].map(([label, value]) => `<div class="kv"><span>${label}</span><code>${escapeHtml(value)}</code></div>`).join('');
}

function renderEvents(nextEvents) {
  events = nextEvents;
  const tbody = document.getElementById('eventRows');
  if (!events.length) {
    tbody.innerHTML = '<tr><td colspan="7" class="muted">No gateway events found.</td></tr>';
    return;
  }
  tbody.innerHTML = events.map((event, index) => `
    <tr>
      <td>${fmtDate(event.receivedAt)}</td>
      <td>${escapeHtml(event.gatewayId || '-')}</td>
      <td>${escapeHtml(event.source || '-')}</td>
      <td>${escapeHtml(event.sensorCount ?? 0)}</td>
      <td>${escapeHtml(event.matchedCount ?? 0)}</td>
      <td>${escapeHtml(event.unmatchedCount ?? 0)}</td>
      <td><button class="btn" type="button" data-event-index="${index}">View Raw</button></td>
    </tr>
  `).join('');
}

function renderTcpLog(log) {
  document.getElementById('tcpLogViewer').textContent = log && log.length
    ? JSON.stringify(log, null, 2)
    : 'No TCP log entries yet.';
}

async function refresh() {
  clearNotice();
  try {
    const [config, nextEvents, tcpLog] = await Promise.all([
      gatewayApi('/tcp-config'),
      gatewayApi('/events?limit=50'),
      gatewayApi('/tcp-log')
    ]);
    renderConfig(config);
    renderEvents(nextEvents || []);
    renderTcpLog(tcpLog || []);
  } catch (err) {
    showNotice(err.message, 'error');
  }
}

document.getElementById('refreshBtn').addEventListener('click', refresh);
document.getElementById('eventRows').addEventListener('click', (event) => {
  const button = event.target.closest('[data-event-index]');
  if (!button) return;
  document.getElementById('rawViewer').textContent = JSON.stringify(events[Number(button.dataset.eventIndex)], null, 2);
});

refresh();
