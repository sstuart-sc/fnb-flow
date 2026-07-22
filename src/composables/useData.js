const DATA_BASE = `${import.meta.env.BASE_URL}data`.replace(/\/+/g, "/");

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

let cachePromise = null;

export function loadAllData() {
  if (cachePromise) return cachePromise;

  cachePromise = (async () => {
    const [
      flows, steps, threads, artifacts, regulations,
      agencies, materials, roles, systems, sources, jurisdictions, safetychain
    ] = await Promise.all([
      loadJSON(`${DATA_BASE}/core/flows.json`),
      loadJSON(`${DATA_BASE}/core/steps.json`),
      loadJSON(`${DATA_BASE}/core/threads.json`),
      loadJSON(`${DATA_BASE}/core/artifacts.json`),
      loadJSON(`${DATA_BASE}/core/regulations.json`),
      loadJSON(`${DATA_BASE}/core/agencies.json`),
      loadJSON(`${DATA_BASE}/core/materials.json`),
      loadJSON(`${DATA_BASE}/core/roles.json`),
      loadJSON(`${DATA_BASE}/core/systems.json`),
      loadJSON(`${DATA_BASE}/core/sources.json`),
      loadJSON(`${DATA_BASE}/core/jurisdictions.json`),
      loadJSON(`${DATA_BASE}/products/safetychain.json`),
    ]);

    // id is the only real relational key (opaque, stable, never derived from
    // content). path is a separate, human-readable, routable address — the two
    // must never be conflated, so build a path->id index once here and keep all
    // path<->id translation confined to this module.
    const flowIdByPath = {};
    for (const flow of Object.values(flows)) flowIdByPath[flow.path] = flow.id;

    const stepIdByPath = {};
    for (const step of Object.values(steps)) stepIdByPath[step.path] = step.id;

    // Same id/path split as flows/steps, extended to the 5 reference
    // collections that have their own browse/detail pages. Grouped under one
    // key rather than 5 more top-level exports.
    const pathCollections = { regulations, agencies, systems, artifacts, materials };
    const pathByCollection = {};
    for (const [collectionName, collection] of Object.entries(pathCollections)) {
      pathByCollection[collectionName] = {};
      for (const item of Object.values(collection)) {
        pathByCollection[collectionName][item.path] = item.id;
      }
    }

    return {
      flows, steps, threads, artifacts, regulations, agencies, materials, roles, systems, sources,
      jurisdictions, safetychain,
      flowIdByPath, stepIdByPath, pathByCollection,
    };
  })();

  return cachePromise;
}

export function getFlow(data, flowId) {
  return data.flows[flowId];
}

// Flow names in the data carry a "— Primary Flow" / "— Nested Flow" (or
// parenthetical variant) suffix for authoring clarity, but it's noise in the
// UI — the panel/heading context already makes clear what kind of flow it is.
export function displayFlowName(flow) {
  if (!flow) return "";
  return flow.name.replace(/\s*[—-]\s*(Primary|Nested) Flow.*$/i, "").trim();
}

export function getStep(data, stepId) {
  return data.steps[stepId];
}

export function flowIdForPath(data, path) {
  return data.flowIdByPath[path];
}

export function stepIdForPath(data, path) {
  return data.stepIdByPath[path];
}

export function idForCollectionPath(data, collectionName, path) {
  return data.pathByCollection[collectionName]?.[path];
}

export function stepsForFlow(data, flowId) {
  const flow = getFlow(data, flowId);
  if (!flow) return [];
  return flow.stepIds.map((id) => getStep(data, id)).filter(Boolean);
}

// Steps don't carry a flowId back-reference, so finding the flow that owns a
// given step means scanning flows for whichever one's stepIds contains it.
export function findFlowIdForStep(data, stepId) {
  const flow = Object.values(data.flows).find((f) => f.stepIds.includes(stepId));
  return flow?.id;
}

export function resolveList(data, collectionName, ids) {
  if (!ids || !ids.length) return [];
  return ids.map((id) => data[collectionName][id]).filter(Boolean);
}

export function descriptionParagraphs(item) {
  if (!item) return [];
  const text = item.description || item.lifecycle || item.notes || item.summary;
  if (!text) return [];
  return text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
}

export function safetychainModulesForStep(data, stepId) {
  return data.safetychain.modules.filter((m) => m.mapsToStepIds?.includes(stepId));
}

const REVERSE_INDEX_KEYS = ["artifactIds", "materialIds", "systemIds", "regulationIds", "agencyIds"];

// itemId -> Step[] referencing it. A regulation or agency is commonly cited
// by several steps (unlike artifacts/materials/systems, which usually have
// one owning step), so this must return a list, not a single owner.
export function buildStepReverseIndex(data) {
  const index = {};
  for (const step of Object.values(data.steps)) {
    for (const key of REVERSE_INDEX_KEYS) {
      for (const id of step[key] || []) {
        (index[id] ||= []).push(step);
      }
    }
  }
  return index;
}

// Steps don't carry a parent pointer, so finding the step that owns a nested
// flow means scanning for whichever step's nestedFlowId matches. Nesting is
// only ever one level deep, so this is enough to build the crumb trail up to
// any flow (primary flow, or the step that opens into a nested flow).
export function crumbsForFlow(data, flowId) {
  const flow = getFlow(data, flowId);
  if (!flow || flow.path === "primary-flow") {
    return [{ type: "flow", flowPath: "primary-flow" }];
  }
  const parentStep = Object.values(data.steps).find((s) => s.nestedFlowId === flowId);
  if (!parentStep) return [{ type: "flow", flowPath: flow.path }];
  const parentFlow = getFlow(data, findFlowIdForStep(data, parentStep.id));
  return [
    { type: "flow", flowPath: parentFlow.path },
    { type: "step", stepPath: parentStep.path },
    { type: "flow", flowPath: flow.path },
  ];
}
