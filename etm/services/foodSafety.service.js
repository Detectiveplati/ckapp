'use strict';

const ETM_FOODSAFETY_TEMPLATE_CODE = 'CAC-SOP-02-F01-TEMPMON';
const ETM_FOODSAFETY_FORM_TYPE = 'external_report';

function getEtmFoodSafetyEntryUrl(unitId, monthKey) {
  return `/etm/reports.html?unitId=${encodeURIComponent(String(unitId || ''))}&month=${encodeURIComponent(String(monthKey || ''))}`;
}

module.exports = {
  ETM_FOODSAFETY_TEMPLATE_CODE,
  ETM_FOODSAFETY_FORM_TYPE,
  getEtmFoodSafetyEntryUrl
};
