'use strict';

renderEtmShell('Setup');

const TYPE_DEFAULTS = {
  freezer: { criticalMin: -25, criticalMax: -12, targetTemp: -18, warningBuffer: 2 },
  chiller: { criticalMin: 1, criticalMax: 8, targetTemp: 4, warningBuffer: 2 },
  warmer: { criticalMin: 60, criticalMax: 90, targetTemp: 68, warningBuffer: 5 },
  ambient: { criticalMin: 0, criticalMax: 35, targetTemp: 25, warningBuffer: 2 }
};

const WARMER_DEFAULTS = {
  roomTempCeiling: 35,
  warmupStartTemp: 40,
  offConfirmMinutes: 20,
  faultMinutes: 30,
  slopeWindowReadings: 8,
  riseMinPerMin: 0.10,
  fallMinPerMin: 0.08
};

let units = [];
let editingId = null;

document.getElementById('pageRoot').innerHTML = `
  <div class="tabs" role="tablist" aria-label="Setup sections">
    <button class="tab-btn active" type="button" data-tab="equipment">Equipment Setup</button>
    <button class="tab-btn" type="button" data-tab="thresholds">Threshold Settings</button>
    <button class="tab-btn" type="button" data-tab="probes">Temperature Probe Setup</button>
    <button class="tab-btn" type="button" data-tab="gateway">IoT Gateway Setup</button>
    <button class="tab-btn" type="button" data-tab="notifications">Notification Settings</button>
  </div>

  <section id="tab-equipment">
    <div class="page-head">
      <div>
        <h1>Equipment Setup</h1>
        <p class="muted">Add, edit, deactivate, and manage monitored equipment.</p>
      </div>
    </div>

    <div class="grid" id="summaryCards" aria-live="polite"></div>

    <section class="panel">
      <h2 id="formTitle">Add Equipment</h2>
      <div id="notice" hidden></div>
      <form id="equipmentForm" novalidate>
        <div class="form-grid">
          <div class="form-field">
            <label for="name">Equipment Name</label>
            <input id="name" name="name" autocomplete="off" required>
          </div>
          <div class="form-field">
            <label for="type">Type</label>
            <select id="type" name="type" required>
              <option value="">Select type</option>
              <option value="freezer">Freezer</option>
              <option value="chiller">Chiller</option>
              <option value="warmer">Warmer</option>
              <option value="ambient">Ambient</option>
            </select>
          </div>
          <div class="form-field">
            <label for="location">Location</label>
            <input id="location" name="location" autocomplete="off">
          </div>
          <div class="form-field">
            <label for="area">Area</label>
            <input id="area" name="area" autocomplete="off">
          </div>
          <div class="form-field">
            <label for="criticalMin">Critical Minimum Temperature</label>
            <input id="criticalMin" name="criticalMin" type="number" step="0.1" required>
          </div>
          <div class="form-field">
            <label for="criticalMax">Critical Maximum Temperature</label>
            <input id="criticalMax" name="criticalMax" type="number" step="0.1" required>
          </div>
          <div class="form-field">
            <label for="warningBuffer">Warning Buffer</label>
            <input id="warningBuffer" name="warningBuffer" type="number" step="0.1" value="2">
          </div>
          <div class="form-field">
            <label for="targetTemp">Target Temperature</label>
            <input id="targetTemp" name="targetTemp" type="number" step="0.1">
          </div>
          <div class="form-field">
            <label for="alertThresholdMinutes">Alert Delay Minutes</label>
            <input id="alertThresholdMinutes" name="alertThresholdMinutes" type="number" step="1" min="0" value="30">
          </div>
          <div class="form-field">
            <label class="check-row" for="inUse">
              <input id="inUse" name="inUse" type="checkbox" checked>
              In Use
            </label>
          </div>
          <div class="form-field full">
            <label for="inUseComment">In Use Comment</label>
            <input id="inUseComment" name="inUseComment" autocomplete="off">
          </div>
          <div class="form-field full">
            <label for="notes">Notes</label>
            <textarea id="notes" name="notes"></textarea>
          </div>
        </div>

        <section class="panel" id="warmerSection" hidden>
          <h2>Warmer Settings</h2>
          <div class="form-grid">
            <div class="form-field">
              <label for="roomTempCeiling">Room Temperature Ceiling</label>
              <input id="roomTempCeiling" type="number" step="0.1">
            </div>
            <div class="form-field">
              <label for="warmupStartTemp">Warmup Start Temperature</label>
              <input id="warmupStartTemp" type="number" step="0.1">
            </div>
            <div class="form-field">
              <label for="offConfirmMinutes">Off Confirm Minutes</label>
              <input id="offConfirmMinutes" type="number" step="1" min="0">
            </div>
            <div class="form-field">
              <label for="faultMinutes">Fault Minutes</label>
              <input id="faultMinutes" type="number" step="1" min="0">
            </div>
            <div class="form-field">
              <label for="slopeWindowReadings">Slope Window Readings</label>
              <input id="slopeWindowReadings" type="number" step="1" min="2">
            </div>
            <div class="form-field">
              <label for="riseMinPerMin">Rise Minimum Per Minute</label>
              <input id="riseMinPerMin" type="number" step="0.01">
            </div>
            <div class="form-field">
              <label for="fallMinPerMin">Fall Minimum Per Minute</label>
              <input id="fallMinPerMin" type="number" step="0.01">
            </div>
          </div>
        </section>

        <div class="button-row">
          <button class="btn primary" type="submit">Save Equipment</button>
          <button class="btn" type="button" id="clearBtn">Clear Form</button>
          <button class="btn" type="button" id="cancelEditBtn" hidden>Cancel Edit</button>
        </div>
      </form>
    </section>

    <section class="panel">
      <div class="table-tools">
        <div>
          <h2>Equipment</h2>
          <p class="muted">Inactive equipment is hidden unless enabled below.</p>
        </div>
        <label class="check-row" for="showInactive">
          <input id="showInactive" type="checkbox">
          Show inactive equipment
        </label>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Location</th>
              <th>Area</th>
              <th>Critical Range</th>
              <th>Target</th>
              <th>Alert Delay</th>
              <th>In Use</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="equipmentRows"></tbody>
        </table>
      </div>
    </section>
  </section>

  <section class="panel" id="tab-thresholds" hidden><h1>Threshold Settings</h1><div class="placeholder">TODO: Threshold Settings</div></section>
  <section class="panel" id="tab-probes" hidden><h1>Temperature Probe Setup</h1><div class="placeholder">TODO: Link equipment to probes</div></section>
  <section class="panel" id="tab-gateway" hidden><h1>IoT Gateway Setup</h1><div class="placeholder">TODO: Gateway setup</div></section>
  <section class="panel" id="tab-notifications" hidden><h1>Notification Settings</h1><div class="placeholder">TODO: Notification settings</div></section>
`;

