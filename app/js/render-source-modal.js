// Small reusable modal: shown when a user clicks a "Sourced (n)" note on any
// listCard item. Links straight to each source's own citation/url rather than
// detouring through the sources page — see plan doc item 9a/10 UX decision.
let activeCleanup = null;

export function openSourceModal(data, itemName, sourceIds) {
  closeSourceModal();

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");

  const heading = document.createElement("h3");
  heading.className = "modal__heading";
  heading.textContent = `Sources for ${itemName}`;
  modal.appendChild(heading);

  const list = document.createElement("div");
  list.className = "modal__source-list";

  for (const sourceId of sourceIds) {
    const source = data.sources?.[sourceId];
    if (!source) continue;

    const entry = document.createElement("div");
    entry.className = "modal__source-entry";

    const name = document.createElement("div");
    name.className = "item-name";
    name.textContent = source.name;
    entry.appendChild(name);

    if (source.citation) {
      const citation = document.createElement("div");
      citation.className = "item-meta";
      citation.textContent = source.citation;
      entry.appendChild(citation);
    }

    if (source.note) {
      const note = document.createElement("div");
      note.className = "item-meta";
      note.textContent = source.note;
      entry.appendChild(note);
    }

    if (source.url) {
      const link = document.createElement("a");
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.className = "source-card__link";
      link.textContent = "Read the source ↗";
      entry.appendChild(link);
    }

    list.appendChild(entry);
  }

  modal.appendChild(list);

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "modal__close";
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", closeSourceModal);
  modal.appendChild(closeBtn);

  overlay.appendChild(modal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeSourceModal();
  });

  function onKeydown(e) {
    if (e.key === "Escape") closeSourceModal();
  }
  document.addEventListener("keydown", onKeydown);

  document.body.appendChild(overlay);
  closeBtn.focus();

  activeCleanup = () => {
    document.removeEventListener("keydown", onKeydown);
    overlay.remove();
  };
}

export function closeSourceModal() {
  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }
}
