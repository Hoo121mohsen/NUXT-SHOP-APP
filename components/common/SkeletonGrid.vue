<template>
  <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
    <SkeletonProductCard v-for="i in count" :key="i" />
  </div>
</template>

<script setup>
import SkeletonProductCard from './SkeletonProductCard.vue'
defineProps({
  count: { type: Number, default: 8 }
})
</script>
