import { goToStep } from "./router.js";
import { stepsForFlow, flowIdForPath, stepIdForPath, displayFlowName } from "./data.js";

// Persistent orientation panel: renders every flow level on the current
// crumb path (primary flow, then whichever nested flow the crumbs walked
// into, and so on), each as its own labeled group of sibling steps, with
// the active step highlighted at whichever level it lives on. Unlike the
// old minimap (primary flow only), this stays true to "where am I, what
// are my siblings, what's next" at any nesting depth.
export function renderMinimap(data, crumbs) {
  const el = document.getElementById("minimap");
  el.innerHTML = "";

  // Build the list of (flowId, activeStepId-or-null) levels implied by crumbs.
  const levels = [];
  let currentFlowPath = "primary-flow";
  for (let i = 0; i < crumbs.length; i++) {
    const crumb = crumbs[i];
    if (crumb.type === "flow") {
      currentFlowPath = crumb.flowPath;
      continue;
    }
    // crumb.type === "step": this step lives in currentFlowPath's flow.
    const flowId = flowIdForPath(data, currentFlowPath);
    const stepId = stepIdForPath(data, crumb.stepPath);
    levels.push({ flowId, activeStepId: stepId, crumbsUpToFlow: crumbs.slice(0, i) });

    const step = data.steps[stepId];
    // If the very next crumb is the nested flow this step owns, the loop's
    // next iteration will pick up that flow path naturally. If this is the
    // last crumb and the step owns a nested flow, show that flow too (empty
    // active step) so the panel previews what's one level deeper.
    const isLastCrumb = i === crumbs.length - 1;
    if (isLastCrumb && step?.nestedFlowId) {
      const nestedFlow = data.flows[step.nestedFlowId];
      levels.push({
        flowId: step.nestedFlowId,
        activeStepId: null,
        crumbsUpToFlow: crumbs.slice(0, i + 1).concat([{ type: "flow", flowPath: nestedFlow.path }]),
        preview: true,
      });
    }
  }

  if (!levels.length) {
    const primaryFlowId = flowIdForPath(data, "primary-flow");
    levels.push({ flowId: primaryFlowId, activeStepId: null, crumbsUpToFlow: [] });
  }

  levels.forEach((level, i) => {
    el.appendChild(renderLevel(data, level, i));
  });
}

function renderLevel(data, level, depth) {
  const flow = data.flows[level.flowId];
  const group = document.createElement("div");
  group.className = "minimap__level";
  if (depth > 0) {
    group.classList.add("minimap__level--nested");
    group.style.setProperty("--nest-depth", String(Math.min(depth, 6)));
  }
  if (level.preview) group.classList.add("minimap__level--preview");

  const heading = document.createElement("h3");
  heading.textContent = flow ? displayFlowName(flow) : "Flow";
  group.appendChild(heading);

  const list = document.createElement("ul");
  list.className = "minimap__list";

  const steps = stepsForFlow(data, level.flowId);
  for (const step of steps) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "minimap__item";
    if (step.id === level.activeStepId) btn.classList.add("minimap__item--active");
    if (step.nestedFlowId) btn.classList.add("minimap__item--has-nested");

    const seq = document.createElement("span");
    seq.className = "minimap__seq";
    seq.textContent = String(step.sequence).padStart(2, "0");
    btn.appendChild(seq);

    const label = document.createElement("span");
    label.textContent = step.name;
    btn.appendChild(label);

    btn.addEventListener("click", () => goToStep(level.crumbsUpToFlow, step.path));

    li.appendChild(btn);
    list.appendChild(li);
  }

  group.appendChild(list);
  return group;
}
