<template>
  <span class="skeleton block rounded-md" :class="rounded" :style="{ width, height }"></span>
</template>

<script setup>
defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '1rem' },
  rounded: { type: String, default: 'rounded-md' }
})
</script>
