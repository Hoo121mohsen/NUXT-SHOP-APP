<template>
  <div class="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
    <div class="skeleton aspect-square w-full"></div>
    <div class="space-y-2 p-3">
      <SkeletonBox height="0.85rem" width="90%" />
      <SkeletonBox height="0.85rem" width="60%" />
      <div class="flex items-center justify-between pt-1">
        <SkeletonBox height="1rem" width="40%" />
        <SkeletonBox height="1.25rem" width="25%" rounded="rounded-full" />
      </div>
    </div>
  </div>
</template>

<script setup>
import SkeletonBox from './SkeletonBox.vue'
</script>
