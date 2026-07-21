# Content standards

Governs what "good" looks like for any record added to `app/data/core/*.json`
(or `app/data/products/*.json`) — regulations, agencies, roles, threads,
flows, steps, artifacts, materials, systems, sources. Read this before
writing new content or backfilling existing records (plan doc section 11,
items 8–10). Schema shape itself (field names, `id`/`path`/`key` identity
model) is defined in [`food-mfg-stream-map-plan.md`](food-mfg-stream-map-plan.md)
section 5/5a — this document is about content *quality*, not structure.

## 1. Scope fit — does this belong at all

Before writing content for a step, check it against the gating logic in
plan section 3: concrete detail (artifacts, materials, systems) only belongs
on steps inside the implementation slice actually being built toward
(currently: SafetyChain's operational scope, receiving through finished
goods leaving the dock). A step outside that slice keeps its conceptual
layer only — do not add artifacts/materials/systems to a step just because
research turned some up; note them as future scope instead, or don't record
them at all if they're not concretely useful yet.

If a step's scope-fit is genuinely unclear (not obviously in or out), don't
guess — flag it for the audit pass (item 9) rather than forcing a decision
into the data.

## 2. Sourcing — every fact needs a grounding

This is the standard the `sources.json` mechanism (plan section 11 item 8)
exists to enforce. **No exceptions for new content going forward:**

- Every new `artifacts`/`materials`/`systems`/`steps`/`regulations`/`agencies`
  record must carry `sourceIds` pointing at one or more `sources.json`
  entries. Regulations and agencies make objectively verifiable factual
  claims (citation numbers, years, agency full names, jurisdiction) — if the
  site's core premise (these facts are actually correct) isn't itself cited,
  nothing downstream that references them is trustworthy either. `roles`,
  `threads`, and `flows` stay exempt — they're domain-modeling/structural
  (a role's duties, which steps a thread touches, a flow's step ordering),
  not externally checkable facts to cite.
- Each source's `type` must honestly reflect what grounds it:
  - `regulation-text` — the regulation's own text (cite section/part).
  - `industry-standard` — a named external standard (GS1, FSMA 204, GFSI,
    etc.) — cite the specific standard/spec, not just the org.
  - `vendor-doc` — a vendor's own published material (SafetyChain or
    otherwise) — cite the specific doc/module, not just "vendor knowledge."
  - `subject-matter-judgment` — explicit designed/asserted content with no
    external source. This is a legitimate, first-class category (used for
    e.g. the Allergen Sequencing Algorithm, Supplier Risk Scoring Matrix) —
    **not a fallback for "didn't bother looking it up."** Only use it when
    you've actually confirmed no external source exists or applies; if
    you're not sure, say so in the source's `note` rather than silently
    picking this type.
- Never invent a citation. If you're not sure a regulation section or
  standard actually says what you're about to claim, don't fabricate the
  citation to make the record look sourced — use `subject-matter-judgment`
  and say in `note` what's uncertain, or leave it as an open item instead.
- Backfilling `sourceIds` onto pre-existing records (item 9) is real content
  work, not paperwork: re-derive what actually grounds each existing fact
  rather than retroactively assigning a plausible-sounding source you
  haven't verified.

## 3. Voice and length, per field

- **`summary` (flows, steps)** — one to three sentences, plain declarative
  prose, no marketing language. States what the step/flow *is* and why it
  matters in the flow, not how to implement it. Written for someone
  learning the domain, not someone already fluent in it.
- **`lifecycle` (artifacts)** — describes what the artifact is, when/how
  it's created, and what happens to it after — not just a one-line label.
  Where the artifact has real internal structure (a schema, a matrix, a
  KDE set), the lifecycle text should say enough to actually understand
  that structure in prose, per the existing style of e.g. the Structured
  COA Data Schema entry — don't undersell a genuinely complex artifact with
  a one-liner just because the field technically allows it.
- **`notes` (materials)** — what the equipment/material is and why it's
  relevant to the step, not a spec sheet.
- **`summary` (systems)** — what class of system this is and what it does,
  vendor-neutral (see section 6 below) unless the record is explicitly in
  a `/products` overlay file.
- **`meta`/short fields** — must resolve to something a reader can act on
  (a citation, a year, a role name) — never restate the field's own label.

Prefer specificity over hedging. If real uncertainty exists (e.g. "not yet
FDA-mandated"), say that plainly rather than writing around it — that's a
legitimate, sourceable statement (`subject-matter-judgment` or the
regulation's own stated timeline), not a gap to paper over.

## 4. Vendor neutrality

Per plan section 6: `systems.json` (core) stays generic/vendor-neutral —
"a QMS platform," not "SafetyChain QMS." Vendor-specific claims belong only
in `app/data/products/<vendor>.json`, referencing into core ids without
core ever referencing back. Applying this test to new content: if a system
or artifact record would stop being true for a different vendor's
equivalent product, it's vendor-specific and belongs in a `/products`
overlay, not in core.

## 5. Referential integrity

Every `*Ids` reference must resolve to a real record in its target
collection — no dangling ids, ever, even transiently mid-edit. Empty arrays
(`artifactIds: []`, etc.) are a deliberate, valid state for conceptual-only
steps — not something to fill with weak content just to avoid an empty
array. After any content change, re-validate that every reference across
all core files still resolves (see plan section 10's progress-log entries
for the shape of the validation script used during past passes — throwaway
scratchpad script is fine, it doesn't need to be committed, but it does
need to actually run).

## 6. What "done" looks like for a new or backfilled record

A record is ready to commit when:

1. It's scoped correctly (section 1).
2. It carries `sourceIds` pointing at honestly-typed `sources.json` entries
   (section 2) — required for `artifacts`/`materials`/`systems`/`steps` and
   also `regulations`/`agencies` (their facts are externally checkable and
   the whole site's credibility rests on them). Only `roles`/`threads`/
   `flows` are exempt as structural/domain-modeling content.
3. Its prose fields meet the voice/length bar in section 3.
4. It respects vendor neutrality (section 4) or is correctly placed in a
   `/products` overlay instead.
5. Referential integrity still holds across all core files (section 5).

If any of these is genuinely unclear or unresolved, don't force it through —
flag it (a gap-style note, or a call-out in the plan doc's progress log) and
move on, rather than writing something disguised as more certain than it is.
