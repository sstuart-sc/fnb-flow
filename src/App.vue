<script setup>
import { computed, onMounted, ref, shallowRef, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { loadAllData } from "./composables/useData";
import { buildSearchIndex } from "./composables/useSearchIndex";
import { goToSearch } from "./router";
import OrientationPanel from "./components/OrientationPanel.vue";
import DetailModal from "./components/DetailModal.vue";
import SourceModal from "./components/SourceModal.vue";
import BrowseView from "./components/BrowseView.vue";
import SearchView from "./components/SearchView.vue";
import SourcesView from "./components/SourcesView.vue";
import { parseCrumbs } from "./router";

const route = useRoute();
const router = useRouter();

const data = shallowRef(null);
const searchIndex = shallowRef([]);
const loadError = ref(null);
const searchInput = ref("");
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
      <nav class="app-header__nav" aria-label="Primary">
        <router-link
          to="/flow/primary-flow"
          class="app-header__nav-link"
          :class="{ 'app-header__nav-link--active': isBrowse }"
        >Flow</router-link>
        <router-link
          to="/sources"
          class="app-header__nav-link"
          :class="{ 'app-header__nav-link--active': isSources }"
        >Sources</router-link>
      </nav>
      <div class="app-header__search">
        <input
          v-model="searchInput"
          type="search"
          placeholder="Search artifacts, regulations, systems…"
          autocomplete="off"
          @input="onSearchInput"
        />
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
    </main>

    <DetailModal :data="data" />
    <SourceModal :data="data" />
  </template>
  <template v-else />
</template>
