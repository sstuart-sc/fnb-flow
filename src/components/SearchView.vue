<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import Fuse from "fuse.js";
import { crumbsForFlow } from "../composables/useData";
import { goToStep, goToItem } from "../router";
import { simpleMatch } from "../composables/useSearchIndex";

const props = defineProps({
  data: { type: Object, required: true },
  searchIndex: { type: Array, required: true },
  query: { type: [String, Array], default: "" },
});

const router = useRouter();

// Vue Router splits a path segment with `/` into an array for a repeatable
// param (`:query*`); the old hash router treated the whole remainder as one
// decoded string, so rejoin here to match that behavior.
const queryString = computed(() => (Array.isArray(props.query) ? props.query.join("/") : props.query || ""));

const fuse = computed(
  () => new Fuse(props.searchIndex, { keys: ["name", "meta"], threshold: 0.35 })
);

const results = computed(() => {
  if (!queryString.value.trim()) return [];
  return fuse.value.search(queryString.value).map((r) => r.item).slice(0, 40);
});

const fallbackResults = computed(() =>
  results.value.length ? results.value : simpleMatch(props.searchIndex, queryString.value)
);

function onResultClick(result) {
  if (result.collectionName === "steps") {
    const step = props.data.steps[result.itemId];
    goToStep(router, crumbsForFlow(props.data, step.flowId), step.path);
    return;
  }
  if (result.path) {
    goToItem(router, result.collectionName, result.path);
    return;
  }
  if (result.stepId) {
    const step = props.data.steps[result.stepId];
    goToStep(router, crumbsForFlow(props.data, step.flowId), step.path);
  }
}

function isClickable(result) {
  return result.collectionName === "steps" || !!result.path || !!result.stepId;
}

function stepName(stepId) {
  const step = props.data.steps[stepId];
  return step ? step.name : stepId;
}
</script>

<template>
  <h2 class="flow-view__title">{{ queryString ? `Search results for "${queryString}"` : "Search" }}</h2>

  <p v-if="!queryString.trim()" class="empty-state">
    Type in the search box above to look across all artifacts, regulations, systems, and steps.
  </p>
  <p v-else-if="!fallbackResults.length" class="empty-state">No matches.</p>
  <div v-else class="search-results">
    <button
      v-for="(result, i) in fallbackResults"
      :key="`${result.type}-${result.name}-${i}`"
      class="search-result"
      :disabled="!isClickable(result)"
      @click="onResultClick(result)"
    >
      <div class="search-result__type">{{ result.type }}</div>
      <div class="search-result__name">{{ result.name }}</div>
      <div v-if="result.meta" class="search-result__meta">{{ result.meta }}</div>
      <div v-if="result.path && result.stepId" class="search-result__meta">↳ appears in {{ stepName(result.stepId) }}</div>
      <div v-else-if="!result.path && result.stepId" class="search-result__meta">↳ {{ stepName(result.stepId) }}</div>
    </button>
  </div>
</template>
