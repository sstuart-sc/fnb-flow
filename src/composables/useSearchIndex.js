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
