# Equipment Temperature Monitor (ETM)

Clean Node.js/Express/CommonJS skeleton for rebuilding the temperature monitoring module.

This project is intentionally a skeleton. It preserves the existing MongoDB collection names, but it does not implement the full business logic yet.

## Start

```bash
npm install
npm start
```

Local URL:

```txt
http://localhost:3000/etm
```

## Railway Setup

1. Create a new Railway service from this folder.
2. Set the variables from `.env.example`.
3. Use the existing MongoDB Atlas values for:
   - `ETM_MONGODB_URI`
   - `ETM_DB_NAME`
   - `MASTERAPP_CORE_MONGODB_URI`
   - `MASTERAPP_CORE_DB_NAME`
   - `MASTERAPP_TEMPLOG_MONGODB_URI`
   - `MASTERAPP_TEMPLOG_DB_NAME`
4. Add secrets only through Railway Variables. Do not commit real keys.

## Routes

- Static frontend: `/etm`
- API base: `/api/etm`

## Safety

- The ETM runtime uses its own database and collection names such as `equipment_temperature_monitor.etm_units`.
- Existing masterapp collections are treated as migration sources only.
- No rename, delete, or reset is performed against legacy masterapp collections.
- Optional integrations such as Cloudinary, VAPID push, and LoRa TCP are placeholders.

## Migrate Existing Equipment

Set the masterapp source database variables and the target ETM database variables, then run:

```bash
npm run migrate:units
```

The migration copies `core_tempmon_units` into `etm_units`, preserves the original `_id` values for future linking, and adds source metadata.
