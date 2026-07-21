<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { parseCrumbs } from "../router";
import { flowIdForPath, stepIdForPath } from "../composables/useData";
import FlowView from "./FlowView.vue";
import StepDetailView from "./StepDetailView.vue";

const props = defineProps({ data: { type: Object, required: true } });

const route = useRoute();
const crumbs = computed(() => parseCrumbs(route.params.crumbs));
const last = computed(() => crumbs.value[crumbs.value.length - 1]);

const flowId = computed(() =>
  last.value.type === "flow" ? flowIdForPath(props.data, last.value.flowPath) : null
);
const stepId = computed(() =>
  last.value.type === "step" ? stepIdForPath(props.data, last.value.stepPath) : null
);
</script>

<template>
  <FlowView v-if="last.type === 'flow'" :data="data" :crumbs="crumbs" :flow-id="flowId" />
  <StepDetailView v-else :data="data" :crumbs="crumbs" :step-id="stepId" />
</template>
