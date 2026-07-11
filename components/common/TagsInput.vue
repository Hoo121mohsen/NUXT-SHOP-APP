<template>
  <!-- ورودی برچسب‌ها (تگ) برای سئو - با Enter یا کاما تگ جدید اضافه می‌شود -->
  <div>
    <label class="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">{{ label }}</label>
    <div class="flex flex-wrap gap-2 rounded-lg border border-stone-300 bg-white p-2 dark:border-stone-600 dark:bg-stone-800">
      <span
        v-for="(tag, idx) in modelValue"
        :key="idx"
        class="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
      >
        {{ tag }}
        <button type="button" @click="removeTag(idx)" class="text-brand-400 hover:text-brand-700">✕</button>
      </span>
      <input
        v-model="draft"
        type="text"
        placeholder="تگ را بنویسید و Enter بزنید"
        class="min-w-[140px] flex-1 border-none bg-transparent text-sm focus:outline-none dark:text-stone-100"
        @keydown.enter.prevent="addTag"
        @keydown.,.prevent="addTag"
      />
    </div>
    <p class="mt-1 text-xs text-stone-400">این تگ‌ها به بهبود سئو و جستجوی محصول کمک می‌کنند.</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  label: { type: String, default: 'برچسب‌های سئو (Tags)' }
})
const emit = defineEmits(['update:modelValue'])
const draft = ref('')

function addTag() {
  const value = draft.value.trim()
  if (value && !props.modelValue.includes(value)) {
    emit('update:modelValue', [...props.modelValue, value])
  }
  draft.value = ''
}

function removeTag(idx) {
  const copy = [...props.modelValue]
  copy.splice(idx, 1)
  emit('update:modelValue', copy)
}
</script>
