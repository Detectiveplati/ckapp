'use strict';

renderEtmShell('Dashboard');
document.getElementById('pageRoot').innerHTML = `
  <section class="panel">
    <h1>Live Dashboard</h1>
    <p class="muted">TODO: Show live equipment status, latest readings, open alerts, and summary metrics.</p>
    <div class="grid">
      <div class="placeholder">Active units</div>
      <div class="placeholder">Open alerts</div>
      <div class="placeholder">Offline probes</div>
      <div class="placeholder">Calibration due</div>
    </div>
  </section>
`;
