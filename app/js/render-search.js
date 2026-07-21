import { goToStep } from "./router.js";
import { crumbsForFlow } from "./data.js";

// Flat searchable index built once per data load: every artifact, regulation,
// system, material, agency, and step name/summary, tagged with its owning step
// so a result can route straight to step detail.
export function buildSearchIndex(data) {
  const entries = [];

  for (const step of Object.values(data.steps)) {
    entries.push({
      type: "Step",
      name: step.name,
      meta: step.summary,
      stepId: step.id,
    });
  }

  const collectionMeta = {
    artifacts: { type: "Artifact", labelField: "name", metaField: "format" },
    regulations: { type: "Regulation", labelField: "name", metaField: "citation" },
    systems: { type: "System", labelField: "name", metaField: "category" },
    materials: { type: "Material", labelField: "name", metaField: "type" },
    agencies: { type: "Agency", labelField: "name", metaField: "fullName" },
    roles: { type: "Role", labelField: "name", metaField: "summary" },
  };

  const idToOwningStep = {};
  for (const step of Object.values(data.steps)) {
    for (const key of ["artifactIds", "materialIds", "systemIds"]) {
      for (const id of step[key] || []) {
        idToOwningStep[id] = step.id;
      }
    }
  }

  for (const [collectionName, meta] of Object.entries(collectionMeta)) {
    for (const item of Object.values(data[collectionName])) {
      entries.push({
        type: meta.type,
        name: item[meta.labelField],
        meta: item[meta.metaField] || "",
        stepId: idToOwningStep[item.id] || null,
      });
    }
  }

  return entries;
}

function simpleMatch(entries, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return entries
    .map((e) => {
      const haystack = `${e.name} ${e.meta}`.toLowerCase();
      const idx = haystack.indexOf(q);
      return idx === -1 ? null : { entry: e, score: idx };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score)
    .slice(0, 40)
    .map((r) => r.entry);
}

export function renderSearchView(container, data, searchIndex, query, fuse) {
  container.innerHTML = "";

  const title = document.createElement("h2");
  title.className = "flow-view__title";
  title.textContent = query ? `Search results for "${query}"` : "Search";
  container.appendChild(title);

  if (!query.trim()) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Type in the search box above to look across all artifacts, regulations, systems, and steps.";
    container.appendChild(empty);
    return;
  }

  const results = fuse ? fuse.search(query).map((r) => r.item).slice(0, 40) : simpleMatch(searchIndex, query);

  if (!results.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No matches.";
    container.appendChild(empty);
    return;
  }

  const list = document.createElement("div");
  list.className = "search-results";

  for (const result of results) {
    const btn = document.createElement("button");
    btn.className = "search-result";
    btn.disabled = !result.stepId;

    const type = document.createElement("div");
    type.className = "search-result__type";
    type.textContent = result.type;
    btn.appendChild(type);

    const name = document.createElement("div");
    name.className = "search-result__name";
    name.textContent = result.name;
    btn.appendChild(name);

    if (result.meta) {
      const meta = document.createElement("div");
      meta.className = "search-result__meta";
      meta.textContent = result.meta;
      btn.appendChild(meta);
    }

    if (result.stepId) {
      const step = data.steps[result.stepId];
      const breadcrumbHint = document.createElement("div");
      breadcrumbHint.className = "search-result__meta";
      breadcrumbHint.textContent = `↳ ${step ? step.name : result.stepId}`;
      btn.appendChild(breadcrumbHint);

      btn.addEventListener("click", () => {
        const crumbs = crumbsForFlow(data, step.flowId);
        goToStep(crumbs, step.path);
      });
    }

    list.appendChild(btn);
  }

  container.appendChild(list);
}
