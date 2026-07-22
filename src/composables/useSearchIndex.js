import { buildStepReverseIndex } from "./useData";

// Flat searchable index built once per data load: every artifact, regulation,
// system, material, agency, role, and step name/summary. Items from the 5
// collections with their own detail page (path present) carry enough to
// route straight there; roles (no path) and the owning-step hint for
// everything else fall back to routing via the first referencing step.
export function buildSearchIndex(data) {
  const entries = [];

  for (const step of Object.values(data.steps)) {
    entries.push({
      type: "Step",
      name: step.name,
      meta: step.summary,
      collectionName: "steps",
      itemId: step.id,
      path: step.path,
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

  const reverseIndex = buildStepReverseIndex(data);

  for (const [collectionName, meta] of Object.entries(collectionMeta)) {
    for (const item of Object.values(data[collectionName])) {
      const referencingSteps = reverseIndex[item.id] || [];
      entries.push({
        type: meta.type,
        name: item[meta.labelField],
        meta: item[meta.metaField] || "",
        collectionName,
        itemId: item.id,
        path: item.path || null,
        stepId: referencingSteps[0]?.id || null,
      });
    }
  }

  return entries;
}

export function simpleMatch(entries, query) {
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
