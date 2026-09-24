# API

The Phase 1 Express server exposes:

- `GET /api/health` — service and phase status.
- `GET /api/models` — empty model registry response until trained artifacts exist.

Future route groups include `/api/dti`, `/api/predictions`, `/api/medicines`, `/api/reminders`, `/api/medication-schedules`, `/api/notifications`, and `/api/models`. Controllers, validation, services, and persistence should remain separate as those routes are added.

## Molecular processing contract

Molecular Studio currently performs editing locally and does not require a chemistry server. The planned replaceable API boundary is:

- `POST /api/chemistry/validate` - accept a versioned molecular graph or SMILES and return validation status, method, and errors.
- `POST /api/chemistry/descriptors` - return descriptors only when produced by the configured chemistry engine.
- `POST /api/chemistry/conformer` - return validated 2D/3D coordinates and provenance, or an explicit unavailable response.
- `POST /api/structures/parse` - accept PDB/mmCIF content and return a versioned protein hierarchy with imported metadata and coordinate provenance.
- `POST /api/structures/contacts` - calculate structural contacts only through a configured coordinate-aware algorithm and return the cutoff/method used.
- `POST /api/dti/studies` - accept a validated molecule representation for a future model pipeline; no prediction is returned until a trained model is configured.

These endpoints are documented contracts, not claims that the current Express server implements RDKit processing.
