import { crumbsForFlow } from "./data.js";
import { goToStep } from "./router.js";

const TYPE_ORDER = ["regulation-text", "industry-standard", "vendor-doc", "subject-matter-judgment"];
const TYPE_LABEL = {
  "regulation-text": "Regulation text",
  "industry-standard": "Industry standard",
  "vendor-doc": "Vendor documentation",
  "subject-matter-judgment": "Subject-matter judgment",
};

// Which records (across every sourceIds-eligible collection) cite each source,
// so the sources page can show "cited by" and link back into the data.
function buildCitedByIndex(data) {
  const index = {};
  const collections = ["regulations", "agencies", "artifacts", "materials", "systems", "steps"];
  for (const collectionName of collections) {
    for (const item of Object.values(data[collectionName] || {})) {
      for (const sourceId of item.sourceIds || []) {
        (index[sourceId] ||= []).push({ collectionName, item });
      }
    }
  }
  return index;
}

function citingStepFor(data, collectionName, item) {
  if (collectionName === "steps") return item;
  const idField = { artifacts: "artifactIds", materials: "materialIds", systems: "systemIds" }[collectionName];
  if (!idField) return null;
  return Object.values(data.steps).find((s) => (s[idField] || []).includes(item.id)) || null;
}

export function renderSourcesView(container, data) {
  container.innerHTML = "";

  const title = document.createElement("h2");
  title.className = "flow-view__title";
  title.textContent = "Sources";
  container.appendChild(title);

  const summary = document.createElement("p");
  summary.className = "flow-view__summary";
  summary.textContent =
    "Every regulation text, industry standard, vendor document, or explicit subject-matter judgment grounding a fact in this data. Filter by type or search by name.";
  container.appendChild(summary);

  const sources = Object.values(data.sources || {});
  const citedByIndex = buildCitedByIndex(data);

  const controls = document.createElement("div");
  controls.className = "sources-controls";

  const searchBox = document.createElement("input");
  searchBox.type = "search";
  searchBox.placeholder = "Filter sources by name…";
  searchBox.className = "sources-controls__search";
  controls.appendChild(searchBox);

  const typeSelect = document.createElement("select");
  typeSelect.className = "sources-controls__type";
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All types";
  typeSelect.appendChild(allOption);
  for (const type of TYPE_ORDER) {
    const opt = document.createElement("option");
    opt.value = type;
    opt.textContent = TYPE_LABEL[type];
    typeSelect.appendChild(opt);
  }
  controls.appendChild(typeSelect);

  container.appendChild(controls);

  const listEl = document.createElement("div");
  container.appendChild(listEl);

  function renderList() {
    listEl.innerHTML = "";
    const query = searchBox.value.trim().toLowerCase();
    const typeFilter = typeSelect.value;

    const filtered = sources.filter((s) => {
      if (typeFilter && s.type !== typeFilter) return false;
      if (!query) return true;
      const haystack = `${s.name} ${s.citation || ""} ${s.note || ""}`.toLowerCase();
      return haystack.includes(query);
    });

    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "No sources match.";
      listEl.appendChild(empty);
      return;
    }

    const byType = {};
    for (const s of filtered) (byType[s.type] ||= []).push(s);

    for (const type of TYPE_ORDER) {
      const group = byType[type];
      if (!group?.length) continue;

      const heading = document.createElement("h3");
      heading.className = "nested-flow-preview__heading";
      heading.style.marginTop = "1.5rem";
      heading.textContent = `${TYPE_LABEL[type]} (${group.length})`;
      listEl.appendChild(heading);

      const list = document.createElement("div");
      list.className = "search-results";
      for (const source of group) {
        list.appendChild(renderSourceCard(data, source, citedByIndex));
      }
      listEl.appendChild(list);
    }
  }

  searchBox.addEventListener("input", renderList);
  typeSelect.addEventListener("change", renderList);
  renderList();
}

function renderSourceCard(data, source, citedByIndex) {
  const card = document.createElement("div");
  card.className = "search-result source-card";
  card.id = `source-${source.id}`;

  const name = document.createElement("div");
  name.className = "search-result__name";
  name.textContent = source.name;
  card.appendChild(name);

  if (source.citation) {
    const citation = document.createElement("div");
    citation.className = "search-result__meta";
    citation.textContent = source.citation;
    card.appendChild(citation);
  }

  if (source.note) {
    const note = document.createElement("div");
    note.className = "search-result__meta";
    note.textContent = source.note;
    card.appendChild(note);
  }

  if (source.url) {
    const link = document.createElement("a");
    link.href = source.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "source-card__link";
    link.textContent = "Read the source ↗";
    card.appendChild(link);
  }

  const citedBy = citedByIndex[source.id] || [];
  if (citedBy.length) {
    const citedByEl = document.createElement("div");
    citedByEl.className = "source-card__cited-by";
    citedByEl.textContent = `Cited by: ${citedBy.map((c) => c.item.name).join(", ")}`;
    card.appendChild(citedByEl);
  }

  return card;
}
