<script setup>
import { computed, ref } from "vue";

const props = defineProps({ data: { type: Object, required: true } });

const TYPE_ORDER = ["regulation-text", "industry-standard", "vendor-doc", "subject-matter-judgment"];
const TYPE_LABEL = {
  "regulation-text": "Regulation text",
  "industry-standard": "Industry standard",
  "vendor-doc": "Vendor documentation",
  "subject-matter-judgment": "Subject-matter judgment",
};

const searchQuery = ref("");
const typeFilter = ref("");

const sources = computed(() => Object.values(props.data.sources || {}));

const citedByIndex = computed(() => {
  const index = {};
  const collections = ["regulations", "agencies", "artifacts", "materials", "systems", "steps"];
  for (const collectionName of collections) {
    for (const item of Object.values(props.data[collectionName] || {})) {
      for (const sourceId of item.sourceIds || []) {
        (index[sourceId] ||= []).push({ collectionName, item });
      }
    }
  }
  return index;
});

const filtered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  return sources.value.filter((s) => {
    if (typeFilter.value && s.type !== typeFilter.value) return false;
    if (!q) return true;
    const haystack = `${s.name} ${s.citation || ""} ${s.note || ""}`.toLowerCase();
    return haystack.includes(q);
  });
});

const grouped = computed(() => {
  const byType = {};
  for (const s of filtered.value) (byType[s.type] ||= []).push(s);
  return TYPE_ORDER.map((type) => ({ type, label: TYPE_LABEL[type], items: byType[type] || [] })).filter(
    (g) => g.items.length
  );
});

function citedBy(sourceId) {
  return citedByIndex.value[sourceId] || [];
}
</script>

<template>
  <div class="view-header-card">
    <h2 class="flow-view__title">Sources</h2>
    <p class="flow-view__summary">
      Every regulation text, industry standard, vendor document, or explicit subject-matter judgment grounding a fact
      in this data. Filter by type or search by name.
    </p>

    <div class="sources-controls">
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Filter sources by name…"
        class="sources-controls__search"
      />
      <select v-model="typeFilter" class="sources-controls__type">
        <option value="">All types</option>
        <option v-for="type in TYPE_ORDER" :key="type" :value="type">{{ TYPE_LABEL[type] }}</option>
      </select>
    </div>
  </div>

  <p v-if="!filtered.length" class="empty-state">No sources match.</p>
  <template v-for="group in grouped" :key="group.type">
    <h3 class="nested-flow-preview__heading" style="margin-top: 1.5rem">{{ group.label }} ({{ group.items.length }})</h3>
    <div class="search-results">
      <div v-for="source in group.items" :key="source.id" :id="`source-${source.id}`" class="search-result source-card">
        <div class="search-result__name">{{ source.name }}</div>
        <div v-if="source.citation" class="search-result__meta">{{ source.citation }}</div>
        <div v-if="source.note" class="search-result__meta">{{ source.note }}</div>
        <a
          v-if="source.url"
          :href="source.url"
          target="_blank"
          rel="noopener noreferrer"
          class="source-card__link"
        >Read the source ↗</a>
        <div v-if="citedBy(source.id).length" class="source-card__cited-by">
          Cited by: {{ citedBy(source.id).map((c) => c.item.name).join(", ") }}
        </div>
      </div>
    </div>
  </template>
</template>
