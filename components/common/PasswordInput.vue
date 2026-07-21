<template>
  <div class="w-full">
    <label v-if="label" class="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">{{ label }}</label>
    <div class="relative">
      <input
        :type="visible ? 'text' : 'password'"
        :value="modelValue"
        :required="required"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', $event.target.value)"
        class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 pl-10 text-sm text-stone-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
      />
      <button
        type="button"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
        :title="visible ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'"
        @click="visible = !visible"
      >
        <i :class="visible ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false }
})
defineEmits(['update:modelValue'])

const visible = ref(false)
</script>
