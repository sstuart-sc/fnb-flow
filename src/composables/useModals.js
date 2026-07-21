import { reactive } from "vue";

// Shared modal state so any component (ItemCard, related chips inside the
// detail modal itself) can open/close either modal without prop drilling.
export const modalState = reactive({
  detail: null, // { collectionName, item }
  source: null, // { itemName, sourceIds }
});

export function openDetailModal(collectionName, item) {
  modalState.source = null;
  modalState.detail = { collectionName, item };
}

export function closeDetailModal() {
  modalState.detail = null;
}

export function openSourceModal(itemName, sourceIds) {
  modalState.source = { itemName, sourceIds };
}

export function closeSourceModal() {
  modalState.source = null;
}
