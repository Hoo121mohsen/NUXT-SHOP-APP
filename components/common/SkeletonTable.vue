<template>
  <div class="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
    <div v-for="r in rows" :key="r" class="flex items-center gap-4 border-b border-stone-100 p-4 last:border-0 dark:border-stone-700">
      <div v-if="withImage" class="skeleton h-10 w-10 shrink-0 rounded-lg"></div>
      <SkeletonBox v-for="c in columns" :key="c" height="0.85rem" :width="colWidth" />
    </div>
  </div>
</template>

<script setup>
import SkeletonBox from './SkeletonBox.vue'
defineProps({
  rows: { type: Number, default: 6 },
  columns: { type: Number, default: 4 },
  colWidth: { type: String, default: '12%' },
  withImage: { type: Boolean, default: true }
})
</script>
