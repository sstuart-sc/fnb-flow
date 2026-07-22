import { createRouter, createWebHashHistory } from "vue-router";
import BrowseView from "../components/BrowseView.vue";
import SearchView from "../components/SearchView.vue";
import SourcesView from "../components/SourcesView.vue";
import CollectionView from "../components/CollectionView.vue";
import ItemDetailView from "../components/ItemDetailView.vue";
import RegulationsTimelineView from "../components/RegulationsTimelineView.vue";
import AgencyGraphsView from "../components/AgencyGraphsView.vue";

const COLLECTION_ROUTE_NAMES = ["regulations", "agencies", "systems", "artifacts", "materials"];

// Existing hash shape (preserved from the vanilla router):
//   #/flow/<flowPath>
//   #/flow/<flowPath>/step/<stepPath>
//   #/flow/<flowPath>/step/<stepPath>/flow/<flowPath>/step/<stepPath>...
//   #/search/<query>
//   #/sources
//
// Vue Router's hash history matches these paths directly against location.hash
// (minus the leading #), so a single repeating "/flow/:path/step/:path/..."
// pattern needs a wildcard match — captured here as a single `crumbs` param
// split on "/", parsed the same way the old router.js parsed `parts`.
const collectionRoutes = COLLECTION_ROUTE_NAMES.flatMap((collectionName) => [
  {
    path: `/${collectionName}`,
    name: collectionName,
    component: CollectionView,
    props: { collectionName },
  },
  {
    path: `/${collectionName}/:path`,
    name: `${collectionName}-detail`,
    component: ItemDetailView,
    props: (route) => ({ collectionName, path: route.params.path }),
  },
]);

const routes = [
  { path: "/search/:query*", name: "search", component: SearchView, props: true },
  { path: "/sources", name: "sources", component: SourcesView },
  { path: "/timeline", name: "timeline", component: RegulationsTimelineView },
  { path: "/agency-graphs", name: "agency-graphs", component: AgencyGraphsView },
  ...collectionRoutes,
  { path: "/flow/:crumbs+", name: "browse", component: BrowseView },
  { path: "/", redirect: "/flow/primary-flow" },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// Parses the flat ["flow", path, "step", path, ...] segments (as they appear
// after the leading "/flow/" in the URL) into the same crumb-array shape the
// old router.js produced, so downstream code (crumbsForFlow, minimap, etc.)
// is unchanged.
export function parseCrumbs(crumbsParam) {
  const parts = Array.isArray(crumbsParam) ? crumbsParam : [crumbsParam];
  const all = ["flow", ...parts];
  const crumbs = [];
  for (let i = 0; i < all.length; i += 2) {
    const key = all[i];
    const val = decodeURIComponent(all[i + 1] || "");
    if (key === "flow") crumbs.push({ type: "flow", flowPath: val });
    else if (key === "step") crumbs.push({ type: "step", stepPath: val });
  }
  if (!crumbs.length) crumbs.push({ type: "flow", flowPath: "primary-flow" });
  return crumbs;
}

export function crumbsToPath(crumbs) {
  const parts = crumbs.flatMap((c) =>
    c.type === "flow" ? ["flow", encodeURIComponent(c.flowPath)] : ["step", encodeURIComponent(c.stepPath)]
  );
  return `/${parts.join("/")}`;
}

export function goToFlow(router, flowPath) {
  router.push(crumbsToPath([{ type: "flow", flowPath }]));
}

export function goToStep(router, currentCrumbs, stepPath) {
  router.push(crumbsToPath([...currentCrumbs, { type: "step", stepPath }]));
}

export function goToNestedFlow(router, currentCrumbs, flowPath) {
  router.push(crumbsToPath([...currentCrumbs, { type: "flow", flowPath }]));
}

export function goToCrumb(router, crumbs, index) {
  router.push(crumbsToPath(crumbs.slice(0, index + 1)));
}

export function goToSearch(router, query) {
  router.push(`/search/${encodeURIComponent(query || "")}`);
}

export function goToSources(router) {
  router.push("/sources");
}

export function goToCollection(router, collectionName) {
  router.push(`/${collectionName}`);
}

export function goToItem(router, collectionName, path) {
  router.push(`/${collectionName}/${encodeURIComponent(path)}`);
}

export function goToTimeline(router) {
  router.push("/timeline");
}

export function goToAgencyGraphs(router) {
  router.push("/agency-graphs");
}
