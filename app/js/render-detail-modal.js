// Reusable detail modal for artifacts/materials/systems: shown when a card in
// render-step.js's concrete-layer grid is clicked. Distinct from
// render-source-modal.js (which lists an item's sources) — this shows the
// item's own description/example/fields/relatedIds content. Related-item
// chips re-open this same modal on the related record rather than navigating.
let activeCleanup = null;

const COLLECTION_LABEL = {
  artifacts: "Artifact",
  materials: "Material & Equipment",
  systems: "System",
  regulations: "Regulation",
};

export function openDetailModal(data, collectionName, item) {
  closeDetailModal();

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "modal modal--detail";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");

  const kicker = document.createElement("div");
  kicker.className = "modal__kicker";
  kicker.textContent = COLLECTION_LABEL[collectionName] || collectionName;
  modal.appendChild(kicker);

  const heading = document.createElement("h3");
  heading.className = "modal__heading";
  heading.textContent = item.name;
  modal.appendChild(heading);

  const description = item.description || item.lifecycle || item.notes || item.summary;
  if (description) {
    const p = document.createElement("p");
    p.className = "modal__description";
    p.textContent = description;
    modal.appendChild(p);
  }

  if (item.fields?.length) {
    const section = document.createElement("div");
    section.className = "modal__section";
    const h4 = document.createElement("h4");
    h4.textContent = "Fields";
    section.appendChild(h4);
    const table = document.createElement("table");
    table.className = "modal__fields-table";
    for (const field of item.fields) {
      const row = document.createElement("tr");
      const nameCell = document.createElement("td");
      nameCell.className = "modal__fields-table-name";
      nameCell.textContent = field.name;
      const descCell = document.createElement("td");
      descCell.textContent = field.description;
      row.appendChild(nameCell);
      row.appendChild(descCell);
      table.appendChild(row);
    }
    section.appendChild(table);
    modal.appendChild(section);
  }

  if (item.relatedIds?.length) {
    const section = document.createElement("div");
    section.className = "modal__section";
    const h4 = document.createElement("h4");
    h4.textContent = "Related";
    section.appendChild(h4);
    const chips = document.createElement("div");
    chips.className = "modal__related-chips";
    for (const relatedId of item.relatedIds) {
      const related = findRelated(data, relatedId);
      if (!related) continue;
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "related-chip";
      chip.textContent = related.item.name;
      chip.addEventListener("click", () => openDetailModal(data, related.collection, related.item));
      chips.appendChild(chip);
    }
    section.appendChild(chips);
    modal.appendChild(section);
  }

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "modal__close";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", closeDetailModal);
  modal.appendChild(closeBtn);

  overlay.appendChild(modal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeDetailModal();
  });

  function onKeydown(e) {
    if (e.key === "Escape") closeDetailModal();
  }
  document.addEventListener("keydown", onKeydown);

  document.body.appendChild(overlay);
  closeBtn.focus();

  activeCleanup = () => {
    document.removeEventListener("keydown", onKeydown);
    overlay.remove();
  };
}

export function closeDetailModal() {
  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }
}

function findRelated(data, id) {
  for (const collection of ["artifacts", "materials", "systems", "regulations"]) {
    const item = data[collection]?.[id];
    if (item) return { collection, item };
  }
  return null;
}
