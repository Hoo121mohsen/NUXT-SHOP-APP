<template>
  <!-- نمایش یک دسته‌بندی: عکس گرد + حلقه‌ی نازک دور آن (مثل استوری اینستاگرام) با رنگ قابل‌انتخاب -->
  <NuxtLink
    :to="{ path: '/', query: { category: category.id } }"
    class="flex w-24 shrink-0 flex-col items-center gap-2 text-center"
  >
    <div class="h-16 w-16 rounded-full p-[3px] sm:h-20 sm:w-20 lg:h-24 lg:w-24" :style="{ background: ringColor }">
      <div class="h-full w-full rounded-full bg-white p-[2.5px] dark:bg-stone-950">
        <div class="h-full w-full overflow-hidden rounded-full">
          <img :src="category.image_url || 'https://placehold.co/100'" class="h-full w-full object-cover" :alt="category.title" />
        </div>
      </div>
    </div>

    <span class="line-clamp-1 text-xs font-bold text-stone-700 sm:text-sm dark:text-stone-200">{{ category.title }}</span>
  </NuxtLink>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  category: { type: Object, required: true }
})

// رنگ حلقه دور عکس (همان "رنگ نور" انتخاب‌شده در پنل مدیریت)؛ اگر انتخاب نشده باشد، رنگ پیش‌فرض برند است
const ringColor = computed(() => props.category.glow_color || '#AEEBCE')
</script>
