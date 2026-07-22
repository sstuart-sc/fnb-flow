<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { stepsForFlow, displayFlowName } from "../composables/useData";
import { goToStep } from "../router";
import FlowNodeRow from "./FlowNodeRow.vue";

const props = defineProps({
  data: { type: Object, required: true },
  crumbs: { type: Array, required: true },
  flowId: { type: String, default: null },
});

const router = useRouter();
const flow = computed(() => props.data.flows[props.flowId]);
const steps = computed(() => (props.flowId ? stepsForFlow(props.data, props.flowId) : []));

function onSelect(step) {
  goToStep(router, props.crumbs, step.path);
}
</script>

<template>
  <p v-if="!flow" class="empty-state">Flow "{{ flowId }}" not found.</p>
  <template v-else>
    <div class="view-header-card">
      <h2 class="flow-view__title">{{ displayFlowName(flow) }}</h2>
      <p class="flow-view__summary">{{ flow.summary }}</p>
    </div>
    <FlowNodeRow :data="data" :steps="steps" :active-step-id="null" size="full" @select="onSelect" />
  </template>
</template>