const form = document.getElementById('equipmentForm');
const notice = document.getElementById('notice');
const showInactive = document.getElementById('showInactive');

function showNotice(message, type) {
  notice.hidden = false;
  notice.className = `notice ${type}`;
  notice.textContent = message;
}

function clearNotice() {
  notice.hidden = true;
  notice.textContent = '';
}

function numberValue(id) {
  const value = document.getElementById(id).value;
  return value === '' ? undefined : Number(value);
}

function setNumber(id, value) {
  document.getElementById(id).value = value === undefined || value === null ? '' : value;
}

function fillWarmerDefaults(config = WARMER_DEFAULTS) {
  Object.keys(WARMER_DEFAULTS).forEach((key) => {
    setNumber(key, config[key] ?? WARMER_DEFAULTS[key]);
  });
}

function handleTypeChange(applyDefaults = true) {
  const type = document.getElementById('type').value;
  document.getElementById('warmerSection').hidden = type !== 'warmer';
  if (applyDefaults && TYPE_DEFAULTS[type]) {
    const defaults = TYPE_DEFAULTS[type];
    setNumber('criticalMin', defaults.criticalMin);
    setNumber('criticalMax', defaults.criticalMax);
    setNumber('targetTemp', defaults.targetTemp);
    setNumber('warningBuffer', defaults.warningBuffer);
    if (type === 'warmer') fillWarmerDefaults();
  }
}

