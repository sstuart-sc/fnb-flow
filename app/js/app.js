import { loadAllData, flowIdForPath, stepIdForPath } from "./data.js";
import { initRouter, onRouteChange, goToSearch, parseHash } from "./router.js";
import { renderMinimap } from "./render-shell.js";
import { renderFlowView } from "./render-flow.js";
import { renderStepView } from "./render-step.js";
import { renderSearchView, buildSearchIndex } from "./render-search.js";

// Optional progressive enhancement: if js/vendor/fuse.js is present and defines
// window.Fuse, we use it for fuzzy search. Otherwise render-search.js falls back
// to a plain substring match, which is entirely adequate at this data's scale.
let fuse = null;

async function main() {
  const data = await loadAllData();
  const searchIndex = buildSearchIndex(data);

  if (window.Fuse) {
    fuse = new window.Fuse(searchIndex, {
      keys: ["name", "meta"],
      threshold: 0.35,
    });
  }

  const searchInput = document.getElementById("search-input");
  let debounceHandle = null;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceHandle);
    debounceHandle = setTimeout(() => goToSearch(searchInput.value), 150);
  });

  const mainEl = document.getElementById("main-content");

  // Plain hash href handles the common case; this covers clicking Home while
  // already at the primary flow, where setting location.hash to its current
  // value is a no-op and no hashchange event fires to trigger a re-render.
  document.getElementById("home-link").addEventListener("click", (e) => {
    if (location.hash === "#/flow/primary-flow") {
      e.preventDefault();
      render(parseHash(), data, searchIndex, mainEl, searchInput);
    }
  });

  onRouteChange((state) => render(state, data, searchIndex, mainEl, searchInput));
  initRouter();

  // initRouter fires hashchange listeners but not on first load if a hash was
  // already present (no change event on load), so render once explicitly.
  render(parseHash(), data, searchIndex, mainEl, searchInput);
}

function render(state, data, searchIndex, mainEl, searchInput) {
  if (state.mode === "search") {
    searchInput.value = state.query;
    renderSearchView(mainEl, data, searchIndex, state.query, fuse);
    renderMinimap(data, []);
    return;
  }

  const crumbs = state.crumbs;
  const last = crumbs[crumbs.length - 1];

  renderMinimap(data, crumbs);

  if (last.type === "flow") {
    const flowId = flowIdForPath(data, last.flowPath);
    renderFlowView(mainEl, data, crumbs, flowId);
  } else {
    const stepId = stepIdForPath(data, last.stepPath);
    renderStepView(mainEl, data, crumbs, stepId);
  }
}

main().catch((err) => {
  console.error(err);
  document.getElementById("main-content").innerHTML =
    `<p class="empty-state">Failed to load data: ${err.message}. If you opened this file directly (file://), run a local server instead — see README.</p>`;
});
