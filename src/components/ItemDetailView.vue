<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { idForCollectionPath, buildStepReverseIndex, crumbsForFlow, findFlowIdForStep, descriptionParagraphs } from "../composables/useData";
import { goToItem, goToStep } from "../router";

const props = defineProps({
  data: { type: Object, required: true },
  collectionName: { type: String, required: true },
  path: { type: String, required: true },
});

const router = useRouter();

const COLLECTION_LABEL = {
  artifacts: "Artifact",
  materials: "Material & Equipment",
  systems: "System",
  regulations: "Regulation",
  agencies: "Agency",
};

const itemId = computed(() => idForCollectionPath(props.data, props.collectionName, props.path));
const item = computed(() => props.data[props.collectionName]?.[itemId.value]);
const kicker = computed(() => COLLECTION_LABEL[props.collectionName] || props.collectionName);

const descriptionParas = computed(() => descriptionParagraphs(item.value));

function findRelated(id) {
  for (const collection of ["artifacts", "materials", "systems", "regulations"]) {
    const found = props.data[collection]?.[id];
    if (found) return { collection, item: found };
  }
  return null;
}

const relatedChips = computed(() => {
  if (!item.value?.relatedIds?.length) return [];
  return item.value.relatedIds.map((id) => findRelated(id)).filter(Boolean);
});

const sources = computed(() => {
  if (!item.value?.sourceIds?.length) return [];
  return item.value.sourceIds.map((id) => props.data.sources?.[id]).filter(Boolean);
});

const referencingSteps = computed(() => {
  if (!itemId.value) return [];
  const reverseIndex = buildStepReverseIndex(props.data);
  return reverseIndex[itemId.value] || [];
});

function onRelatedClick(related) {
  if (!related.item.path) return;
  goToItem(router, related.collection, related.item.path);
}

function onStepClick(step) {
  goToStep(router, crumbsForFlow(props.data, findFlowIdForStep(props.data, step.id)), step.path);
}
</script>

<template>
  <p v-if="!item" class="empty-state">
    {{ kicker }} "{{ path }}" not found.
  </p>
  <template v-else>
    <div class="modal__kicker">{{ kicker }}</div>
    <h2 class="flow-view__title">{{ item.name }}</h2>

    <div class="item-detail-card">
      <div v-if="descriptionParas.length" class="modal__description">
        <p v-for="(para, i) in descriptionParas" :key="i">{{ para }}</p>
      </div>

      <div v-if="item.fields?.length" class="modal__section">
        <h4>Fields</h4>
        <table class="modal__fields-table">
          <tr v-for="field in item.fields" :key="field.name">
            <td class="modal__fields-table-name">{{ field.name }}</td>
            <td>{{ field.description }}</td>
          </tr>
        </table>
      </div>

      <div v-if="relatedChips.length" class="modal__section">
        <h4>Related</h4>
        <div class="modal__related-chips">
          <button
            v-for="related in relatedChips"
            :key="related.item.id"
            type="button"
            class="related-chip"
            @click="onRelatedClick(related)"
          >{{ related.item.name }}</button>
        </div>
      </div>

      <div class="modal__section">
        <h4>Referenced by steps</h4>
        <p v-if="!referencingSteps.length" class="empty-note">Not referenced by any step at this depth.</p>
        <div v-else class="modal__related-chips">
          <button
            v-for="step in referencingSteps"
            :key="step.id"
            type="button"
            class="related-chip"
            @click="onStepClick(step)"
          >{{ step.name }}</button>
        </div>
      </div>

      <details v-if="sources.length" class="modal__section modal__sources-disclosure">
        <summary>Sources ({{ sources.length }})</summary>
        <div class="modal__source-list">
          <div v-for="source in sources" :key="source.id" class="modal__source-entry">
            <div class="item-name">{{ source.name }}</div>
            <div v-if="source.citation" class="item-meta">{{ source.citation }}</div>
            <div v-if="source.note" class="item-meta">{{ source.note }}</div>
            <a
              v-if="source.url"
              :href="source.url"
              target="_blank"
              rel="noopener noreferrer"
              class="source-card__link"
            >Read the source ↗</a>
          </div>
        </div>
      </details>
    </div>
  </template>
</template>