function validatePayload(payload) {
  if (!payload.name) return 'Equipment name is required';
  if (!payload.type) return 'Type is required';
  if (!Number.isFinite(payload.criticalMin)) return 'Critical minimum temperature is required';
  if (!Number.isFinite(payload.criticalMax)) return 'Critical maximum temperature is required';
  if (payload.criticalMin >= payload.criticalMax) return 'Critical minimum temperature must be lower than critical maximum temperature';
  if (payload.type === 'warmer') {
    for (const key of Object.keys(WARMER_DEFAULTS)) {
      if (!Number.isFinite(payload.warmerStateConfig[key])) return `Warmer ${key} is required`;
    }
  }
  return '';
}

function buildPayload() {
  const type = document.getElementById('type').value;
  const payload = {
    name: document.getElementById('name').value.trim(),
    type,
    location: document.getElementById('location').value.trim(),
    area: document.getElementById('area').value.trim(),
    criticalMin: numberValue('criticalMin'),
    criticalMax: numberValue('criticalMax'),
    warningBuffer: numberValue('warningBuffer'),
    targetTemp: numberValue('targetTemp'),
    alertThresholdMinutes: numberValue('alertThresholdMinutes') ?? 30,
    inUse: document.getElementById('inUse').checked,
    inUseComment: document.getElementById('inUseComment').value.trim(),
    notes: document.getElementById('notes').value.trim()
  };
  if (type === 'warmer') {
    payload.warmerStateConfig = Object.fromEntries(
      Object.keys(WARMER_DEFAULTS).map((key) => [key, numberValue(key)])
    );
  }
  return payload;
}

