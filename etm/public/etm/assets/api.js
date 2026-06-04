'use strict';

window.etmApi = {
  async get(path) {
    const response = await fetch('/api/etm' + path, { credentials: 'include' });
    return response.json();
  }
};
