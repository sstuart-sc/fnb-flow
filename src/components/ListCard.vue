<script setup>
import ItemCard from "./ItemCard.vue";

const props = defineProps({
  title: { type: String, required: true },
  items: { type: Array, required: true },
  mapFn: { type: Function, required: true },
  detailCollection: { type: String, default: null },
});
</script>

<template>
  <div class="detail-card">
    <h4>{{ title }}</h4>
    <p v-if="!items.length" class="empty-note">None at this depth.</p>
    <ul v-else>
      <ItemCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        :name="mapFn(item)"
        :detail-collection="detailCollection"
      />
    </ul>
  </div>
</template>
