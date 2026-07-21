# F&B Flow

A navigable data model and viewer for the upstream-to-downstream flow of food
processing and manufacturing — a 7-step primary flow, plus nested flows
carrying implementation-grade detail for the slice currently in scope
(SafetyChain's operational surface: receiving through finished goods leaving
the dock).

Built with Vue 3 + Vite.

## Layout

```
src/    — Vue components, composables, and router
public/ — static assets and the data the viewer renders (public/data/)
docs/   — planning doc and content standards
```

- **[`docs/food-mfg-stream-map-plan.md`](docs/food-mfg-stream-map-plan.md)** —
  the project plan: schema, phased build-out, and the nested-flow gating
  rationale (which steps get implementation-grade detail today, and why).
- **[`docs/content-standards.md`](docs/content-standards.md)** — sourcing and
  content-quality bar for any new data added under `public/data/core`.

## Run locally

```bash
npm install
npm run dev
```

Opens on the printed localhost URL (default `http://localhost:5173`).

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # serve the production build locally
```

`dist/` is a static bundle — point any static host at it.

