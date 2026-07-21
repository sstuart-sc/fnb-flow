<script setup>
import { computed } from "vue";

const THREAD_KEY_ORDER = ["sanitation", "traceability", "recall", "allergen-control"];
const THREAD_SHORT_LABEL = {
  sanitation: "Sanitation",
  traceability: "Traceability",
  recall: "Recall",
  "allergen-control": "Allergen",
};

const props = defineProps({
  data: { type: Object, required: true },
  step: { type: Object, required: true },
  isActive: { type: Boolean, default: false },
  size: { type: String, default: "full" },
});
const emit = defineEmits(["select"]);

const seqLabel = computed(() =>
  props.size === "full" ? `Step ${props.step.sequence}` : String(props.step.sequence).padStart(2, "0")
);

const threadKeys = computed(() => {
  if (!props.step.threadIds?.length) return [];
  const set = new Set(
    props.step.threadIds.map((tid) => props.data.threads[tid]?.key).filter(Boolean)
  );
  return THREAD_KEY_ORDER.filter((k) => set.has(k));
});
</script>

<template>
  <button
    type="button"
    class="flow-node"
    :class="[`flow-node--${size}`, { 'flow-node--active': isActive }]"
    @click="emit('select')"
  >
    <span class="flow-node__seq">{{ seqLabel }}</span>
    <span class="flow-node__name">{{ step.name }}</span>
    <span v-if="threadKeys.length" class="flow-node__threads">
      <span
        v-for="key in threadKeys"
        :key="key"
        class="thread-mini-chip"
        :class="`thread-mini-chip--${key}`"
      >{{ THREAD_SHORT_LABEL[key] }}</span>
    </span>
  </button>
</template>
