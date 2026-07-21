// View state lives entirely in the URL hash, e.g.:
//   #/flow/primary-flow
//   #/flow/primary-flow/step/processing-production
//   #/flow/processing-production-nested/step/ccp-monitoring
//   #/search/ccp
//
// The router only ever deals in `path` values (human-readable, routable),
// never `id` values (opaque relational keys) — that boundary is enforced by
// naming (flowPath/stepPath, not flowId/stepId) so a raw id can't accidentally
// leak into a URL. app.js/data.js translate path<->id at the data layer.
//
// Each router state is a flat crumb array we parse/serialize. Drilling in
// pushes a new flow crumb; the breadcrumb is derived by walking step.nestedFlowId
// backward isn't possible (steps don't point to parents), so we keep the path
// explicit here.

const listeners = new Set();

export function onRouteChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  const state = parseHash();
  for (const fn of listeners) fn(state);
}

export function parseHash() {
  const hash = location.hash.replace(/^#\/?/, "");
  const parts = hash.split("/").filter(Boolean);

  if (parts[0] === "search") {
    return { mode: "search", query: decodeURIComponent(parts[1] || "") };
  }

  // parts look like: flow/<flowPath>/step/<stepPath>/flow/<flowPath>/step/<stepPath>...
  const crumbs = [];
  for (let i = 0; i < parts.length; i += 2) {
    const key = parts[i];
    const val = decodeURIComponent(parts[i + 1] || "");
    if (key === "flow") crumbs.push({ type: "flow", flowPath: val });
    else if (key === "step") crumbs.push({ type: "step", stepPath: val });
  }

  if (!crumbs.length) crumbs.push({ type: "flow", flowPath: "primary-flow" });

  return { mode: "browse", crumbs };
}

function serialize(state) {
  if (state.mode === "search") {
    return `#/search/${encodeURIComponent(state.query || "")}`;
  }
  const parts = state.crumbs.flatMap((c) =>
    c.type === "flow" ? ["flow", encodeURIComponent(c.flowPath)] : ["step", encodeURIComponent(c.stepPath)]
  );
  return `#/${parts.join("/")}`;
}

export function navigate(state) {
  location.hash = serialize(state);
}

export function goToFlow(flowPath) {
  navigate({ mode: "browse", crumbs: [{ type: "flow", flowPath }] });
}

export function goToStep(currentCrumbs, stepPath) {
  navigate({ mode: "browse", crumbs: [...currentCrumbs, { type: "step", stepPath }] });
}

export function goToNestedFlow(currentCrumbs, flowPath) {
  navigate({ mode: "browse", crumbs: [...currentCrumbs, { type: "flow", flowPath }] });
}

export function goToCrumb(crumbs, index) {
  navigate({ mode: "browse", crumbs: crumbs.slice(0, index + 1) });
}

export function goToSearch(query) {
  navigate({ mode: "search", query });
}

export function initRouter() {
  window.addEventListener("hashchange", notify);
  if (!location.hash) location.hash = "#/flow/primary-flow";
  else notify();
}
