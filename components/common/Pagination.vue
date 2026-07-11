<template>
  <!-- کنترل‌های صفحه‌بندی مشترک -->
  <div v-if="totalPages > 1" class="mt-6 flex items-center justify-center gap-2">
    <button
      class="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50 disabled:opacity-40 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
      :disabled="currentPage === 1"
      @click="$emit('prev')"
    >
      ›
    </button>

    <button
      v-for="page in pagesToShow"
      :key="page"
      class="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
      :class="page === currentPage
        ? 'bg-brand-600 text-white'
        : 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800'"
      @click="$emit('go-to', page)"
    >
      {{ page }}
    </button>

    <button
      class="flex h-8 w-8 items-center justify-center rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50 disabled:opacity-40 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
      :disabled="currentPage === totalPages"
      @click="$emit('next')"
    >
      ‹
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true }
})
defineEmits(['prev', 'next', 'go-to'])

// حداکثر ۵ شماره صفحه نمایش داده می‌شود (اطراف صفحه فعلی)
const pagesToShow = computed(() => {
  const total = props.totalPages
  const current = props.currentPage
  const windowSize = 5
  let start = Math.max(1, current - Math.floor(windowSize / 2))
  let end = Math.min(total, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)
  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
</script>
