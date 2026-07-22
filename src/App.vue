<script setup>
import { computed, onMounted, onUnmounted, ref, shallowRef, watch, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { loadAllData } from "./composables/useData";
import { buildSearchIndex } from "./composables/useSearchIndex";
import { goToSearch } from "./router";
import OrientationPanel from "./components/OrientationPanel.vue";
import DetailModal from "./components/DetailModal.vue";
import BrowseView from "./components/BrowseView.vue";
import SearchView from "./components/SearchView.vue";
import SourcesView from "./components/SourcesView.vue";
import CollectionView from "./components/CollectionView.vue";
import ItemDetailView from "./components/ItemDetailView.vue";
import RegulationsTimelineView from "./components/RegulationsTimelineView.vue";
import AgencyGraphsView from "./components/AgencyGraphsView.vue";
import { parseCrumbs } from "./router";

const COLLECTION_NAV = [
  { name: "regulations", label: "Regulations" },
  { name: "agencies", label: "Agencies" },
  { name: "systems", label: "Systems" },
  { name: "artifacts", label: "Artifacts" },
  { name: "materials", label: "Materials" },
];

const route = useRoute();
const router = useRouter();

const data = shallowRef(null);
const searchIndex = shallowRef([]);
const loadError = ref(null);
const searchInput = ref("");
const mobileMenuOpen = ref(false);
const openNavGroup = ref(null);
let debounceHandle = null;

onMounted(async () => {
  try {
    data.value = await loadAllData();
    searchIndex.value = buildSearchIndex(data.value);
  } catch (err) {
    console.error(err);
    loadError.value = err.message;
  }
});

const isBrowse = computed(() => route.name === "browse");
const isSources = computed(() => route.name === "sources");
const isSearch = computed(() => route.name === "search");
const isTimeline = computed(() => route.name === "timeline");
const isAgencyGraphs = computed(() => route.name === "agency-graphs");
const activeCollection = computed(() => {
  const match = COLLECTION_NAV.find(
    (c) => route.name === c.name || route.name === `${c.name}-detail`
  );
  return match?.name || null;
});
const collectionViewName = computed(() =>
  COLLECTION_NAV.some((c) => route.name === c.name) ? route.name : null
);
const collectionDetailName = computed(() => {
  const match = COLLECTION_NAV.find((c) => route.name === `${c.name}-detail`);
  return match?.name || null;
});

const isToolsActive = computed(() => isTimeline.value || isAgencyGraphs.value);
const isDataActive = computed(() => isSources.value || !!activeCollection.value);

function toggleNavGroup(name) {
  openNavGroup.value = openNavGroup.value === name ? null : name;
}

function onKeydown(e) {
  if (e.key === "Escape") {
    if (openNavGroup.value) openNavGroup.value = null;
    else if (mobileMenuOpen.value) mobileMenuOpen.value = false;
  }
}
onMounted(() => document.addEventListener("keydown", onKeydown));
onUnmounted(() => document.removeEventListener("keydown", onKeydown));

function onClickOutside(e) {
  if (openNavGroup.value && !e.target.closest(".app-header__nav-group")) {
    openNavGroup.value = null;
  }
}
onMounted(() => document.addEventListener("click", onClickOutside));
onUnmounted(() => document.removeEventListener("click", onClickOutside));

watch(route, () => {
  mobileMenuOpen.value = false;
  openNavGroup.value = null;
});

// Vue's root is mounted directly into #app (see index.html/main.js), so the
// grid layout lives on that element the same way the old app toggled a class
// on <body>.
watchEffect(() => {
  document.getElementById("app")?.classList.toggle("no-minimap", !isBrowse.value);
});

const crumbs = computed(() => (isBrowse.value ? parseCrumbs(route.params.crumbs) : []));

function onSearchInput() {
  clearTimeout(debounceHandle);
  debounceHandle = setTimeout(() => goToSearch(router, searchInput.value), 150);
}

// Plain hash href handles the common case; this covers clicking Home while
// already at the primary flow, where the route wouldn't otherwise change.
function onHomeClick(e) {
  if (route.fullPath === "/flow/primary-flow") {
    e.preventDefault();
  }
}
</script>

<template>
  <template v-if="loadError">
    <p class="empty-state">
      Failed to load data: {{ loadError }}. If you opened this file directly (file://), run a local server instead.
    </p>
  </template>
  <template v-else-if="data">
    <header class="app-header">
      <router-link to="/flow/primary-flow" class="app-header__brand" @click="onHomeClick">F&amp;B Flow</router-link>

      <button
        type="button"
        class="app-header__menu-toggle"
        aria-haspopup="true"
        :aria-expanded="mobileMenuOpen"
        aria-label="Toggle navigation menu"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >☰</button>

      <div class="app-header__search">
        <input
          v-model="searchInput"
          type="search"
          placeholder="Search artifacts, regulations, systems…"
          autocomplete="off"
          @input="onSearchInput"
        />
      </div>

      <div class="app-header__collapsible" :class="{ 'app-header__collapsible--open': mobileMenuOpen }">
        <nav class="app-header__nav" aria-label="Primary">
          <router-link
            to="/flow/primary-flow"
            class="app-header__nav-link"
            :class="{ 'app-header__nav-link--active': isBrowse }"
          >Flow</router-link>
          <div class="app-header__nav-group">
            <button
              type="button"
              class="app-header__nav-link app-header__nav-link--group"
              :class="{ 'app-header__nav-link--active': isToolsActive }"
              :aria-expanded="openNavGroup === 'tools'"
              aria-haspopup="true"
              @click="toggleNavGroup('tools')"
            >Tools</button>
            <div
              class="app-header__nav-dropdown"
              :class="{ 'app-header__nav-dropdown--open': openNavGroup === 'tools' }"
            >
              <router-link
                to="/timeline"
                class="app-header__nav-link"
                :class="{ 'app-header__nav-link--active': isTimeline }"
              >Regulation Timeline</router-link>
              <router-link
                to="/agency-graphs"
                class="app-header__nav-link"
                :class="{ 'app-header__nav-link--active': isAgencyGraphs }"
              >Agency Graphs</router-link>
            </div>
          </div>
          <div class="app-header__nav-group">
            <button
              type="button"
              class="app-header__nav-link app-header__nav-link--group"
              :class="{ 'app-header__nav-link--active': isDataActive }"
              :aria-expanded="openNavGroup === 'data'"
              aria-haspopup="true"
              @click="toggleNavGroup('data')"
            >Reference</button>
            <div
              class="app-header__nav-dropdown"
              :class="{ 'app-header__nav-dropdown--open': openNavGroup === 'data' }"
            >
              <router-link
                to="/sources"
                class="app-header__nav-link"
                :class="{ 'app-header__nav-link--active': isSources }"
              >Sources</router-link>
              <router-link
                v-for="c in COLLECTION_NAV"
                :key="c.name"
                :to="`/${c.name}`"
                class="app-header__nav-link"
                :class="{ 'app-header__nav-link--active': activeCollection === c.name }"
              >{{ c.label }}</router-link>
            </div>
          </div>
        </nav>
      </div>
    </header>

    <aside v-if="isBrowse" id="minimap" class="minimap" aria-label="Flow orientation panel">
      <OrientationPanel :data="data" :crumbs="crumbs" />
    </aside>

    <main id="main-content" class="main-content" aria-live="polite">
      <BrowseView v-if="isBrowse" :data="data" />
      <SearchView
        v-else-if="isSearch"
        :data="data"
        :search-index="searchIndex"
        :query="route.params.query"
      />
      <SourcesView v-else-if="isSources" :data="data" />
      <RegulationsTimelineView v-else-if="isTimeline" :data="data" />
      <AgencyGraphsView v-else-if="isAgencyGraphs" :data="data" />
      <CollectionView
        v-else-if="collectionViewName"
        :data="data"
        :collection-name="collectionViewName"
      />
      <ItemDetailView
        v-else-if="collectionDetailName"
        :data="data"
        :collection-name="collectionDetailName"
        :path="route.params.path"
      />
    </main>

    <DetailModal :data="data" />
  </template>
  <template v-else />
</template>
