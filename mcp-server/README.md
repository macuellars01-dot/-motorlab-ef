# LUDOMUNDO MCP adapter (prototype)

This is an isolated prototype only. It has **not** been deployed to the NAS and is not connected to ChatGPT yet.

## Required configuration

- `MOTORLAB_API_URL`: existing MotorLab API base URL, reachable from the container.
- `MOTORLAB_TOKEN`: inject the existing token via the deployment environment; never commit it or put it in prompts/logs.
- `LUDOMUNDO_CATALOG_PATH`: path to a JSON array or `{ "games": [...] }` catalog mounted read-only. Do not assume a catalog path until checked on the NAS.

## Safety gates before deployment

1. Do not expose port 8000 publicly. This prototype has no OAuth implementation and must only be tested on an isolated private network behind a separately configured authenticated gateway/tunnel.
2. Do not deploy to the existing Docker stack until the NAS paths, network routing, API response shape, and supported ChatGPT MCP write capabilities are confirmed.
3. The adapter only intends to write `session` and `unit` records through the existing `/sync` endpoint. It does not delete records or modify game records.
4. `save_session` and `save_unit` require an explicit `confirm_write=true` parameter and validate basic structure. Test against a disposable dataset first.
5. Existing passwords and tokens must not be rotated or changed as part of this prototype.

## Tools

- `health_check`
- `search_games`
- `list_sessions`
- `list_units`
- `save_session`
- `save_unit`

## Known limitations

This is a first prototype, not production-ready. It does not implement OAuth, per-user authorization, rate limiting, or comprehensive schema validation. The `/sync` API contract and catalog JSON schema must be verified before any live test. Do not deploy as-is to a publicly reachable endpoint.
