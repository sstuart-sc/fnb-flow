# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A navigable data model and viewer for the upstream-to-downstream flow of food
processing and manufacturing — a 7-step primary flow, plus nested flows
carrying implementation-grade detail for the slice currently in scope
(SafetyChain's operational surface: receiving through finished goods leaving
the dock). Built with Vue 3 + Vite.

Read [`docs/content-standards.md`](docs/content-standards.md)
before writing or backfilling any content in `public/data/core`.

## Commands

```bash
npm install
npm run dev       # vite dev server, default http://localhost:5173
npm run build     # outputs static bundle to dist/
npm run preview   # serve the production build locally
```

There is no test suite, lint config, or type checker in this repo — don't
invent commands for them.

## Layout

```
src/          — Vue components, composables, and router
public/data/  — the JSON data the viewer fetches at runtime (not bundled)
docs/         — project plan and content-quality standards
```

## Architecture

### Data model: normalized JSON, `id`/`path`/`key` are separate concerns

All content lives in `public/data/core/*.json` (flows, steps, threads,
artifacts, regulations, agencies, materials, roles, systems, sources)
plus `public/data/products/safetychain.json` (a vendor overlay). Two core
entity types:

- **Flow** — an ordered sequence of steps (`stepIds`). There's one primary
  flow; any step that warrants one owns its own nested flow.
- **Step** — always has a conceptual layer (`summary`, `regulationIds`,
  `agencyIds`, `roleIds`, `threadIds`). Optionally has a concrete layer
  (`artifactIds`, `materialIds`, `systemIds`), populated only where
  SafetyChain's implementation scope actually reaches, and optionally owns a
  `nestedFlowId` pointing at its own child flow. Nesting recurses — the
  deepest existing case is 3 levels (primary flow → grouping flow → its step
  → that step's own nested flow).

Identity is split three ways, and this split is load-bearing — do not
collapse it back into one field:

- **`id`** — opaque UUIDv4, assigned once, never renamed. The *only* thing
  any relational reference (`stepIds`, `regulationIds`, `nestedFlowId`, etc.)
  points to.
- **`path`** — human-readable, routable string. `flows` and `steps` have had
  one from the start; `regulations`, `agencies`, `systems`, `artifacts`, and
  `materials` also carry one, added to support standalone browse/detail
  pages for those 5 collections (`CollectionView.vue`/`ItemDetailView.vue`).
  This is a deliberate, bounded exception — `roles`, `threads`, and `sources`
  still have no `path` and aren't routable on their own (`threads` keeps its
  separate `key` exception below; `roles`/`sources` are browsed/opened
  in-context only). Don't add `path` to a collection without a concrete
  routable page behind it.
- **`key`** — narrow exception, only on `threads.json` (`sanitation`,
  `traceability`, `recall`, `allergen-control`). Load-bearing as a CSS
  class-name suffix (`thread-dot--sanitation`), not routable so not a
  `path`.

All path↔id translation is confined to
[`src/composables/useData.js`](src/composables/useData.js)
(`flowIdForPath`/`stepIdForPath`/`idForCollectionPath`) — components and the
router work with paths for navigation and ids for lookup, and should never
do their own string-matching against data values.

`systems.json` (core) is vendor-neutral by design ("a QMS platform," not
"SafetyChain QMS"). Vendor-specific claims live only in
`public/data/products/<vendor>.json`, referencing core ids without core ever
referencing back.

### Data loading

[`src/composables/useData.js`](src/composables/useData.js)'s `loadAllData()`
fetches every core JSON file once, memoized in a module-level
`cachePromise`, and builds the `flowIdByPath`/`stepIdByPath` indexes.
`App.vue` calls this once on mount and passes the resulting `data` object
down as a prop — there is no store; `data` is an immutable snapshot for the
session.

### Routing

Hash-based (`createWebHashHistory`), defined in
[`src/router/index.js`](src/router/index.js). The URL shape is a repeating
`/flow/:path/step/:path/...` crumb trail, parsed by `parseCrumbs` into the
same `[{type: "flow", flowPath} | {type: "step", stepPath}]` array used
everywhere downstream (breadcrumbs, `OrientationPanel`). Use the `goToFlow` /
`goToStep` / `goToNestedFlow` / `goToCrumb` / `goToSearch` / `goToSources` /
`goToCollection` / `goToItem` helpers to navigate rather than constructing
paths by hand.

The 5 collections with a `path` (regulations/agencies/systems/artifacts/
materials) each get a flat, non-crumb route pair: `/<collectionName>` (list,
`CollectionView.vue`) and `/<collectionName>/:path` (detail,
`ItemDetailView.vue`), generated in a loop in `router/index.js` rather than
hand-written per collection.

### Modals

[`src/composables/useModals.js`](src/composables/useModals.js) exposes a
single shared `reactive` `modalState` (detail modal + source modal) so any
component — including related-item chips inside `DetailModal` itself — can
open either modal without prop drilling. Opening one modal closes the other.
`DetailModal` is a lightweight preview only — for any item with a `path`, it
has a "View full page" link to that item's routable `ItemDetailView.vue`
page (fuller detail, plus a "Referenced by steps" reverse lookup that
doesn't fit a modal). `DetailModal`'s own related-item chips still open
another modal (modal-chaining); only `ItemDetailView`'s related chips
navigate to a full page.

### Search

[`src/composables/useSearchIndex.js`](src/composables/useSearchIndex.js)
builds a flat in-memory index (steps + artifacts/regulations/systems/
materials/agencies/roles) once per data load. Items from the 5 collections
with their own `path` route straight to that item's own page; roles (and any
future non-slugged collection) fall back to routing via the first step that
references them, using the generalized `buildStepReverseIndex` (in
`useData.js`) rather than a single-owner assumption — a regulation or
agency is commonly referenced by several steps, not just one. Uses Fuse.js
for fuzzy matching, with `simpleMatch` as a plain substring fallback.

## Content work (editing `public/data/core/*.json`)

Read [`docs/content-standards.md`](docs/content-standards.md) in full before
adding or editing records. The essentials:

- **Sourcing is mandatory.** Every new `artifacts`/`materials`/`systems`/
  `steps`/`regulations`/`agencies` record needs `sourceIds` pointing at
  honestly-typed `sources.json` entries (`regulation-text`,
  `industry-standard`, `vendor-doc`, or `subject-matter-judgment` — never
  fabricate a citation; use `subject-matter-judgment` and say what's
  uncertain in `note` instead). `roles`/`threads`/`flows` are exempt —
  they're structural, not externally-checkable facts.
- **Scope gating.** Concrete detail (artifacts/materials/systems) only
  belongs on steps inside the implementation slice actually being built
  toward (receiving through finished goods leaving the dock). Don't add it
  to an out-of-scope step just because research turned something up.
- **`fields` is a required test, not a judgment call**, for `artifacts`/
  `materials`/`systems`: if the record represents a single describable
  instance with named parts (a form, schema, matrix, log), it needs a
  `fields: [{name, description}]` breakdown covering every part. Omit only
  for genuinely whole-document/narrative records with no enumerable parts.
  There is deliberately no `example`/mock-instance field — it was tried and
  removed; don't reintroduce one.
- **Referential integrity** must hold after every change — no dangling
  `*Ids` anywhere, even transiently. There's no committed validation
  script; write a throwaway one when doing bulk data edits.
- Vendor-neutral by default (see Architecture above) — vendor-specific
  content goes in `public/data/products/`, not `core/`.
