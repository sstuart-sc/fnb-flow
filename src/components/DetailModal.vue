<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { modalState, closeDetailModal, openDetailModal } from "../composables/useModals";
import { descriptionParagraphs } from "../composables/useData";

const props = defineProps({ data: { type: Object, required: true } });

const router = useRouter();

const COLLECTION_LABEL = {
  artifacts: "Artifact",
  materials: "Material & Equipment",
  systems: "System",
  regulations: "Regulation",
  agencies: "Agency",
};

const closeBtn = ref(null);

const entry = computed(() => modalState.detail);
const item = computed(() => entry.value?.item);
const kicker = computed(() => COLLECTION_LABEL[entry.value?.collectionName] || entry.value?.collectionName);
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

function onKeydown(e) {
  if (e.key === "Escape" && entry.value) closeDetailModal();
}

onMounted(() => document.addEventListener("keydown", onKeydown));
onUnmounted(() => document.removeEventListener("keydown", onKeydown));

watch(entry, async (val) => {
  if (val) {
    await new Promise((r) => requestAnimationFrame(r));
    closeBtn.value?.focus();
  }
});

function onOverlayClick(e) {
  if (e.target === e.currentTarget) closeDetailModal();
}

const viewFullPageHref = computed(() => {
  if (!item.value?.path) return null;
  const { href } = router.resolve(`/${entry.value.collectionName}/${encodeURIComponent(item.value.path)}`);
  return href;
});
</script>

<template>
  <div v-if="entry" class="modal-overlay" @click="onOverlayClick">
    <div class="modal modal--detail" role="dialog" aria-modal="true">
      <div class="modal__kicker">{{ kicker }}</div>
      <h3 class="modal__heading">{{ item.name }}</h3>
      <a
        v-if="viewFullPageHref"
        :href="viewFullPageHref"
        target="_blank"
        rel="noopener noreferrer"
        class="modal__view-full-page"
      >View full page →</a>
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

      <div v-if="item.capabilities?.length" class="modal__section">
        <h4>Capabilities</h4>
        <table class="modal__fields-table">
          <tr v-for="capability in item.capabilities" :key="capability.name">
            <td class="modal__fields-table-name">{{ capability.name }}</td>
            <td>{{ capability.description }}</td>
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
            @click="openDetailModal(related.collection, related.item)"
          >{{ related.item.name }}</button>
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

      <button
        ref="closeBtn"
        type="button"
        class="modal__close"
        aria-label="Close"
        @click="closeDetailModal"
      >×</button>
    </div>
  </div>
</template>
