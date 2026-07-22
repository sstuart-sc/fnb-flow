import { reactive } from "vue";

// Shared modal state so any component (ItemCard, related chips inside the
// detail modal itself) can open/close the detail modal without prop drilling.
export const modalState = reactive({
  detail: null, // { collectionName, item }
});

export function openDetailModal(collectionName, item) {
  modalState.detail = { collectionName, item };
}

export function closeDetailModal() {
  modalState.detail = null;
}
