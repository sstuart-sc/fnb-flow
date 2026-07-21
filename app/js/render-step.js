import { resolveList, stepsForFlow, displayFlowName } from "./data.js";
import { goToStep } from "./router.js";
import { renderNodeRow } from "./render-node.js";
import { openSourceModal } from "./render-source-modal.js";

export function renderStepView(container, data, crumbs, stepId) {
  const step = data.steps[stepId];
  container.innerHTML = "";

  if (!step) {
    container.innerHTML = `<p class="empty-state">Step "${stepId}" not found.</p>`;
    return;
  }

  const header = document.createElement("div");
  header.className = "step-detail__header";
  const title = document.createElement("h2");
  title.className = "step-detail__title";
  title.textContent = step.name;
  header.appendChild(title);
  container.appendChild(header);

  const summary = document.createElement("p");
  summary.className = "step-detail__summary";
  summary.textContent = step.summary;
  container.appendChild(summary);

  if (step.threadIds?.length) {
    const chips = document.createElement("div");
    chips.className = "thread-chips";
    for (const tid of step.threadIds) {
      const thread = data.threads[tid];
      if (!thread) continue;
      const chip = document.createElement("span");
      chip.className = `thread-chip thread-chip--${thread.key}`;
      chip.textContent = thread.name;
      chips.appendChild(chip);
    }
    container.appendChild(chips);
  }

  if (step.nestedFlowId) {
    const nestedFlow = data.flows[step.nestedFlowId];
    const preview = document.createElement("div");
    preview.className = "nested-flow-preview";

    const heading = document.createElement("h3");
    heading.className = "nested-flow-preview__heading";
    heading.textContent = nestedFlow ? displayFlowName(nestedFlow) : "Nested flow";
    preview.appendChild(heading);

    const nestedSteps = stepsForFlow(data, step.nestedFlowId);
    const nestedCrumbs = [...crumbs, { type: "flow", flowPath: nestedFlow.path }];
    preview.appendChild(
      renderNodeRow(data, nestedSteps, null, "compact", (childStep) =>
        goToStep(nestedCrumbs, childStep.path)
      )
    );

    container.appendChild(preview);
  }

  // Conceptual layer — always present
  const conceptGrid = document.createElement("div");
  conceptGrid.className = "detail-grid";
  conceptGrid.appendChild(
    listCard(data, "Regulations", resolveList(data, "regulations", step.regulationIds), (r) => ({
      name: r.name,
      meta: [r.citation, r.year].filter(Boolean).join(" · "),
    }))
  );
  conceptGrid.appendChild(
    listCard(data, "Agencies", resolveList(data, "agencies", step.agencyIds), (a) => ({
      name: a.name,
      meta: a.fullName,
    }))
  );
  conceptGrid.appendChild(
    listCard(data, "Roles", resolveList(data, "roles", step.roleIds), (r) => ({
      name: r.name,
      meta: r.summary,
    }))
  );
  container.appendChild(conceptGrid);

  // Concrete layer — only present on nested-flow steps. Gaps are tracked in
  // the JSON data for internal use but aren't user-facing, so they don't
  // factor into whether this section renders.
  const hasConcrete =
    step.artifactIds?.length || step.materialIds?.length || step.systemIds?.length;

  if (hasConcrete) {
    const concreteHeading = document.createElement("h3");
    concreteHeading.textContent = "Implementation Detail";
    concreteHeading.style.marginTop = "1.75rem";
    container.appendChild(concreteHeading);

    const concreteGrid = document.createElement("div");
    concreteGrid.className = "detail-grid";
    concreteGrid.appendChild(
      listCard(data, "Artifacts", resolveList(data, "artifacts", step.artifactIds), (a) => ({
        name: a.name,
        meta: [a.format, a.lifecycle].filter(Boolean).join(" — "),
      }))
    );
    concreteGrid.appendChild(
      listCard(data, "Materials & Equipment", resolveList(data, "materials", step.materialIds), (m) => ({
        name: m.name,
        meta: m.notes,
      }))
    );
    concreteGrid.appendChild(
      listCard(data, "Systems", resolveList(data, "systems", step.systemIds), (s) => ({
        name: s.name,
        meta: s.examplePlatforms?.length ? `e.g. ${s.examplePlatforms.slice(0, 3).join(", ")}` : s.summary,
      }))
    );
    container.appendChild(concreteGrid);
  }

}

function listCard(data, title, items, mapFn) {
  const card = document.createElement("div");
  card.className = "detail-card";
  const h4 = document.createElement("h4");
  h4.textContent = title;
  card.appendChild(h4);

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "empty-note";
    empty.textContent = "None at this depth.";
    card.appendChild(empty);
    return card;
  }

  const ul = document.createElement("ul");
  for (const item of items) {
    const { name, meta } = mapFn(item);
    const li = document.createElement("li");
    const nameEl = document.createElement("div");
    nameEl.className = "item-name";
    nameEl.textContent = name;
    li.appendChild(nameEl);
    if (meta) {
      const metaEl = document.createElement("div");
      metaEl.className = "item-meta";
      metaEl.textContent = meta;
      li.appendChild(metaEl);
    }
    if (item.sourceIds?.length) {
      li.appendChild(sourceNote(data, name, item.sourceIds));
    }
    ul.appendChild(li);
  }
  card.appendChild(ul);
  return card;
}

// Clicking opens a modal listing this item's sources, each linking straight
// to its own citation/url — see plan doc item 9a/10 UX decision (modal links
// out directly rather than detouring through the sources page).
function sourceNote(data, itemName, sourceIds) {
  const note = document.createElement("button");
  note.type = "button";
  note.className = "item-source-note item-source-note--button";
  note.textContent = `Sourced (${sourceIds.length})`;
  note.addEventListener("click", () => openSourceModal(data, itemName, sourceIds));
  return note;
}
