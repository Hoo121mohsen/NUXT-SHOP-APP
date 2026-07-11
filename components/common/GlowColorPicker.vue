<template>
  <div>
    <label class="mb-2 block text-sm font-medium text-stone-700 dark:text-stone-300">
      رنگ حلقه دور عکس (اختیاری)
    </label>
    <div class="flex flex-wrap gap-2">
      <!-- گزینه «بدون نور» -->
      <button
        type="button"
        class="flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs text-stone-400"
        :class="!modelValue ? 'border-brand-600' : 'border-stone-300 dark:border-stone-600'"
        title="بدون حلقه رنگی"
        @click="$emit('update:modelValue', '')"
      >
        ✕
      </button>

      <button
        v-for="color in GLOW_COLORS"
        :key="color"
        type="button"
        class="h-8 w-8 rounded-full border-2 transition"
        :class="modelValue === color ? 'border-stone-800 dark:border-white' : 'border-transparent'"
        :style="{ backgroundColor: color, boxShadow: modelValue === color ? `0 0 10px ${color}` : 'none' }"
        :title="color"
        @click="$emit('update:modelValue', color)"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' }
})
defineEmits(['update:modelValue'])

// ۲۰ رنگ نور هالوژنی/ویترینی برای پس‌زمینه آیکون دسته‌بندی
const GLOW_COLORS = [
  '#FFF4D6', '#FFE8B0', '#FFD700', '#FFB300', '#FF9500',
  '#FF6B35', '#FF3B30', '#FF2D95', '#E91E8C', '#C026D3',
  '#8B5CF6', '#7C3AED', '#6366F1', '#3B82F6', '#0EA5E9',
  '#06B6D4', '#14B8A6', '#10B981', '#84CC16', '#EAB308'
]
</script>
