# API

The Phase 1 Express server exposes:

- `GET /api/health` — service and phase status.
- `GET /api/models` — empty model registry response until trained artifacts exist.

Future route groups include `/api/dti`, `/api/predictions`, `/api/medicines`, `/api/reminders`, `/api/medication-schedules`, `/api/notifications`, and `/api/models`. Controllers, validation, services, and persistence should remain separate as those routes are added.
