<template>
  <!-- ورودی قیمت: عدد را با جداکننده هزارگان نمایش می‌دهد، مقدار واقعی خام به بیرون ارسال می‌شود -->
  <div class="w-full">
    <label class="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">{{ label }}</label>
    <input
      :value="formatted"
      type="text"
      inputmode="numeric"
      dir="ltr"
      class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-left text-sm text-stone-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
      @input="onInput"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const formatted = computed(() => {
  if (props.modelValue === '' || props.modelValue === null || props.modelValue === undefined) return ''
  return Number(props.modelValue).toLocaleString('en-US')
})

function onInput(e) {
  const digitsOnly = e.target.value.replace(/[^\d]/g, '')
  emit('update:modelValue', digitsOnly ? Number(digitsOnly) : '')
}
</script>
