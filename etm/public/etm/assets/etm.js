'use strict';

window.renderEtmShell = function renderEtmShell(active) {
  const nav = [
    ['Dashboard', '/etm/index.html'],
    ['Equipment', '/etm/equipment.html'],
    ['Alerts', '/etm/alerts.html'],
    ['Calibration', '/etm/calibration.html'],
    ['Reports', '/etm/reports.html'],
    ['Setup', '/etm/setup.html'],
    ['Gateway Log', '/etm/gateway-log.html']
  ];

  document.body.insertAdjacentHTML('afterbegin', `
    <div class="shell">
      <div class="topbar">
        <div>
          <div class="brand">Equipment Temperature Monitor</div>
          <div class="muted">ETM skeleton</div>
        </div>
        <nav class="nav">
          ${nav.map(([label, href]) => `<a href="${href}"${label === active ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
        </nav>
      </div>
      <main id="pageRoot"></main>
    </div>
  `);
};
