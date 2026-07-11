<template>
  <div class="w-full">
    <label v-if="label" class="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">{{ label }}</label>
    <textarea
      :value="modelValue"
      :rows="rows"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
    ></textarea>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  rows: { type: Number, default: 4 }
})
defineEmits(['update:modelValue'])
</script>
