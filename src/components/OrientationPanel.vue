<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { stepsForFlow, flowIdForPath, stepIdForPath, displayFlowName } from "../composables/useData";
import { goToStep } from "../router";

const props = defineProps({
  data: { type: Object, required: true },
  crumbs: { type: Array, required: true },
});

const router = useRouter();

// Build the list of (flowId, activeStepId-or-null) levels implied by crumbs —
// same walk as the old render-shell.js renderMinimap.
const levels = computed(() => {
  const result = [];
  let currentFlowPath = "primary-flow";
  const crumbs = props.crumbs;
  for (let i = 0; i < crumbs.length; i++) {
    const crumb = crumbs[i];
    if (crumb.type === "flow") {
      currentFlowPath = crumb.flowPath;
      continue;
    }
    const flowId = flowIdForPath(props.data, currentFlowPath);
    const stepId = stepIdForPath(props.data, crumb.stepPath);
    result.push({ flowId, activeStepId: stepId, crumbsUpToFlow: crumbs.slice(0, i) });

    const step = props.data.steps[stepId];
    const isLastCrumb = i === crumbs.length - 1;
    if (isLastCrumb && step?.nestedFlowId) {
      const nestedFlow = props.data.flows[step.nestedFlowId];
      result.push({
        flowId: step.nestedFlowId,
        activeStepId: null,
        crumbsUpToFlow: crumbs.slice(0, i + 1).concat([{ type: "flow", flowPath: nestedFlow.path }]),
        preview: true,
      });
    }
  }

  if (!result.length) {
    const primaryFlowId = flowIdForPath(props.data, "primary-flow");
    result.push({
      flowId: primaryFlowId,
      activeStepId: null,
      crumbsUpToFlow: [{ type: "flow", flowPath: "primary-flow" }],
    });
  }

  return result;
});

function levelSteps(flowId) {
  return stepsForFlow(props.data, flowId);
}

function onSelect(level, step) {
  goToStep(router, level.crumbsUpToFlow, step.path);
}
</script>

<template>
  <div
    v-for="(level, depth) in levels"
    :key="`${level.flowId}-${depth}`"
    class="minimap__level"
    :class="{ 'minimap__level--nested': depth > 0, 'minimap__level--preview': level.preview }"
    :style="depth > 0 ? { '--nest-depth': String(Math.min(depth, 6)) } : {}"
  >
    <h3>{{ data.flows[level.flowId] ? displayFlowName(data.flows[level.flowId]) : "Flow" }}</h3>
    <ul class="minimap__list">
      <li v-for="step in levelSteps(level.flowId)" :key="step.id">
        <button
          class="minimap__item"
          :class="{
            'minimap__item--active': step.id === level.activeStepId,
            'minimap__item--has-nested': !!step.nestedFlowId,
          }"
          @click="onSelect(level, step)"
        >
          <span class="minimap__seq">{{ String(step.sequence).padStart(2, '0') }}</span>
          <span>{{ step.name }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>
