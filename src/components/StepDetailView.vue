<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { resolveList, stepsForFlow } from "../composables/useData";
import { goToStep } from "../router";
import FlowNodeRow from "./FlowNodeRow.vue";
import ListCard from "./ListCard.vue";

const props = defineProps({
  data: { type: Object, required: true },
  crumbs: { type: Array, required: true },
  stepId: { type: String, default: null },
});

const router = useRouter();
const step = computed(() => props.data.steps[props.stepId]);

const threadChips = computed(() => {
  if (!step.value?.threadIds?.length) return [];
  return step.value.threadIds.map((tid) => props.data.threads[tid]).filter(Boolean);
});

const nestedFlow = computed(() => (step.value?.nestedFlowId ? props.data.flows[step.value.nestedFlowId] : null));
const nestedSteps = computed(() => (step.value?.nestedFlowId ? stepsForFlow(props.data, step.value.nestedFlowId) : []));
const nestedCrumbs = computed(() =>
  nestedFlow.value ? [...props.crumbs, { type: "flow", flowPath: nestedFlow.value.path }] : []
);

const regulations = computed(() => resolveList(props.data, "regulations", step.value?.regulationIds));
const agencies = computed(() => resolveList(props.data, "agencies", step.value?.agencyIds));
const roles = computed(() => resolveList(props.data, "roles", step.value?.roleIds));
const artifacts = computed(() => resolveList(props.data, "artifacts", step.value?.artifactIds));
const materials = computed(() => resolveList(props.data, "materials", step.value?.materialIds));
const systems = computed(() => resolveList(props.data, "systems", step.value?.systemIds));

const hasConcrete = computed(
  () => step.value?.artifactIds?.length || step.value?.materialIds?.length || step.value?.systemIds?.length
);

function nameOf(item) {
  return item.name;
}

function onSelectChild(childStep) {
  goToStep(router, nestedCrumbs.value, childStep.path);
}
</script>

<template>
  <p v-if="!step" class="empty-state">Step "{{ stepId }}" not found.</p>
  <template v-else>
    <div class="view-header-card">
      <div class="step-detail__header">
        <h2 class="step-detail__title">{{ step.name }}</h2>
      </div>
      <p class="step-detail__summary">{{ step.summary }}</p>

      <div v-if="threadChips.length" class="thread-chips">
        <span
          v-for="thread in threadChips"
          :key="thread.id"
          class="thread-chip"
          :class="`thread-chip--${thread.key}`"
        >{{ thread.name }}</span>
      </div>
    </div>

    <div v-if="step.nestedFlowId" class="nested-flow-preview">
      <FlowNodeRow :data="data" :steps="nestedSteps" :active-step-id="null" size="compact" @select="onSelectChild" />
    </div>

    <div class="detail-grid">
      <ListCard title="Regulations" :items="regulations" :map-fn="nameOf" detail-collection="regulations" />
      <ListCard title="Agencies" :items="agencies" :map-fn="nameOf" detail-collection="agencies" />
      <ListCard title="Roles" :items="roles" :map-fn="nameOf" />
    </div>

    <template v-if="hasConcrete">
      <h3 style="margin-top: 1.75rem">Implementation Detail</h3>
      <div class="detail-grid">
        <ListCard title="Artifacts" :items="artifacts" :map-fn="nameOf" detail-collection="artifacts" />
        <ListCard title="Materials & Equipment" :items="materials" :map-fn="nameOf" detail-collection="materials" />
        <ListCard title="Systems" :items="systems" :map-fn="nameOf" detail-collection="systems" />
      </div>
    </template>
  </template>
</template>
