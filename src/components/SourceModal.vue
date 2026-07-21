<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { modalState, closeSourceModal } from "../composables/useModals";

const props = defineProps({ data: { type: Object, required: true } });

const closeBtn = ref(null);
const entry = computed(() => modalState.source);
const sources = computed(() => {
  if (!entry.value) return [];
  return entry.value.sourceIds.map((id) => props.data.sources?.[id]).filter(Boolean);
});

function onKeydown(e) {
  if (e.key === "Escape" && entry.value) closeSourceModal();
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
  if (e.target === e.currentTarget) closeSourceModal();
}
</script>

<template>
  <div v-if="entry" class="modal-overlay" @click="onOverlayClick">
    <div class="modal" role="dialog" aria-modal="true">
      <h3 class="modal__heading">Sources for {{ entry.itemName }}</h3>
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
      <button
        ref="closeBtn"
        type="button"
        class="modal__close"
        aria-label="Close"
        @click="closeSourceModal"
      >×</button>
    </div>
  </div>
</template>