async function api(path, options = {}) {
  const response = await fetch('/api/etm' + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const data = await response.json();
  if (!response.ok || data.ok === false) throw new Error(data.error || 'Request failed');
  return data.data;
}

function renderSummary() {
  const active = units.filter((unit) => unit.active !== false);
  const counts = {
    total: active.length,
    freezer: active.filter((unit) => unit.type === 'freezer').length,
    chiller: active.filter((unit) => unit.type === 'chiller').length,
    warmer: active.filter((unit) => unit.type === 'warmer').length,
    ambient: active.filter((unit) => unit.type === 'ambient').length
  };
  document.getElementById('summaryCards').innerHTML = [
    ['Total active equipment', counts.total],
    ['Freezers', counts.freezer],
    ['Chillers', counts.chiller],
    ['Warmers', counts.warmer],
    ['Ambient', counts.ambient]
  ].map(([label, value]) => `<div class="summary-card"><span class="muted">${label}</span><span class="summary-value">${value}</span></div>`).join('');
}

function renderRows() {
  const tbody = document.getElementById('equipmentRows');
  if (!units.length) {
    tbody.innerHTML = '<tr><td colspan="10" class="muted">No equipment found.</td></tr>';
    return;
  }
  tbody.innerHTML = units.map((unit) => `
    <tr>
      <td>${escapeHtml(unit.name)}</td>
      <td>${escapeHtml(unit.type)}</td>
      <td>${escapeHtml(unit.location || '')}</td>
      <td>${escapeHtml(unit.area || '')}</td>
      <td>${formatNumber(unit.criticalMin)} to ${formatNumber(unit.criticalMax)} C</td>
      <td>${formatNumber(unit.targetTemp)} C</td>
      <td>${formatNumber(unit.alertThresholdMinutes)} min</td>
      <td><span class="badge ${unit.inUse === false ? 'warn' : 'ok'}">${unit.inUse === false ? 'No' : 'Yes'}</span></td>
      <td><span class="badge ${unit.active === false ? 'off' : 'ok'}">${unit.active === false ? 'Inactive' : 'Active'}</span></td>
      <td>
        <button class="btn" type="button" data-action="edit" data-id="${unit._id}">Edit</button>
        <button class="btn danger" type="button" data-action="deactivate" data-id="${unit._id}" ${unit.active === false ? 'disabled' : ''}>Deactivate</button>
      </td>
    </tr>
  `).join('');
}

function formatNumber(value) {
  return value === undefined || value === null || value === '' ? '-' : Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
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

async function loadUnits() {
  try {
    clearNotice();
    units = await api(`/units?includeInactive=${showInactive.checked}`);
    renderSummary();
    renderRows();
  } catch (err) {
    units = [];
    renderSummary();
    renderRows();
    showNotice(err.message, 'error');
  }
}

function resetForm(options = {}) {
  editingId = null;
  form.reset();
  document.getElementById('formTitle').textContent = 'Add Equipment';
  document.getElementById('cancelEditBtn').hidden = true;
  document.getElementById('warmerSection').hidden = true;
  document.getElementById('inUse').checked = true;
  document.getElementById('alertThresholdMinutes').value = 30;
  if (options.clearNotice !== false) clearNotice();
}

async function editUnit(id) {
  try {
    const unit = await api('/units/' + encodeURIComponent(id));
    editingId = unit._id;
    document.getElementById('formTitle').textContent = 'Edit Equipment';
    document.getElementById('cancelEditBtn').hidden = false;
    document.getElementById('name').value = unit.name || '';
    document.getElementById('type').value = unit.type || '';
    document.getElementById('location').value = unit.location || '';
    document.getElementById('area').value = unit.area || '';
    setNumber('criticalMin', unit.criticalMin);
    setNumber('criticalMax', unit.criticalMax);
    setNumber('warningBuffer', unit.warningBuffer);
    setNumber('targetTemp', unit.targetTemp);
    setNumber('alertThresholdMinutes', unit.alertThresholdMinutes ?? 30);
    document.getElementById('inUse').checked = unit.inUse !== false;
    document.getElementById('inUseComment').value = unit.inUseComment || '';
    document.getElementById('notes').value = unit.notes || '';
    handleTypeChange(false);
    if (unit.type === 'warmer') fillWarmerDefaults(unit.warmerStateConfig || WARMER_DEFAULTS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    showNotice(err.message, 'error');
  }
}

async function deactivateUnit(id) {
  const unit = units.find((item) => item._id === id);
  if (!window.confirm(`Deactivate ${unit?.name || 'this equipment'}?`)) return;
  try {
    await api('/units/' + encodeURIComponent(id), { method: 'DELETE' });
    showNotice('Equipment deactivated.', 'ok');
    await loadUnits();
  } catch (err) {
    showNotice(err.message, 'error');
  }
}

document.querySelectorAll('.tab-btn').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    ['equipment', 'thresholds', 'probes', 'gateway', 'notifications'].forEach((name) => {
      document.getElementById('tab-' + name).hidden = name !== button.dataset.tab;
    });
  });
});

document.getElementById('type').addEventListener('change', () => handleTypeChange(true));
document.getElementById('clearBtn').addEventListener('click', resetForm);
document.getElementById('cancelEditBtn').addEventListener('click', resetForm);
showInactive.addEventListener('change', loadUnits);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearNotice();
  const payload = buildPayload();
  const error = validatePayload(payload);
  if (error) {
    showNotice(error, 'error');
    return;
  }
  try {
    const wasEditing = !!editingId;
    if (editingId) {
      await api('/units/' + encodeURIComponent(editingId), { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      await api('/units', { method: 'POST', body: JSON.stringify(payload) });
    }
    resetForm({ clearNotice: false });
    await loadUnits();
    showNotice(wasEditing ? 'Equipment updated.' : 'Equipment created.', 'ok');
  } catch (err) {
    showNotice(err.message, 'error');
  }
});

document.getElementById('equipmentRows').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  if (button.dataset.action === 'edit') editUnit(button.dataset.id);
  if (button.dataset.action === 'deactivate') deactivateUnit(button.dataset.id);
});

// TODO: Link equipment to probes.
// TODO: Show latest reading.
// TODO: Show open alerts.
// TODO: Add audit log.

loadUnits();
