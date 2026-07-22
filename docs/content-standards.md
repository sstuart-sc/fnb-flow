# Content standards

Governs what "good" looks like for any record added to `app/data/core/*.json`
(or `app/data/products/*.json`) — regulations, agencies, roles, threads,
flows, steps, artifacts, materials, systems, sources. Read this before
writing new content or backfilling existing records. This document is about
content *quality*, not structure.

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
- **`summary` (systems, regulations, agencies)** — deprecated once a record
  has `description`. The UI no longer shows card-level summaries anywhere
  (`CollectionView` doesn't render one), and every modal/detail view already
  falls back through `description || lifecycle || notes || summary` — so a
  standalone `summary` is dead weight once `description` exists. When adding
  `description` to a record that still has `summary`, fold any fact in
  `summary` that isn't already covered into `description`, then delete the
  `summary` field entirely rather than keeping both. Don't add a new
  `summary` to a record that's getting a `description` from scratch.
- **`meta`/short fields** — must resolve to something a reader can act on
  (a citation, a year, a role name) — never restate the field's own label.

Prefer specificity over hedging. If real uncertainty exists (e.g. "not yet
FDA-mandated"), say that plainly rather than writing around it — that's a
legitimate, sourceable statement (`subject-matter-judgment` or the
regulation's own stated timeline), not a gap to paper over.

## 3a. The detail fields — `description`, `fields`, `relatedIds`

Applies to `artifacts`, `materials`, and `systems` (plan section 11 item 10).
These are optional per-record additions on top of the existing shape — they
exist to give the detail modal something substantive to show, not to
duplicate what the card preview (`name` + the existing short field) already
says.

There is deliberately no `example`/mock-instance field. A realistic worked
example (sample lot numbers, sample company names, a fabricated reading)
is effort spent on realism the site doesn't need — it's a conceptual/
educational reference, not a tool anyone fills out with real data. The bar
is a **plausible, sourced schema** (`fields`), not a plausible-looking
instance of one. If a past record still has an `example` field, remove it
rather than fix it — it's out of scope, not a smaller version of `fields`.

- **`description`** — prose beyond the existing one-liner (`lifecycle` for
  artifacts, `notes` for materials, `summary` for systems). Explain what the
  thing actually is, who touches it, and why it matters to the step it's
  attached to, in enough depth that a reader unfamiliar with the domain
  understands it without needing the modal's other fields. Where the
  existing short field already tells the whole story adequately, `description`
  can restate it in fuller prose rather than straining for new content — but
  never leave it as a near-duplicate of the short field's exact wording.
  **Break it into paragraphs**, separated by a blank line (`\n\n`) in the
  JSON string — one idea per paragraph (what it is / who's obligated / how
  it's enforced or structured / exceptions), 2-4 paragraphs total for a
  substantial record. `ItemDetailView`/`DetailModal` split on `\n\n` and
  render each paragraph as its own `<p>` (see `descriptionParagraphs` in
  `useData.js`) — a `description` written as one dense block will render as
  a single wall of text, so don't skip the break just because it's optional
  in the schema.
- **`fields`** — an array of `{ name, description }` naming each column/
  field/parameter the record captures and what it means. **Required test,
  not a judgment call:** does this record represent a single, describable
  instance of something with named parts (a form, a log entry, a schema, a
  matrix row, a KDE set, a rubric)? If yes, `fields` is required, covering
  every named part a reader would need to understand an instance of the
  record — not a partial or illustrative subset. If the record is genuinely
  just prose/narrative with no enumerable parts (e.g. a HACCP Plan as a
  whole document, a Label Artwork File), omit `fields` entirely — don't pad
  it with a fake breakdown to satisfy the letter of the rule. When in doubt,
  default to including `fields`: most `format` values in this dataset
  ("data record," "document, versioned," "reference table") describe
  something with real internal structure, even when the existing `lifecycle`
  text doesn't spell it out. Every `fields` entry must be a plausible,
  sourced part of the real thing — grounded the same way any other claim in
  the record is (section 2), not invented to look complete.
- **`relatedIds`** — cross-references to other artifacts/materials/systems/
  regulations this record actually interacts with in the domain (e.g.
  Structured COA Data Schema ↔ Material/Product Specification). Only add a
  relationship that's real and useful to know about — not every record that
  is merely topically nearby. Must resolve per section 5's referential-
  integrity rule, same as any other `*Ids` field.

Sourcing (section 2) and vendor-neutrality (section 4) apply to this new
content exactly as they do to the existing fields — a `fields` entry making
a specific regulatory claim needs the same grounding as `lifecycle` would.

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

## 5a. `path` for regulations/agencies/systems/artifacts/materials

These 5 collections carry a `path` (routable slug) alongside `id`, backing
their own browse/detail pages — see CLAUDE.md's Architecture section for
why only these 5 (plus flows/steps) have one. When adding a new record to
any of these files:

- Derive `path` from `name`: lowercase, trim, collapse runs of non-alphanumeric
  characters to a single hyphen, strip any leading/trailing hyphen.
- Confirm it's unique *within that file* before committing — cross-collection
  collisions are fine, since routes are namespaced by collection
  (`/artifacts/scale` and `/materials/scale` can coexist).
- Like flows/steps, `path` is assigned once and never renamed after the fact
  — a relational reference is never allowed to point at it, only at `id`.

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
