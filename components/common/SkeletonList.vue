<template>
  <div class="space-y-3">
    <div
      v-for="i in rows"
      :key="i"
      class="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800"
    >
      <div v-if="withImage" class="skeleton h-12 w-12 shrink-0 rounded-lg"></div>
      <div class="flex-1 space-y-2">
        <SkeletonBox height="0.9rem" width="50%" />
        <SkeletonBox height="0.75rem" width="30%" />
      </div>
      <SkeletonBox height="1.5rem" width="4rem" rounded="rounded-full" />
    </div>
  </div>
</template>

<script setup>
import SkeletonBox from './SkeletonBox.vue'
defineProps({
  rows: { type: Number, default: 5 },
  withImage: { type: Boolean, default: true }
})
</script>
