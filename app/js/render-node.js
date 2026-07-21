// Shared step-node rendering used by the primary flow view, the inline
// nested-flow preview on a step page, and the persistent tree panel — one
// place owns the badge/thread-chip markup so the three call sites can't drift.

const THREAD_KEY_ORDER = ["sanitation", "traceability", "recall", "allergen-control"];

// Short forms of each thread's full name, sized for a small card chip rather
// than the full-length chip used on the step detail page.
const THREAD_SHORT_LABEL = {
  sanitation: "Sanitation",
  traceability: "Traceability",
  recall: "Recall",
  "allergen-control": "Allergen",
};

// size: "full" (flow view) | "compact" (inline preview / tree panel)
export function renderStepNode(data, step, isActive, size, onClick) {
  const btn = document.createElement("button");
  btn.className = `flow-node flow-node--${size}`;
  if (isActive) btn.classList.add("flow-node--active");
  btn.type = "button";

  const seq = document.createElement("span");
  seq.className = "flow-node__seq";
  seq.textContent = size === "full" ? `Step ${step.sequence}` : String(step.sequence).padStart(2, "0");
  btn.appendChild(seq);

  const name = document.createElement("span");
  name.className = "flow-node__name";
  name.textContent = step.name;
  btn.appendChild(name);

  if (step.threadIds?.length) {
    const stepThreadKeys = new Set(step.threadIds.map((tid) => data.threads[tid]?.key).filter(Boolean));
    const threads = document.createElement("span");
    threads.className = "flow-node__threads";
    for (const key of THREAD_KEY_ORDER) {
      if (stepThreadKeys.has(key)) {
        const chip = document.createElement("span");
        chip.className = `thread-mini-chip thread-mini-chip--${key}`;
        chip.textContent = THREAD_SHORT_LABEL[key];
        threads.appendChild(chip);
      }
    }
    btn.appendChild(threads);
  }

  btn.addEventListener("click", onClick);
  return btn;
}

export function renderNodeRow(data, steps, activeStepId, size, onNodeClick) {
  const wrap = document.createElement("div");
  wrap.className = size === "full" ? "flow-nodes" : "flow-nodes flow-nodes--compact";

  steps.forEach((step, i) => {
    wrap.appendChild(renderStepNode(data, step, step.id === activeStepId, size, () => onNodeClick(step)));
    if (i < steps.length - 1) {
      const connector = document.createElement("span");
      connector.className = "flow-connector";
      connector.textContent = "→";
      connector.setAttribute("aria-hidden", "true");
      wrap.appendChild(connector);
    }
  });

  return wrap;
}
