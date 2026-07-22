<script setup>
import { computed } from "vue";
import { openDetailModal } from "../composables/useModals";

const props = defineProps({
  item: { type: Object, required: true },
  name: { type: String, required: true },
  detailCollection: { type: String, default: null },
});

// Mirrors DetailModal's own description fallback chain — a card only opens
// the modal if there's actually something in it worth showing.
const hasDetail = computed(
  () =>
    !!props.detailCollection &&
    !!(props.item.description || props.item.lifecycle || props.item.notes || props.item.summary || props.item.fields?.length)
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
</script>

<template>
  <li
    :class="{ 'item-card': hasDetail }"
    :tabindex="hasDetail ? 0 : undefined"
    :role="hasDetail ? 'button' : undefined"
    @click="hasDetail ? open() : undefined"
    @keydown="hasDetail ? onKeydown($event) : undefined"
  >
    <div class="item-card__row">
      <div class="item-name">{{ name }}</div>
      <span v-if="hasDetail" class="item-card__chevron" aria-hidden="true">›</span>
    </div>
  </li>
</template>
