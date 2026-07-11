<template>
  <!-- آپلودر تک عکس با پیش‌نمایش گرد - برای عکس دسته‌بندی -->
  <div>
    <label class="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">{{ label }}</label>
    <div class="flex items-center gap-4">
      <div
        class="flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-stone-300 bg-stone-50 dark:border-stone-600 dark:bg-stone-800"
        @click="fileInput.click()"
      >
        <img v-if="modelValue" :src="modelValue" class="h-full w-full object-cover" />
        <span v-else class="text-xs text-stone-400">انتخاب عکس</span>
      </div>
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileSelected" />
      <div>
        <p v-if="uploading" class="text-xs text-brand-600">در حال آپلود...</p>
        <button
          v-if="modelValue"
          type="button"
          class="text-xs text-red-500 hover:underline"
          @click="$emit('update:modelValue', '')"
        >
          حذف عکس
        </button>
      </div>
    </div>
    <p v-if="errorMsg" class="mt-1 text-xs text-red-600">{{ errorMsg }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: 'عکس دسته‌بندی' },
  uploadFn: { type: Function, required: true }
})
const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const uploading = ref(false)
const errorMsg = ref('')

async function onFileSelected(e) {
  const file = e.target.files[0]
  e.target.value = ''
  if (!file) return
  errorMsg.value = ''
  uploading.value = true
  try {
    const url = await props.uploadFn(file)
    emit('update:modelValue', url)
  } catch (err) {
    errorMsg.value = 'خطا در آپلود: ' + err.message
  } finally {
    uploading.value = false
  }
}
</script>
