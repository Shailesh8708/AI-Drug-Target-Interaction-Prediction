# Aegis Molecular Lab

A research-oriented foundation for computational drug-target interaction exploration and personal medicine organization.

> Aegis is an educational and organizational tool. It does not diagnose, prescribe, adjust doses, confirm biological interactions, or replace a doctor or pharmacist.

## Phase 1

The initial implementation is a responsive React/Vite workspace with an Express API boundary and a reusable visual system inspired by computational biology:

- Dashboard with workspace pulse, expiry watchlist, activity, and safety boundary.
- DTI Lab study composer with an explicit unconfigured pipeline state.
- Personal medicine cabinet with user-provided inventory and expiry statuses.
- Medication schedule organizer shell with a calendar and safety copy.
- General-information AI assistant shell with visible guardrails.
- Analytics shell that does not invent model metrics or prediction results.
- Lightweight animated molecular network visual, responsive layout, and reduced-motion support.
- API health and empty model-registry endpoints.
- Focused expiry-domain test and documentation for the future research pipeline.

## Stack

- React 19 + Vite
- Express 5 + CORS
- Lucide React icons
- Node test runner
- CSS design system with Space Grotesk, Manrope, and DM Mono

## Setup

```bash
npm install
cp .env.example .env
```

Run the client and API together:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:4000/api/health

Run them individually with `npm run dev:client` and `npm run dev:server`.

For two separate terminals, use:

```bash
# Terminal 1: backend API
npm run dev:server

# Terminal 2: frontend client
npm run dev:client
```

The frontend proxies `/api/*` to `http://localhost:4000`. If port 5173 is already in use, Vite will print the alternate frontend URL, such as `http://localhost:5174`.

## Validation

```bash
npm run build
npm test
```

## Structure

```text
src/                 React application and visual components
server/              Express API boundary
tests/               Executable domain tests
data/raw/            Licensed source datasets only
data/processed/      Reproducible dataset outputs
models/              Local trained artifacts, ignored by Git
docs/                Architecture, methodology, API, UI, and scope notes
```

## Intentionally deferred

Phase 1 does not include RDKit processing, a dataset, trained models, real prediction probabilities, authentication, persistence, notification jobs, or a medical AI service. The UI labels these surfaces as drafts, unavailable, or placeholders so demo data cannot be confused with scientific results.

The recommended next step is the independently testable molecular-processing layer: SMILES validation, RDKit parsing, deterministic descriptors, and a versioned feature contract.
