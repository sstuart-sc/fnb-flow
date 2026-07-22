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
docs/   — content standards
```

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

## Routing

The app uses hash-based routing (`createWebHashHistory`) rather than clean
URLs. This is deliberate for GitHub Pages: it's a static host with no
server-side rewrite rules, so a hard refresh or direct link to a
non-hash deep route (e.g. `/flow/primary-flow`) would 404 — GitHub Pages has
no way to know to serve `index.html` and let Vue Router resolve the path
client-side. Keeping the path after `#` means it's never sent to the server,
so any URL resolves to `index.html` and the router takes it from there. If
this ever moves to a host where rewrites are configurable (Netlify, Vercel,
nginx, etc.), switching to `createWebHistory` for clean URLs is
straightforward.

