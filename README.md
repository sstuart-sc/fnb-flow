# F&B Stream

A navigable data model and viewer for the upstream-to-downstream flow of food
processing and manufacturing — the 14-step primary flow, plus nested flows
carrying implementation-grade detail for the slice currently in scope
(SafetyChain's operational surface: receiving through finished goods leaving
the dock).

## Layout

```
app/    — the static viewer (HTML/CSS/JS) and the data it renders, in data/
docs/   — planning doc and source research (not part of the deliverable)
```

- **[`app/`](app/)** — start here to run or edit the viewer. See
  [`app/README.md`](app/README.md) for how to serve it locally and how the
  code is organized.
- **[`docs/food-mfg-stream-map-plan.md`](docs/food-mfg-stream-map-plan.md)** —
  the project plan: schema, phased build-out, and the nested-flow gating
  rationale (which of the 14 primary steps get implementation-grade detail
  today, and why).
- **`docs/research/`** — the source training modules (US food industry
  fundamentals) used as initial context to populate `app/data/`. Reference
  only; not consumed by the viewer at runtime.

## Quick start

```
npm start
```

or, without Node:

```
cd app
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Status

Data population (plan phases 1–5) and the interactive viewer (phase 6) are
built. See the plan doc's "What's still open" section and the `gapIds` on
individual steps in `app/data/core/steps.json` for known content gaps.
