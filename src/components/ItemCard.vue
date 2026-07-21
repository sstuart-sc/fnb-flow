<script setup>
import { computed } from "vue";
import { openDetailModal, openSourceModal } from "../composables/useModals";

const props = defineProps({
  item: { type: Object, required: true },
  name: { type: String, required: true },
  meta: { type: String, default: "" },
  detailCollection: { type: String, default: null },
});

const hasDetail = computed(
  () => !!props.detailCollection && (props.item.description || props.item.fields?.length)
);

function open() {
  if (hasDetail.value) openDetailModal(props.detailCollection, props.item);
}

function onKeydown(e) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    open();
  }
}

function onClick(e) {
  if (e.target.closest(".item-source-note--button")) return;
  open();
}

function onSourceClick() {
  openSourceModal(props.name, props.item.sourceIds);
}
</script>

<template>
  <li
    :class="{ 'item-card': hasDetail }"
    :tabindex="hasDetail ? 0 : undefined"
    :role="hasDetail ? 'button' : undefined"
    @click="hasDetail ? onClick($event) : undefined"
    @keydown="hasDetail ? onKeydown($event) : undefined"
  >
    <div class="item-name">{{ name }}</div>
    <div v-if="meta" class="item-meta">{{ meta }}</div>
    <button
      v-if="item.sourceIds?.length"
      type="button"
      class="item-source-note item-source-note--button"
      @click="onSourceClick"
    >Sourced ({{ item.sourceIds.length }})</button>
  </li>
</template>
