<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { goToItem } from "../router";

const props = defineProps({
  data: { type: Object, required: true },
  collectionName: { type: String, required: true },
});

const router = useRouter();

const COLLECTION_META = {
  regulations: {
    label: "Regulations",
    description: "Regulation texts and standards cited across the flow.",
    searchFields: ["name", "citation"],
    filterField: null,
  },
  agencies: {
    label: "Agencies",
    description: "Regulatory and industry bodies referenced across the flow.",
    searchFields: ["name", "fullName"],
    filterField: null,
  },
  systems: {
    label: "Systems",
    description: "Software and platform categories used to run the operation.",
    searchFields: ["name"],
    filterField: "category",
  },
  artifacts: {
    label: "Artifacts",
    description: "Forms, records, and documents produced or consumed along the flow.",
    searchFields: ["name", "format"],
    filterField: "format",
  },
  materials: {
    label: "Materials & Equipment",
    description: "Physical materials, tools, and equipment used along the flow.",
    searchFields: ["name"],
    filterField: "type",
  },
};

const meta = computed(() => COLLECTION_META[props.collectionName]);

const searchQuery = ref("");
const filterValue = ref("");

const items = computed(() => Object.values(props.data[props.collectionName] || {}));

const filterOptions = computed(() => {
  if (!meta.value.filterField) return [];
  const values = new Set(items.value.map((i) => i[meta.value.filterField]).filter(Boolean));
  return [...values].sort();
});

const filtered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return items.value
    .filter((item) => {
      if (filterValue.value && item[meta.value.filterField] !== filterValue.value) return false;
      if (!q) return true;
      const haystack = meta.value.searchFields.map((f) => item[f] || "").join(" ").toLowerCase();
      return haystack.includes(q);
    })
    .sort((a, b) => a.name.localeCompare(b.name));
});

function metaLine(item) {
  return meta.value.searchFields
    .slice(1)
    .map((f) => item[f])
    .filter(Boolean)
    .join(" · ");
}

function onItemClick(item) {
  goToItem(router, props.collectionName, item.path);
}
</script>

<template>
  <h2 class="flow-view__title">{{ meta.label }} ({{ items.length }})</h2>
  <p class="flow-view__summary">{{ meta.description }}</p>

  <div class="sources-controls">
    <input
      v-model="searchQuery"
      type="search"
      :placeholder="`Filter ${meta.label.toLowerCase()} by name…`"
      class="sources-controls__search"
    />
    <select v-if="meta.filterField" v-model="filterValue" class="sources-controls__type">
      <option value="">All</option>
      <option v-for="opt in filterOptions" :key="opt" :value="opt">{{ opt }}</option>
    </select>
  </div>

  <p v-if="!filtered.length" class="empty-state">No {{ meta.label.toLowerCase() }} match.</p>
  <div v-else class="search-results">
    <button
      v-for="item in filtered"
      :key="item.id"
      type="button"
      class="search-result"
      @click="onItemClick(item)"
    >
      <div class="search-result__name">{{ item.name }}</div>
      <div v-if="metaLine(item)" class="search-result__meta">{{ metaLine(item) }}</div>
    </button>
  </div>
</template>
