'use strict';

module.exports = {
  PORT: Number(process.env.PORT || 3000),
  JWT_SECRET: process.env.JWT_SECRET || '',
  MASTERAPP_CORE_MONGODB_URI: process.env.MASTERAPP_CORE_MONGODB_URI || '',
  MASTERAPP_CORE_DB_NAME: process.env.MASTERAPP_CORE_DB_NAME || 'masterapp_core',
  MASTERAPP_TEMPLOG_MONGODB_URI: process.env.MASTERAPP_TEMPLOG_MONGODB_URI || '',
  MASTERAPP_TEMPLOG_DB_NAME: process.env.MASTERAPP_TEMPLOG_DB_NAME || 'masterapp_templog',
  GATEWAY_API_KEY: process.env.GATEWAY_API_KEY || '',
  LORA_HTTP_TOKEN: process.env.LORA_HTTP_TOKEN || '',
  LORA_TCP_PORT: Number(process.env.LORA_TCP_PORT || 4001),
  TEMP_MON_REPORT_TZ: process.env.TEMP_MON_REPORT_TZ || process.env.TZ || 'Asia/Singapore'
};
