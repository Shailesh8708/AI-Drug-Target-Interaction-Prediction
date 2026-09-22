# Architecture

Aegis is intentionally split into a Vite React client and an Express API boundary.

- `src/` contains feature-oriented UI surfaces and reusable visual components.
- `server/` is the future home for routes, validation, services, and model orchestration.
- `data/raw/` and `data/processed/` separate source datasets from reproducible outputs.
- `models/` is reserved for versioned trained artifacts and is ignored by Git.
- `tests/` contains executable domain checks that can grow into client and API suites.

The first phase uses local display state only. It does not claim to run a trained model or connect to a medical data source.
