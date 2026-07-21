# F&B Flow — Viewer

A static, framework-free viewer for the stream-map data model. Plain
HTML/CSS/JS (ES modules) — no build step, no `node_modules`, no bundler.

## Running it

Browsers block `fetch()` of local JSON over `file://`, so double-clicking
`index.html` won't load data. Serve this `app/` folder with any static file
server:

```
cd app
python -m http.server 8000
```

Then open `http://localhost:8000/`.

From the repo root, `npm start` does the same thing (see the root
[package.json](../package.json)) if you'd rather not remember the `cd`.

Any static host works identically — GitHub Pages, S3, Netlify, Cloudflare
Pages — since `app/` is self-contained: point the host at this folder as its
publish root and it just works, `data/` included.

## How it's structured

- `index.html` — shell: header/search, breadcrumb, main content region, minimap
- `css/style.css` — all styling; theme-aware via `prefers-color-scheme` and a
  `data-theme` override hook
- `js/data.js` — fetches and caches everything under `data/`
- `js/router.js` — hash-based router; view state (`#/flow/.../step/...` or
  `#/search/...`) lives entirely in the URL, so back/forward and deep links work
- `js/render-shell.js` — breadcrumb + minimap
- `js/render-flow.js` — level 0/2: a flow's steps as a node sequence
- `js/render-step.js` — level 1/3: step detail (conceptual layer always;
  concrete layer + SafetyChain overlay only when populated)
- `js/render-search.js` — flat search index across all named entities
- `data/core/*.json` — the normalized Flow/Step data model (see
  [`docs/food-mfg-stream-map-plan.md`](../docs/food-mfg-stream-map-plan.md)
  section 5 for the schema)
- `data/products/safetychain.json` — vendor overlay mapping SafetyChain's
  modules onto core step/system/artifact ids

## Search

Uses [Fuse.js](https://fusejs.io) (vendored at `js/vendor/fuse.min.js`, v7.0.0,
~24KB, no CDN dependency at runtime) for fuzzy matching. `app.js` detects
`window.Fuse` and wires it in; if the vendor file is ever removed, search
falls back to a plain substring match in `render-search.js` rather than
breaking.
