import { stepsForFlow, displayFlowName } from "./data.js";
import { goToStep } from "./router.js";
import { renderNodeRow } from "./render-node.js";

export function renderFlowView(container, data, crumbs, flowId) {
  const flow = data.flows[flowId];
  container.innerHTML = "";

  if (!flow) {
    container.innerHTML = `<p class="empty-state">Flow "${flowId}" not found.</p>`;
    return;
  }

  const title = document.createElement("h2");
  title.className = "flow-view__title";
  title.textContent = displayFlowName(flow);
  container.appendChild(title);

  const summary = document.createElement("p");
  summary.className = "flow-view__summary";
  summary.textContent = flow.summary;
  container.appendChild(summary);

  const steps = stepsForFlow(data, flowId);
  container.appendChild(
    renderNodeRow(data, steps, null, "full", (step) => goToStep(crumbs, step.path))
  );
}
