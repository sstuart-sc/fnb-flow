<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { modalState, closeDetailModal, openDetailModal } from "../composables/useModals";

const props = defineProps({ data: { type: Object, required: true } });

const COLLECTION_LABEL = {
  artifacts: "Artifact",
  materials: "Material & Equipment",
  systems: "System",
  regulations: "Regulation",
};

const closeBtn = ref(null);

const entry = computed(() => modalState.detail);
const item = computed(() => entry.value?.item);
const kicker = computed(() => COLLECTION_LABEL[entry.value?.collectionName] || entry.value?.collectionName);
const description = computed(() => {
  const it = item.value;
  if (!it) return null;
  return it.description || it.lifecycle || it.notes || it.summary;
});

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
</script>

<template>
  <div v-if="entry" class="modal-overlay" @click="onOverlayClick">
    <div class="modal modal--detail" role="dialog" aria-modal="true">
      <div class="modal__kicker">{{ kicker }}</div>
      <h3 class="modal__heading">{{ item.name }}</h3>
      <p v-if="description" class="modal__description">{{ description }}</p>

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
            @click="openDetailModal(related.collection, related.item)"
          >{{ related.item.name }}</button>
        </div>
      </div>

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
