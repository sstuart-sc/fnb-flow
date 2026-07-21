<script setup>
import FlowNode from "./FlowNode.vue";

const props = defineProps({
  data: { type: Object, required: true },
  steps: { type: Array, required: true },
  activeStepId: { type: String, default: null },
  size: { type: String, default: "full" },
});
const emit = defineEmits(["select"]);
</script>

<template>
  <div class="flow-nodes" :class="{ 'flow-nodes--compact': size === 'compact' }">
    <template v-for="(step, i) in steps" :key="step.id">
      <FlowNode
        :data="data"
        :step="step"
        :is-active="step.id === activeStepId"
        :size="size"
        @select="emit('select', step)"
      />
      <span v-if="i < steps.length - 1" class="flow-connector" aria-hidden="true">
        <svg viewBox="0 0 24 10" width="24" height="10" focusable="false">
          <line x1="0" y1="5" x2="18" y2="5" />
          <path d="M14 1 L20 5 L14 9" />
        </svg>
      </span>
    </template>
  </div>
</template>
