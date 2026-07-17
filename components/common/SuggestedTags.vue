<template>
  <div v-if="availableSuggestions.length" class="mb-2">
    <p class="mb-1.5 text-xs text-stone-500 dark:text-stone-400">
      🏷️ تگ‌های پیشنهادی این دسته‌بندی (برای افزودن سریع کلیک کنید):
    </p>
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="tag in availableSuggestions"
        :key="tag"
        type="button"
        class="rounded-full border border-dashed border-brand-400 px-3 py-1 text-xs text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/20"
        @click="addTag(tag)"
      >
        + {{ tag }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  suggestions: { type: Array, default: () => [] }, // تگ‌های پیش‌فرض دسته‌بندی انتخاب‌شده
  modelValue: { type: Array, default: () => [] } // تگ‌های فعلی محصول
})
const emit = defineEmits(['update:modelValue'])

// فقط تگ‌هایی که هنوز به محصول اضافه نشده‌اند نمایش داده می‌شوند
const availableSuggestions = computed(() =>
  props.suggestions.filter((t) => !props.modelValue.includes(t))
)

function addTag(tag) {
  emit('update:modelValue', [...props.modelValue, tag])
}
</script>
