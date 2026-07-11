<template>
  <!-- با هاور روی نام محصول، عکس کاور آن به‌صورت شناور نمایش داده می‌شود -->
  <span class="group relative inline-block cursor-default">
    {{ title }}
    <span
      v-if="image"
      class="pointer-events-none absolute bottom-full right-0 z-30 mb-2 hidden overflow-hidden rounded-lg border border-stone-200 bg-white shadow-lg group-hover:block dark:border-stone-600 dark:bg-stone-800"
    >
      <img :src="image" class="h-24 w-24 object-cover" />
    </span>
  </span>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  image: { type: String, default: '' }
})
</script>
