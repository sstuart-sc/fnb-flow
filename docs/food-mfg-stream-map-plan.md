# Food & beverage manufacturing "stream" — project plan (v3)

> **Status as of this revision:** phases 1–6 (see section 8) are built and
> verified, the 7-step primary flow restructure is **done and
> browser-verified**, and all 11 original `gaps.json` entries are now
> resolved or removed (`gaps.json` is `{}`) — see section 11 item 5. Sections
> 2 and 3 below describe the current, live 7-step topology, not the original
> 14-step one. Data model note: all data uses opaque UUID ids with a separate
> `path` field for routing (section 5a) — the older inline JSON examples
> further down section 5 predate that and are explicitly marked historical
> where they appear. **Two new phases queued in section 11 (items 8–9):**
> a source/citation tracking mechanism (`sources.json` + `sourceIds` on
> artifacts/materials/systems/steps) so future content is sourced as it's
> written, and — as a separate, larger effort — a full data audit/expansion
> pass that also backfills sources onto everything already in the data. A
> third new phase (section 11 item 10) is also queued: replacing the plain
> list rows for artifacts/materials/systems on the step page with clickable
> cards that open a detail modal (description, example content, field
> breakdown, related items), plus a full content backfill across all
> existing records. The
> original 9 `docs/research` modules are no longer a fixed reference set the
> data is tied to. See section 10 for the full progress log and section 11
> for all next steps. Repo layout: `app/` is the self-contained static viewer
> + data (`app/data/core`, `app/data/products`), `docs/` holds this plan plus
> [`content-standards.md`](content-standards.md) (item 8a) — read that before
> any new content work (items 9, 10, or backfilling item 8's sources).
> Start any new session by reading section 10, then section 11.

## 0. What changed in this version

v2 treated all 14 primary stages the same way — every stage was expected to eventually carry the full facet set (sub-processes, artifacts, materials, roles, systems). That's wrong for stages outside the slice we actually care about implementing against right now.

The correction: the primary flow is for orientation — learning what each step is and how it fits the whole picture, with its general supporting facts (regulations, agencies, roles) still present. Concrete, implementation-grade detail — specific artifacts, systems, materials, architecture gaps — only belongs in a **nested flow**, and a primary step only gets a nested flow if it's inside the slice we're actually building toward right now (SafetyChain's operational scope). Steps outside that slice stay at the conceptual level — you still learn what they are and how they connect, just not down to the artifact/schema level, because that depth isn't needed there yet.

## 1. What this is

A navigable mental model of the entire upstream-to-downstream flow of food processing and manufacturing. One primary flow gives you the whole picture at a glance. Some of its steps expand into their own nested flow — a finer sequence with the concrete detail (artifacts, materials, systems) an implementer needs. Regulations, agencies, artifacts, materials, roles, and systems are never top-level navigation — they're detail attached to whichever step needs them, revealed when you drill in.

## 2. The primary flow

**Superseded the original 14-step list — this is the live, built primary flow.**
Re-derived from the source material's own 7-step "Farm to Fork" framing, once it
became clear the original 14-step list was already a mix of those actual
top-level steps and what should have been nested-flow detail one level down
(e.g. "Packaging" and "Labeling" aren't peers of "Processing & production" —
the source material treats them as sub-parts of one bigger stage). See section 10 for
the full rationale and how the regrouping was executed.

1. **Primary production** — farms, ranches, fisheries; growing or raising the raw agricultural input before it enters the commercial supply chain.
2. **Ingredient sourcing & procurement** — selecting and qualifying suppliers, receiving their shipments, and storing raw materials until they're pulled for production.
3. **Processing & manufacturing** — planning, preparing, and running the transformation of raw materials into finished product, with in-process quality control alongside it.
4. **Packaging** — filling, sealing, and packing product, then applying and verifying its label.
5. **Distribution** — storing finished goods and shipping them out through cold-chain-aware logistics to the next link in the supply chain.
6. **Retail / foodservice** — downstream receipt, shelf placement, prep by a foodservice operator.
7. **Consumer** — consumption, complaints, feedback; also where a recall trigger originates and has to travel back upstream.

Every one of these 7 always gets the conceptual layer: what it is, why it matters, the general regulations/agencies/roles associated with it (for steps 2–5, this is the *union* of what their constituent children carried — see below) — enough to actually learn the step and place it in the overall picture. That layer is populated for all 7, regardless of what follows in section 3.

**What happened to the old 14 steps?** Steps 1, 13 (now 6), and 14 (now 7) are unchanged — same id, same content, just resequenced. The other 11 (old steps 2–12) didn't disappear — they're now nested-flow steps living *inside* one of the 4 new grouping primary steps (2–5), and **each one still owns its own pre-existing detailed nested flow untouched**:

| New primary step | Its nested (grouping) flow contains, in order | Each of those still owns its own further-nested flow |
|---|---|---|
| 2. Ingredient sourcing & procurement | Supplier sourcing & qualification, Inbound logistics & receiving, Raw material storage | ✅ all 3 unchanged |
| 3. Processing & manufacturing | Formulation & production planning, Pre-production preparation, Processing & production, In-process quality control | ✅ all 4 unchanged |
| 4. Packaging | Packaging *(renamed to "Packaging (fill, seal & pack)" / path `packaging-fill-seal` to avoid colliding with the new primary step's own name — same id, unchanged content)*, Labeling | ✅ both unchanged |
| 5. Distribution | Finished goods storage & warehousing, Outbound distribution & logistics | ✅ both unchanged |

This makes the hierarchy 3 levels deep in the deepest case: primary flow → grouping flow (e.g. "Processing & Manufacturing — Nested Flow") → one of its steps (e.g. "Processing & production") → *that* step's own nested flow (e.g. "Processing & Production — Nested Flow," containing CCP monitoring, etc.) → concrete layer. Confirmed working end-to-end in the browser, including a full 6-crumb breadcrumb at maximum depth.

## 3. Which primary steps get a nested flow, and why

A nested flow is a child sequence of finer steps living inside a primary step, carrying the concrete layer: specific artifacts (with format and lifecycle), specific systems, materials/equipment, and known architecture gaps. It's only worth building where we're actually implementing against the domain — right now, that means the slice SafetyChain's platform operates in: inside the plant, from receiving through finished goods leaving the dock.

**Note (post-restructure):** now that the primary flow is the coarser 7-step list (section 2), the gating question below is less interesting at the primary level — 4 of the 7 primary steps almost trivially get a nested flow, since each one is just a container for 2–4 of the old, already-implementation-relevant steps. The gating decision that actually still matters moved down a level, onto each of *those* children (still exactly the same 11 old primary steps, now living one level deeper) — that's the table this section originally described, and it's unchanged in substance, just re-homed:

| Primary step (new, 7 total) | Nested flow now? | Why |
|---|---|---|
| 1. Primary production | No | Outside the plant; conceptual context only |
| 2. Ingredient sourcing & procurement | Yes — contains: Supplier sourcing & qualification, Inbound logistics & receiving, Raw material storage | Each child still has its own full nested flow (Supplier Compliance; Food Safety Programs / receiving checks; Production Monitoring / inventory & FEFO respectively) |
| 3. Processing & manufacturing | Yes — contains: Formulation & production planning, Pre-production preparation, Processing & production, In-process quality control | Each child still has its own full nested flow (Production Monitoring; Production Monitoring; Food Safety Programs + Production Monitoring; Quality Management respectively) |
| 4. Packaging | Yes — contains: Packaging (fill, seal & pack), Labeling | Each child still has its own full nested flow (Production Monitoring; Quality Management respectively) |
| 5. Distribution | Yes — contains: Finished goods storage & warehousing, Outbound distribution & logistics | Finished goods storage has a full nested flow (Production Monitoring, Traceability); outbound distribution's is still **partial — traceability events only**, since SafetyChain's reach there is the trace record, not full logistics management, and it's beyond the plant boundary |
| 6. Retail / foodservice | No | Outside the plant; conceptual context only |
| 7. Consumer | No | Outside the plant; conceptual context only |

This gating is a data flag, not a structural limit — nothing stops step 1, 6, or 7 from getting a nested flow later if the scope of what we're building ever extends there (e.g., a future upstream-supplier-facing tool, or a downstream retail-facing one). It just isn't built now because there's no implementation target there yet. Same reasoning applies at every level down: a nested-flow step could in principle get a further nested flow, exactly as already happened here — the schema recurses to however many levels turn out useful (confirmed in practice, not just in theory, now that a real 3-level case exists and works).

**Still flagged for correction, unchanged from the original caveat:** which of the (now-nested) 11 children actually warrant full implementation depth, and whether outbound distribution's "partial" scoping is right, is still this author's read of where SafetyChain's actual product surface sits — not something confirmed against internal docs. See section 11 next steps.

## 4. Cross-cutting threads (not steps)

These recur across multiple primary steps and/or nested-flow steps rather than living in one place. Each thread is a filter/overlay — click "follow this thread" and whatever it touches lights up, with thread-specific detail wherever it appears.

- **Sanitation & cleaning** — touches receiving, pre-production prep, processing (changeovers), packaging, finished goods storage.
- **Traceability & lot genealogy** — touches every primary step from receiving through consumer; every step produces a traceability event, at whatever depth that step is populated to.
- **Recall & withdrawal** — an exception flow, triggerable from any step, that has to move backward and forward through the whole primary flow fast, regardless of nested-flow depth.
- **Allergen control** — touches receiving, storage, formulation, prep, production, packaging, labeling.

Threads can reference primary steps even where there's no nested flow yet (e.g., recall has to be able to point back to "primary production" conceptually, even though that step has no implementation detail).

## 5. Data model — Flow/Step, normalized, expandable JSON

Two core entity types instead of one:

- **Flow** — an ordered sequence of steps. There's exactly one primary flow today; each step that warrants one (section 3) owns its own nested flow.
- **Step** — a single node in a flow. Always has the conceptual layer (summary, regulations, agencies, roles). Optionally has the concrete layer (artifacts, materials, systems, gaps) — populated only on nested-flow steps — and optionally owns a `nestedFlowId` pointing to its own child flow.

This makes "nested flow" a property of a step (does it own a child flow or not) rather than a separate mechanism, so the same schema recurses to however many levels turn out to be useful, without redesigning anything.

Everything else stays normalized per your call on question 3 — artifacts, regulations, agencies, materials, roles, systems, gaps each live in their own collection, referenced by id, so a fact like "FDA" or "GS1 GTIN" is defined once no matter how many steps reference it.

### 5a. Identity model — `id`, `path`, and `key` are three separate things

**This superseded the original id scheme and is the current, live shape.**
Originally every record's dict key doubled as its relational id *and* was a
content-derived slug (e.g. `"packaging"`). That collapsed three independent
concerns into one string and caused a real problem: restructuring the primary
flow needed a step literally named "Packaging" at a new level, which collided
with the existing leaf-level step already using that id — forcing either a
breaking rename of already-referenced data, or an awkward workaround. Neither
is acceptable in a normalized model, where a change in what something is
*called* should never cascade into every place that refers to *what it is*.

The fix, applied as a full migration (see section 10's most recent entries):

- **`id`** — opaque (a real UUIDv4), assigned once, never renamed, never
  derived from content. This is the only field any relational reference
  (`stepIds`, `regulationIds`, `nestedFlowId`, `flowId`, `agencyId`, etc.)
  ever points to.
- **`path`** — a separate, human-readable, routable string. Only collections
  the viewer actually navigates to directly need one: **`flows` and `steps`**.
  The router puts `path` values in the URL hash (`#/flow/<path>/step/<path>`),
  never `id`. A step or flow can in principle be re-pathed (e.g. on a rename)
  without touching its `id` or anything that references it — though nothing
  currently exercises that; today `path` was seeded 1:1 from each record's old
  slug and hasn't diverged.
- **`key`** (narrow exception) — **only** `threads.json` has this. Threads
  aren't routable (nothing links to `#/thread/...`), so they don't get
  `path` — but their 4 values (`sanitation`, `traceability`, `recall`,
  `allergen-control`) are load-bearing as CSS class-name suffixes
  (`thread-dot--sanitation`) and were previously hardcoded that way in the
  viewer JS. `key` is that stable, non-relational lookup string — deliberately
  not called `path` since nothing routes to it, and not reused for any other
  collection since no other reference collection (artifacts, regulations,
  agencies, materials, roles, systems, gaps) has a load-bearing slug anymore.
  Everywhere else, the old slug was **dropped entirely** on migration — pure
  normalization, `id` is the only identifier, per an explicit call to not keep
  legacy slugs around "for readability" once they're not doing real work.

Current step shape (fields present on every step, values illustrative — real
`id`s are UUIDs, shown shortened here for readability):

```json
{
  "id": "d12acc63-...",
  "path": "primary-production",
  "flowId": "4997a26b-...",
  "sequence": 1,
  "name": "Primary production",
  "summary": "...",
  "regulationIds": ["bbacc25c-..."],
  "agencyIds": ["2cf6d02e-...", "..."],
  "roleIds": ["1563754a-...", "..."],
  "threadIds": ["3512a7c6-...", "..."],
  "nestedFlowId": null,
  "artifactIds": [],
  "materialIds": [],
  "systemIds": [],
  "gapIds": []
}
```

A step that owns a nested flow just has `nestedFlowId` pointing at the nested
flow's `id` (not its `path`) — the viewer resolves that flow's own `path` at
render time when it needs to build a URL. Everything else in this section's
older examples (below) is now stale in its literal `id` values but otherwise
still describes the right shape.

Proposed file layout (as built — see note below on the actual path prefix):

```
/data
  /core
    flows.json          # { "primary-flow": { name, stepIds: [...] }, "receiving-nested-flow": {...}, ... }
    steps.json           # every step across every flow, keyed by id — see shape below
    threads.json         # sanitation, traceability, recall, allergen — stepIds[] they touch, at any depth
    artifacts.json        # documents/records/data objects (e.g. Master Sanitation Schedule, COA)
    regulations.json      # named rules (e.g. FSMA Preventive Controls), each referencing an agencyId
    agencies.json         # FDA, USDA FSIS, EPA, TTB, state/local — deduplicated
    materials.json        # physical inputs/equipment (sanitizer chemicals, CIP systems, scales)
    roles.json            # who performs/verifies each step
    systems.json          # ERP/MES/QMS/WMS/traceability platforms, vendor-neutral by default
    gaps.json             # known missing content, carried over for later research
    sources.json          # traceability mechanism (item 8): { id, name, type, citation/url, note } —
                            # `type` is one of "regulation-text" | "industry-standard" | "vendor-doc" |
                            # "subject-matter-judgment". Empty ({}) until content is sourced against it.
                            # artifacts/materials/systems/steps may carry an optional `sourceIds: []`
                            # pointing here — added going forward per item 8; backfilling it onto
                            # existing records is item 9, not done as part of adding the mechanism.
  /products
    safetychain.json      # optional overlay — maps SafetyChain's modules onto step/system/artifact ids
```

**Note:** this data lives at `app/data/` in the actual repo (not `/data` at
the repo root) — `app/` is the self-contained servable unit, and the data
sits inside it so the viewer can `fetch()` it without a sibling-folder
dependency. The internal `/core` and `/products` structure above is
unchanged, only the prefix differs from what's shown here.

The remaining examples in this section (through the end of section 5) predate
the id/path migration in §5a — their field *names* are still correct but
their `id`/`flowId`/`nestedFlowId` *values* shown as readable slugs
(`"primary-production"`, `"primary-flow"`, etc.) are historical. In the real
data those values are opaque UUIDs; the readable string shown here is now
that record's `path`, not its `id`. Kept as-is because they still communicate
the shape clearly — cross-reference against §5a for the current literal truth.

Step shape — a primary-flow step with no nested flow (conceptual only):

```json
{
  "id": "primary-production",
  "flowId": "primary-flow",
  "sequence": 1,
  "name": "Primary production",
  "summary": "Farms, ranches, and fisheries growing or raising the raw agricultural input.",
  "regulationIds": ["fsma-produce-safety-rule"],
  "roleIds": ["grower", "farm-operator"],
  "threadIds": ["traceability"],
  "nestedFlowId": null,
  "artifactIds": [],
  "materialIds": [],
  "systemIds": [],
  "gapIds": []
}
```

Step shape — a primary-flow step that owns a nested flow:

```json
{
  "id": "processing-production",
  "flowId": "primary-flow",
  "sequence": 7,
  "name": "Processing & production",
  "summary": "Transformation of prepared inputs into finished product.",
  "regulationIds": ["fsma-pchf"],
  "roleIds": ["line-operator", "qa-verifier"],
  "threadIds": ["sanitation", "traceability", "allergen-control"],
  "nestedFlowId": "processing-production-nested",
  "artifactIds": [],
  "materialIds": [],
  "systemIds": [],
  "gapIds": []
}
```

A step inside that nested flow, carrying the concrete layer:

```json
{
  "id": "ccp-monitoring",
  "flowId": "processing-production-nested",
  "sequence": 2,
  "name": "CCP monitoring",
  "summary": "Continuous or scheduled monitoring of critical control points during a run.",
  "regulationIds": ["fsma-pchf"],
  "roleIds": ["line-operator", "qa-verifier"],
  "threadIds": ["sanitation", "traceability"],
  "nestedFlowId": null,
  "artifactIds": ["ccp-monitoring-log", "corrective-action-record"],
  "materialIds": ["temperature-probe"],
  "systemIds": ["mes-generic"],
  "gapIds": ["ccp-entity-model"]
}
```

Empty arrays (`artifactIds: []`, etc.) on conceptual-only steps are intentional, not placeholders to fill in later — they should stay empty until that step is actually promoted into the implementation scope.

## 6. Keeping SafetyChain (and any future vendor) as an overlay, not the core

Unchanged from v2: `systems.json` entries are generic and vendor-neutral by default. `/data/products/safetychain.json` maps SafetyChain's actual modules onto relevant step/system/artifact ids, referencing into the core data without the core ever referencing back. A second vendor, or a fuller build-out of steps 1, 13, 14, or the rest of step 12, would extend the same way — new nested flows and/or a new `/products` file — without touching what already exists.

## 7. Interaction model

(Written when the primary flow had 14 steps and 1 level of nesting — "14" and
"level 3 is as deep as it goes" below are historical. The model itself held
up unchanged: it now just has 7 primary steps and, in the deepest case, one
extra level of nesting. See section 2 and section 10's newest entries.)

- **Level 0 — the primary flow.** All 14 steps at a glance, in sequence. Steps with a nested flow are visually distinguished (e.g., a small indicator) from conceptual-only steps, so it's clear at a glance where you can go deeper.
- **Level 1 — step detail (conceptual layer).** Click any of the 14 to see its summary, regulations/agencies, and roles — available for all 14 regardless of nested-flow status.
- **Level 2 — nested flow.** For steps that have one, drill further into its own mini-sequence, rendered the same way as the primary flow one level down.
- **Level 3 — nested-flow step detail (concrete layer).** Click a step inside a nested flow to see its artifacts, materials, systems, and gaps.
- **Breadcrumb + mini-map.** Always show the path back to the primary flow, plus a persistent small view of the whole thing so the big picture isn't lost while deep in a nested flow.
- **Search/reference mode.** A flat search across all artifacts/regulations/systems for when you know what you want, with a breadcrumb showing where it lives.

## 8. Phased plan

1. Confirm the primary flow (section 2, unchanged) and the nested-flow gating table (section 3) — the table is the main new thing to sanity-check.
2. Finalize the Flow/Step schema in section 5 — field names, required vs. optional.
3. Populate `/data/core`: conceptual layer for all 14 primary steps first (fast — mostly re-homing what's already in the source research), then the concrete layer for the nested flows under steps 2–11 (and partially 12).
4. Layer in `/data/products/safetychain.json` once core population is solid.
5. Fill the known gaps (the 12-item list from the earlier matrix pass) as targeted research, now that each one has a specific nested-flow step to attach to.
6. Package `/data`, this plan, and the interaction model as a spec for a VSCode/Claude Code session to build the interactive viewer.
7. Iterate on interaction details once a working prototype exists.

## 9. What's still open

- Sanity-check the nested-flow gating table in section 3 — especially step 12 (outbound distribution), which is only partially in scope, and any of steps 2–11 that might not actually need full implementation depth. **Not yet done** — the table was populated as originally drafted, not re-adjudicated against internal SafetyChain docs.
- Confirm the Flow/Step schema in section 5 is the right shape before content population started. **Done implicitly** — content population (phase 3) went ahead using this exact schema and it held up with no redesign needed; see section 10.

## 10. Progress log

**Item 9a completed — citation backfill + correctness audit on all remaining collections (artifacts/materials/systems/steps) — done, browser-verified.** Follows the regulations+agencies batch documented in the entry below.
- Verified all 52 `artifacts.json`, 9 `materials.json`, and 11 `systems.json` records via real web lookups (parallel research agents across manufacturer/technical docs, GS1.org, ecfr.gov, FDA/USDA guidance, trade publications) — not assumed from training knowledge. Every record now carries `sourceIds`; most generic internal-process artifacts (e.g. "Receiving Log," "Hold/Quarantine Tag") were honestly typed `subject-matter-judgment` rather than force-fit to an external citation that doesn't really apply, per `content-standards.md` §2.
- **Real errors caught and fixed, not just missing citations:**
  - The **Carrier Handoff KDE Set** artifact — ironically one of the original gap-resolution artifacts from an earlier pass — misstated FSMA 204's actual required Shipping CTE fields: it wrongly listed "transporter identity" as a required KDE (21 CFR 1.1340 explicitly excludes the transporter from the recipient-location KDE) and treated GTIN/GLN as mandated formats when the rule is identifier-format-agnostic (GS1 identifiers are a permitted implementation choice, not a requirement). Corrected to the actual required field list and added the two fields it had omitted (TLC source information, reference document type/number).
  - **FSIS Label Submission** artifact repeated the same stale "pre-approval as default" error already caught and fixed in agencies.json's earlier batch — corrected to reflect that generic label approval (self-certification) has been the norm since 2013/2023, with pre-approval now limited to temporary/religious-exempt/special-claim labels.
  - **Supplier Risk Scoring Matrix**'s specific audit-frequency-by-risk-tier bands (6–12/12–24/24–36 months) were flagged as invented specificity dressed as a standard — not traceable to any authoritative FSMA/GFSI source. Re-typed honestly as `subject-matter-judgment` with an explicit caveat rather than left implying regulatory backing, exactly the failure mode `content-standards.md` warns against.
  - **Label Compliance Check Catalog** cited the wrong CFR sections for "low fat" and "reduced sodium" nutrient-content claims (both were implied under 101.54, which actually governs "good source of" claims) — corrected to 101.62 (low fat) and 101.61 (reduced sodium) respectively.
  - Several **systems.json** vendor/product names were stale: Wonderware → AVEVA MES, Plex Systems → Plex MES (acquired by Rockwell Automation, 2022), Körber/HighJump → Infios (2025 rebrand), "Intelex (CORITY)" was a fabricated merger (the two are separate competing companies — split back into two entries), FoodLogiQ → Trustwell (2023 rebrand, kept as "Trustwell (formerly FoodLogiQ)"), rfxcel → labeled with its 2021 acquirer (Antares Vision Group). Fishbowl was removed from the WMS example list (confirmed SMB-tier, not enterprise-grade). Label Traxx and Nulogy were removed from Label Management Software examples (confirmed category mismatches — converter-side ERP and contract-packaging collaboration software respectively, not label-creation/compliance tools). IBM Food Trust was directly re-checked given IBM's history of sunsetting blockchain platforms (e.g. TradeLens) — confirmed still actively developed (a 2024/2025 IBM/iFoodDS FSMA-204 joint solution was found), not stale.
  - A step summary ("Raw material storage") still said "FIFO/FEFO rotation," inconsistent with the correct FEFO-only terminology already verified and used everywhere else in the data — corrected during the steps spot-check pass.
- All 68 steps were spot-checked for plausibility (prose read against their own referenced, already-verified regulations/agencies) — no `sourceIds` added per the structural exemption, but the FIFO/FEFO fix above came out of this pass.
- Full referential-integrity re-validated after every write: all `sourceIds`/`agencyId`/`regulationIds`/`roleIds`/`artifactIds`/`materialIds`/`systemIds`/`threadIds`/`stepIds` references across all 11 core files resolve, zero dangling ids, every record's dict key matches its own `id`. `sources.json` grew from 41 (regulations+agencies batch) to 115 entries.
- Browser-verified: a mid-depth step (Inbound logistics & receiving) and a maximum-depth leaf step with a full concrete layer (CCP monitoring, 3 levels deep) both render correctly with corrected content — confirmed the MES system card shows the corrected "AVEVA MES (formerly Wonderware), Plex MES (Rockwell Automation)" platform names, the HACCP Plan artifact shows the corrected FSIS-vs-PCHF revalidation-cadence distinction, and the source modal resolves real, correct citations (e.g. Sanitary Transportation Rule → 21 CFR Part 1 Subpart O, 2016, with working external link). Zero console errors.
- **Not done as part of this pass:** `roles`/`threads`/`flows` remain out of `sourceIds` scope entirely (structural, per `content-standards.md`) — the "spot-check for plausibility" called for on those was folded into the same read-through as the steps check, not a separate deep pass.

**Sources page + source modal — done, browser-verified.** Closes the loop on item 8's "Sourced (n)" note, which was inert placeholder text until now.
- Added a real header nav bar (`.app-header__nav`, centered between brand and search) with two items: **Flow** (the existing primary-flow/step browsing view, now also reachable via nav rather than only the brand link) and **Sources** (new). Active state highlights whichever mode the router is in.
- New `#/sources` route (`router.js`) and `app/js/render-sources.js`: a dedicated page listing every `sources.json` entry, grouped by `type` (Regulation text / Industry standard / Vendor documentation / Subject-matter judgment), with a live text filter and a type dropdown. Each source card shows its citation/note, a direct external link ("Read the source ↗") when a `url` exists, and a "Cited by" line built from a reverse index across every `sourceIds`-eligible collection (regulations, agencies, artifacts, materials, systems, steps) — so the sources page works as a real reference page a reader can browse independent of the step-by-step flow, per the original request.
- New `app/js/render-source-modal.js`: a small reusable modal, opened by clicking the "Sourced (n)" note (now a real button) on any `listCard` item in `render-step.js` (Regulations, Agencies, Roles-adjacent cards, Artifacts, Materials, Systems — the helper is shared across all of them). Per explicit UX decision, the modal links **straight to each source's own external URL/citation** rather than routing through the sources page — the sources page is the standalone reference destination, the modal is the fast in-context lookup, and the two intentionally don't chain into each other.
- Modal has standard affordances: overlay-click-to-close, Escape key, visible × close button, focus moves to the close button on open.
- Browser-verified via Playwright: nav bar renders with correct active-state highlighting on both Flow and Sources; the sources page renders all 41 sources grouped correctly and the text filter narrows results live (tested filtering to "GS1", correctly narrowed to 2 industry-standard entries); the modal opens with correct content, correct external link, and dismisses correctly. Zero console errors across all three checks.

Read newest-first; each entry says what was done, what was verified, and what's known-incomplete.

**Item 9a batch 1 — regulations + agencies citation backfill — done, real findings surfaced.**
- Verified all 21 `regulations.json` and all 10 `agencies.json` records via real web lookups (parallel research agents against fda.gov, ecfr.gov, usda.gov, epa.gov, ttb.gov, ftc.gov, cdc.gov, gs1.org, mygfsi.com, congress.gov, federalregister.gov — not assumed from training knowledge), per `content-standards.md` §2's ban on fabricated citations. Every regulation and agency record now carries `sourceIds` pointing at real, checkable `sources.json` entries (41 total sources added this batch).
- **Real errors caught, not just missing citations:**
  - USDA FSIS's summary previously claimed mandatory recall authority — false. FSIS recalls are voluntary only; FSIS's only lever against a refusing firm is DOJ referral for detention/seizure. Corrected.
  - FSMA Section 204 (Food Traceability Rule)'s `complianceDeadline` was stale: `2026-01-20` in the data, but FDA proposed a 30-month extension in August 2025 and a 2026 congressional appropriations act subsequently made `2028-07-20` the binding enforcement date. Corrected — this is exactly the kind of drift this audit exists to catch.
  - Bioterrorism Act's summary incorrectly attributed biennial facility-registration renewal to the original 2002 Act; that requirement was actually added later by FSMA (2011). Also corrected "one-up/one-down" to the official term "one-up, one-back." Both fixed.
  - TTB's wine ABV threshold was imprecise ("above 7%" vs. the correct "7% or greater"); FDA's summary had a backwards infant-formula recall framing and listed an irrelevant key office (CVM); NBFDS conflated three distinct dates (2016 enactment / 2018 final rule / 2022 mandatory compliance) into a single misleading "2022." All corrected.
  - Several records (FMIA, PPIA, EPIA, FPLA, HACCP rules, NOP) were missing citations entirely (present in name/summary but no `citation` field) — backfilled with verified citations.
- Full referential-integrity check re-run after: all `agencyId`/`sourceIds` references across `regulations.json`/`agencies.json` resolve into `sources.json`, no dangling ids, every record's dict key matches its own `id`.
- Browser-verified: stepped into a step with populated Regulations/Agencies cards (Primary production) and confirmed the "Sourced (n)" note (already built for artifacts/materials/systems in item 8) applies automatically to regulations/agencies too, since `listCard` is shared — no additional UI work needed for this batch.
- **Not done in this batch:** `artifacts` (52), `materials` (9), `systems` (11), and `steps` (68) still need the same real-lookup treatment — item 9a is not complete until those are done too. `roles`/`threads`/`flows` still need the lighter spot-check pass content-standards.md calls for (no `sourceIds`, just plausibility).

**All 11 original gaps resolved/removed; nested-flow orientation UX reworked — done, browser-verified.**
- Reworked how nested flows surface in the viewer: the old "Drill into X →" CTA button on a parent step's page was replaced with an **inline nested-flow preview** rendered directly on the page (the parent step's own nested-flow steps shown as a mini flow row, clicking a child step goes straight to its detail page). The right-side minimap was replaced with a **persistent left-side orientation panel** that shows every flow level on the current crumb path simultaneously (primary flow, grouping flow, leaf nested flow), each with the active step highlighted — not just the primary flow, and not requiring a separate breadcrumb bar, which was removed entirely (its job is now fully covered by the panel's multi-level highlighting). A header home-link was added (click the app title/brand to return to the primary flow from anywhere, including the same-hash edge case where `location.hash` wouldn't otherwise change).
- Removed several UI elements found to be pure noise on inspection: the unlabeled colored thread dots on flow-step cards (replaced with labeled mini chips — "Sanitation", "Traceability", etc. — keeping the color-coding but making them legible without a hover); the orange/amber "has a nested flow" badge dot (removed outright — deemed pointless once the inline preview and orientation panel already make nested-flow presence obvious); the "Known Gaps" card on step detail pages and Gap entries from search (gaps are tracked for internal use in `gaps.json` only, never meant to be user-facing); the "SafetyChain Overlay" section on step detail (the product-overlay data model is intentionally being kept for later, not built out as a UI yet); flow names' redundant "— Primary Flow"/"— Nested Flow" authoring-label suffixes (stripped at render time via a shared `displayFlowName` helper, not by editing the underlying data).
- Resolved all 11 `gaps.json` entries one at a time, each following the same pattern: read the step + its existing artifacts, check the (former) `docs/research` modules for grounding where available, design the missing content as a new artifact (or extended lifecycle text on an existing one) grounded in real standards where possible (GS1 variable-measure/catch-weight conventions, FSMA 204 Key Data Elements, FDA nutrient-claim thresholds, standard EMP zone practice) or original domain design where no source existed (allergen sequencing algorithm, supplier risk-scoring tier matrix), attach it to the step, delete the gap entry, then re-validate full referential integrity across all 10 core files. New artifacts added this way: **CCP Definition**, **Supplier Risk Scoring Matrix**, **Supplier Performance Scorecard**, **Structured COA Data Schema**, **EMP Zone & Trending Standard**, **Allergen Sequencing Algorithm**, **Catch-Weight Data Model**, **Label Compliance Check Catalog**, **Carrier Handoff KDE Set** (9 gaps resolved this way). The remaining 2 (EPCIS record format not yet FDA-mandated; outbound distribution & logistics nested flow deliberately partial) were recognized as accurate statements about real external uncertainty / a deliberate scope decision, not unfinished design work — force-resolving them would have meant asserting a false certainty, so they were removed outright instead. `gaps.json` is now `{}`.
- Validated after every single gap resolution (not batched at the end): a script re-checks every cross-reference across all 10 core JSON files resolves, with zero dangling ids at each step. Also spot-verified several resulting step pages in headless Chrome (CCP monitoring, Supplier risk assessment) to confirm the new artifacts render correctly in the Implementation Detail grid.
- **Not done as part of this pass:** the `docs/research/*` source modules used for grounding were noted to no longer exist on disk partway through this work (not something this session removed) — flagged to the user, who confirmed the project is intentionally moving past that fixed doc set rather than restoring it. See section 11 items 8–9 for what replaces it as an ongoing practice.

**7-step primary flow restructure — done, browser-verified.**
- Executed the regrouping plan laid out in section 2's table above (the 7-primary-steps-absorb-the-old-11 mapping) — that table describes exactly what ran. Scripted (throwaway, scratchpad-only) against the already-clean id/path data from the migration below: created 4 new "grouping" nested flows (`ingredient-sourcing-procurement-nested`, `processing-manufacturing-nested`, `packaging-grouping-nested`, `distribution-nested`), created 4 new primary steps (paths `ingredient-sourcing-procurement`, `processing-manufacturing`, `packaging`, `distribution`) each owning one of those grouping flows, moved the 11 old primary steps (old sequence 2–12) out of `primary-flow` and into whichever grouping flow they belong to (their own existing nested flow — e.g. `supplier-sourcing-qualification-nested` — was untouched), and rebuilt `primary-flow.stepIds` down to the new 7. Steps 1 (Primary production), 13→6 (Retail/foodservice), 14→7 (Consumer) were left alone, just resequenced.
- The one real naming collision flagged as a risk in the prior entry — the old leaf-level "Packaging" step (fill/seal/catch-weight) vs. the new primary step also called "Packaging" — was resolved by renaming the leaf step's `path`/`name` to `packaging-fill-seal` / "Packaging (fill, seal & pack)". Its `id` never changed, so nothing referencing it broke; this is exactly the scenario the id/path migration was done to make cheap instead of breaking.
- New primary steps' conceptual layer (`regulationIds`/`agencyIds`/`roleIds`/`threadIds`) was populated as the **union** of whatever their absorbed children already had — not re-researched from scratch, not left empty. `threads.json` was also updated so each new primary step appears in a thread's `stepIds` whenever any of its children did.
- `safetychain.json` needed no changes — its `mapsToStepIds` etc. point at the old leaf-level step ids directly, none of which changed identity (only their `flowId`/`sequence` changed to reflect the new parent).
- Validated programmatically with an extended version of the migration-era validation script: all existing checks still pass (68 steps, 16 flows, no dangling refs, unique paths/keys), plus two checks added specifically for this restructure — every one of the 68 steps is *transitively* reachable from `primary-flow` by walking `nestedFlowId` recursively (not just directly listed in some flow's `stepIds`), and max nesting depth from `primary-flow` is confirmed at 3 (the deepest case: primary → grouping flow → grouping-flow step → that step's own nested flow).
- Browser-verified after the data change, catching nothing new broken (the id/path migration's fixes to router/render-flow/render-step already generalized correctly to a deeper hierarchy with zero further code changes) — confirmed: the new 7-node primary flow view with correct nested-flow badges and aggregated thread dots; a grouping flow's own view (4 children in order); and the maximum-depth case, a full 6-crumb breadcrumb (Primary Flow → Processing & manufacturing → its grouping flow → Processing & production → *its own* nested flow → CCP monitoring) with the concrete layer, gap card, and SafetyChain overlay all still rendering correctly at that depth. Also spot-checked search still correctly distinguishes "Packaging (fill, seal & pack)" from the new primary "Packaging" with no naming confusion.
- **Not done as part of this pass** (deliberately out of scope, tracked separately in section 11): re-adjudicating the gating table's *substance* (section 3) against real SafetyChain product knowledge, and the thread click-to-filter interaction.

**Id/path identity migration — done, browser-verified. (7-step restructure that motivated it: see entry above — now also done.)**
- User asked for the primary flow to be re-derived from the source material's own bird's-eye framing rather than the 14-step list, which turned out to already mix its top-level steps with what should be nested-flow detail (see section 2's pending-change note). Two decisions were confirmed before any data changes: (a) match the source material's 7-step Farm-to-Fork list exactly (not its narrower 6-segment list), and (b) the existing recursive `nestedFlowId` design already supports a 3rd nesting level with no schema change.
- Before doing that restructure, a real identity-model bug surfaced: ids were content-derived slugs, so the new primary step needed at the "Packaging" name collided with the existing leaf-level `packaging` step id, forcing a breaking rename — a normalization violation (a naming change cascading into every referencing record). Fixed properly rather than patched around: **all 10 core JSON collections + the safetychain overlay were migrated** so every record's `id` is now an opaque UUIDv4, with a separate `path` field (routable, human-readable) on the two collections the viewer actually navigates to (`flows`, `steps`). Non-routable reference collections (artifacts, regulations, agencies, materials, roles, systems, gaps) dropped their old slugs entirely — `id` is their only identifier now, no legacy field kept "for readability." See §5a for the full rationale and current shape.
- One exception carved out deliberately: `threads.json` records kept a `key` field (e.g. `"sanitation"`) — not a `path` (nothing routes to a thread), but a real load-bearing lookup string since the viewer's CSS class names (`thread-dot--sanitation`) and now-removed `THREAD_LABELS` JS map both hardcoded against it.
- Migration was scripted (throwaway, not committed — a copy sits in this session's scratchpad if it's ever needed again) and validated programmatically post-run: every cross-reference across all files resolves by id, every step/flow path is unique, every thread has a unique key. A rollback backup of the pre-migration `app/data/` was also taken (scratchpad only).
- The migration broke the viewer in two real ways, both caught by actually re-running it in a browser (not just re-reading the code) and both fixed:
  1. The router put raw ids in the URL hash and used them as lookup keys directly — now meaningless with opaque UUIDs, and the hardcoded default hash (`#/flow/primary-flow`) no longer resolved to anything. Fixed by threading a strict path/id boundary through the router and render files: the router's crumb objects now hold `flowPath`/`stepPath` (never `flowId`/`stepId`), `data.js` exposes `flowIdForPath`/`stepIdForPath` as the only place path↔id translation happens, and `app.js` resolves path→id exactly once per render before handing real ids down to the render functions (which is correct — internal lookups should use ids).
  2. Thread dots/chips went blank and labels showed raw UUIDs — `render-flow.js` and `render-step.js` both compared `step.threadIds` (now UUIDs) against hardcoded slug strings (`"sanitation"`, etc.) that no longer existed anywhere in the data. Fixed by resolving each thread id to its new `key` field at render time instead of string-matching.
  3. (Minor, same pass) A search-result meta line for Gap entries was displaying a raw stepId/UUID instead of anything readable — removed since the line directly below it already shows the same info as a readable step name.
- Re-verified end-to-end after all fixes: primary flow view, 4-level-deep nested-step drill-down (breadcrumb, thread chips, concrete layer, SafetyChain overlay), and search — all confirmed via headless-Chrome DOM dumps and a pixel-comparison screenshot against the pre-migration baseline (identical).
- This entry was originally the identity-model prerequisite work, sequenced deliberately before the restructure itself (clean ids before restructuring) per the user's own choice when asked — see the newer entry above for confirmation the restructure it unblocked is now also done.

**Data model + population (phases 2–5) — done.**
- `app/data/core/*.json` populated (counts below are as originally built, i.e. the 14-step-primary-flow era — see the two newer entries above for the current 16-flow/68-step count after the id/path migration and 7-step restructure): 12 flows (1 primary + 11 nested — steps 2–11 each get one, step 12 gets a partial one for traceability events only), 64 steps total (14 primary + 50 nested-flow steps), 4 threads, 43 artifacts, 21 regulations, 10 agencies, 9 materials, 26 roles, 11 systems, 11 gaps.
- `app/data/products/safetychain.json` overlay built: 5 module categories (Supplier Management, Food Safety Programs, Quality Management, Production Monitoring, Traceability) mapped onto core step/system/artifact ids. Explicitly flagged in the file itself as an unconfirmed first-pass read, not validated against internal SafetyChain docs.
- Validated programmatically: every id reference across all 10 core files + the safetychain overlay resolves (no dangling ids), every step reachable from some flow's `stepIds`, and the primary-flow `nestedFlowId` presence matches the section 3 gating table exactly (steps 2–12 nested, 1/13/14 conceptual-only). Script was throwaway (scratchpad), not committed — rerun-worthy if the data changes again.

**Interactive viewer (phase 6) — done, browser-verified.**
- Stack: no framework, per explicit decision — vanilla ES modules, hand-written CSS (theme-aware via `prefers-color-scheme`), Fuse.js (vendored, `app/js/vendor/fuse.min.js`, v7.0.0) for fuzzy search with a plain substring-match fallback if that file is ever removed.
- Implements all 4 interaction levels from section 7: primary flow (level 0), step detail conceptual layer (level 1) — originally for all 14 steps, now the 7 post-restructure — nested flow (level 2), nested-step concrete layer + SafetyChain overlay (level 3). Hash-based router (`app/js/router.js`) makes every view state a shareable/bookmarkable URL and gives back/forward for free. (The 7-step restructure later proved the same router/render code generalizes to a 3rd nesting level with zero additional changes — see the newer progress-log entry above.)
- Breadcrumb + persistent minimap of the primary flow, both live-synced to current position. Thread indicators render as colored dots/chips but are **not yet clickable filters** — see next steps.
- Verified by actually driving headless Chrome against a local server and reading back the rendered DOM + screenshots (not just asserting the code should work) — confirmed at primary-flow view, a 4-level-deep nested-step view (CCP monitoring), and search. This caught one real bug (below).
- Real bug found and fixed: initial layout had `viewer/` and `data/` as sibling folders, so serving `viewer/` as the HTTP root 404'd on every `../data/*.json` fetch. Fixed by the section-11-era restructure (see below) — `data/` now lives inside the servable app root, no sibling dependency.

**Repo restructure (post-viewer, pre-phase-7) — done, re-verified.**
- Moved to a standard layout: `app/` (self-contained viewer + its data, servable as its own root — no more sibling-folder fragility), `docs/` (this plan), plus root-level `README.md`, `package.json` (`npm start` → `npx serve app`), `.gitignore`.
- Re-verified in-browser after the move: all fetch paths resolve, DOM renders identically, screenshot matches pre-move baseline.
- Git was **not** initialized — user chose to do that themselves rather than have it done automatically. The folder is plain (not yet a git repo) as of this entry.
- One leftover: the old empty `viewer/` directory could not be removed (Windows reports it busy — likely a stale handle from an Explorer window or process). Harmless but not cleaned up; delete manually once nothing has it open.

**Earlier corrections worth remembering:**
- "No internet access" was said once during this project and was wrong — it was a tooling gap (no bulk-download tool available), not a real restriction. `curl`/`WebFetch` work fine in this environment. Fuse.js was subsequently vendored for real once this was caught. If a similar claim comes up again, verify with an actual network call before asserting a limitation.

## 11. Next steps

In rough priority order — none of these are started unless noted. (The
7-step primary flow restructure that used to be item 1 here is
now done — see section 10's newest entry — so this list starts from what's
actually still open.)

1. ~~Initialize git and make the first commit~~ — **closed.**
2. ~~Clean up the orphaned `viewer/` directory~~ — **closed.**
3. ~~Sanity-check the nested-flow gating table (section 3)~~ — **closed, won't do.** Never actually in scope for the project.
4. ~~Thread click-to-filter interaction~~ — **closed, won't do.** The interaction model (section 7) originally called for threads as a clickable overlay ("click 'follow this thread' and whatever it touches lights up"), on top of the static colored-chip indicators already rendered on flow nodes and step detail. Re-evaluated and judged niche relative to other open work: the static chips already answer the practical question ("does this step touch sanitation/traceability/recall/allergen-control?") at a glance, and a full cross-flow highlight/filter interaction wasn't judged worth the build cost right now. If revisited later, threads have a `key` field (see §5a) that's the right thing to filter/highlight by, not `id`.
5. ~~Targeted gap research~~ — **done.** All 11 original `gaps.json` entries were resolved one at a time: 9 got concrete designed content (new artifacts — e.g. CCP Definition, Supplier Risk Scoring Matrix, Structured COA Data Schema, EMP Zone & Trending Standard, Allergen Sequencing Algorithm, Catch-Weight Data Model, Label Compliance Check Catalog, Carrier Handoff KDE Set — each attached to its step, gap entry removed after); the remaining 2 (EPCIS format not yet FDA-mandated; outbound logistics deliberately partial scope) were recognized as accurate external-uncertainty/scope-boundary statements rather than unfinished design work and removed outright rather than force-resolved. `gaps.json` is now `{}`. See section 10's newest entries for the full per-gap breakdown.
6. ~~Visual polish~~ — **partially done.** Flow-node connectors (`render-node.js`, `.flow-connector`) replaced the plain `→` text glyph with an SVG line+arrowhead for cleaner rendering and flex-wrap behavior. The minimap's nested-level indicator (`render-shell.js`/`.minimap__level--nested`) got a depth-aware corner-joint connector, progressive indent, and opacity fade so drill-downs read more clearly at depth. Verified visually in-browser via Playwright screenshots at 1, 2, and 3 nesting levels. Broader polish (animation, layout) still optional/deferred as before.
7. **Deploy somewhere real**, once git is initialized — `app/` is designed to be pointed at directly by any static host (GitHub Pages, Netlify, S3, etc.) with no config beyond "serve this folder."
8. ~~Source/citation tracking~~ — **mechanism done, scope later widened by item 9a.** New `sources.json` core collection added (empty `{}`, per the same empty-collection convention `gaps.json` used before its entries were resolved) — schema documented in section 5a's file-layout listing: `{ id, name, type, citation/url, note }`, `type` one of `regulation-text` | `industry-standard` | `vendor-doc` | `subject-matter-judgment`. Wired into `app/js/data.js` loading (`loadAllData` now fetches and caches it alongside the other core collections). `artifacts`/`materials`/`systems`/`steps` may now carry an optional `sourceIds: []` — no existing records were touched at the time this landed. UI surface: `render-step.js`'s `listCard` renders a small "Sourced (n)" note under any item that has `sourceIds`, so the field isn't inert — currently placeholder text (not yet a resolved/linked list) since no real source content exists yet to link to; upgrading that note into real resolved links is naturally part of item 9a once `sources.json` has entries. **Scope correction (see item 9a):** originally `regulations`/`agencies` were exempted as "self-citing." Re-examined and reversed — their facts (citations, years, agency names) are exactly the kind of externally-checkable claim this mechanism exists for, and the site's credibility depends on them being right. `content-standards.md` now requires `sourceIds` on `regulations`/`agencies` too; only `roles`/`threads`/`flows` remain exempt as structural/domain-modeling content.
8a. ~~Content standards doc~~ — **done, new.** Added [`docs/content-standards.md`](content-standards.md): scope-fit criteria (ties to section 3's gating), sourcing rules for `sourceIds`/`sources.json` (ties to item 8, including honest use of the `subject-matter-judgment` type vs. fabricated citations), per-field voice/length bar for `summary`/`lifecycle`/`notes`, the vendor-neutrality test (ties to section 6), referential-integrity expectations, and a "done" checklist. Required reading before proceeding with items 9 and 10 — both are large content passes and shouldn't run without a shared bar for what "good" content means.
9a. ~~Citation backfill + correctness audit on all existing content~~ — **done, all collections.** All 21 regulations, 10 agencies, 52 artifacts, 9 materials, and 11 systems now carry real, web-verified `sourceIds` (115 `sources.json` entries total); all 68 steps were spot-checked for plausibility (no `sourceIds` — structural per `content-standards.md`). Pulled out as its own gating pass, done *before* any new content is added, because the concern raised was existential, not incremental: if the data already in the site wasn't verifiably correct, adding more content on top of it wouldn't fix that. Every claim was checked by **actual web lookup**, not retroactively-assigned plausible-sounding citations — see section 10's newest entry for the full list of real errors this surfaced and fixed. Item 9's expansion can now proceed on a foundation actually confirmed to hold up.
9. **Large data audit & expansion phase — new, not yet started, comes after item 9a is done.** Once existing content is verified and sourced, this becomes the next major body of work: expand the data beyond what exists today — more artifacts, materials, systems, regulations, and possibly more nested-flow depth — with new content sourced as it's written per `content-standards.md`. Expect this to surface real answers to the still-open gating question referenced in the historical section 3 discussion. Not scoped further yet; treat as the next major phase once item 9a is complete and the team is satisfied with current site mechanics.
10. **Implementation Detail card + modal upgrade — new, not yet started.** Today artifacts, materials, and systems each render as a bare one-line list row (`name — meta`) inside a `listCard` on the step page (`app/js/render-step.js`, `listCard`/`concreteGrid`, section 3's "concrete layer"). That undersells subjects that are actually far more complex than one line (a Structured COA Data Schema, a Supplier Risk Scoring Matrix, a Carrier Handoff KDE Set), and a fuller list only makes the step page longer, not clearer. Plan, in order:
    - **Data model:** extend the schema for `artifacts`, `materials`, and `systems` (all three, not just artifacts) with a common optional detail shape: a longer `description` (prose beyond the current one-liner), an `example` (concrete illustrative content — e.g. a sample filled-out COA row, a mini rendered risk-matrix table, sample field values — not just an abstract description), a `fields` breakdown (for schema/matrix-shaped artifacts: named fields/columns with their own descriptions), and `relatedIds` (cross-references to other artifacts/materials/systems/regulations this one interacts with, e.g. Structured COA Data Schema ↔ Material / Product Specification). All new fields optional per §5a normalization conventions — nothing here changes `id`/`path`/relational-id handling, this is purely additive detail on existing collections.
    - **UI — cards, not list rows:** replace `listCard`'s plain `<li>`-style rows with a clickable card-per-item styling (consistent with the rest of the site's card language), still laid out in the same `detail-grid`/section structure so the step page's overall shape doesn't change. Each card shows today's one-liner (name + format/meta) as a compact preview; clicking anywhere on the card opens the modal rather than navigating away, so the step page stays the anchor point.
    - **UI — the modal:** a single reusable detail-modal component (new, e.g. `app/js/render-detail-modal.js`) driven by an item + its collection type, showing name, full description, the example content (rendered appropriately — a table for schema/field-shaped examples, prose/preformatted block otherwise), the fields breakdown if present, and its related items as clickable chips/links that re-open the modal on the related item (without a full page navigation) or jump to that item's own card if it's on the same step. Standard modal affordances: overlay click, Escape key, and a visible close control; keyboard-focus trapped while open for accessibility, matching how the rest of the viewer already treats keyboard navigation (router history, search).
    - **Content backfill — full pass, not a proof of concept:** once the schema and modal exist, write `description`/`example`/`fields` (`relatedIds` where a real relationship exists) for every existing artifact, material, and system record — all of them, not a representative subset — grounded the same way gap-resolution content was (real standards where applicable, explicit domain design where not), each entry substantial enough that the modal never reads as emptier than the list row it replaced. Track progress the same way the 11 `gaps.json` entries were tracked (one at a time, validated as it goes), since this is comparable in size.
    - **Validation:** extend the existing referential-integrity script (already re-run after every past migration/gap-resolution pass, see section 10) to also check every new `relatedIds` entry resolves to a real id in its target collection, with zero dangling refs, same bar as every other cross-reference in the data.
    - **Not in scope for this phase:** extending this same card+modal pattern to regulations/agencies/roles cards (they're simpler today and weren't asked for); source/citation tracking on the new `description`/`example` content (that's items 8–9's job, and this phase's new content should get `sourceIds` once that mechanism exists, not invent a parallel one now).
