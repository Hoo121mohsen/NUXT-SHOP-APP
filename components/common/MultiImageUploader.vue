<template>
  <!-- آپلودر عکس چندگانه با سقف تعداد مشخص (مثلا ۷ عکس برای محصول) -->
  <div>
    <label class="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">
      {{ label }} ({{ modelValue.length }}/{{ maxFiles }})
    </label>

    <div
      v-if="modelValue.length < maxFiles"
      class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 p-6 text-center hover:border-brand-400 dark:border-stone-600"
      @click="fileInput.click()"
      @dragover.prevent
      @drop.prevent="onDrop"
    >
      <p class="text-sm text-stone-500 dark:text-stone-400">
        عکس را اینجا رها کنید یا کلیک کنید<br />
        (حداکثر {{ maxFiles }} عکس)
      </p>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        :multiple="maxFiles > 1"
        class="hidden"
        @change="onFilesSelected"
      />
    </div>

    <p v-if="uploading" class="mt-2 text-xs text-brand-600">در حال آپلود...</p>

    <div v-if="modelValue.length" class="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
      <div v-for="(url, idx) in modelValue" :key="url" class="group relative overflow-hidden rounded-lg border dark:border-stone-700">
        <img :src="url" class="h-20 w-full object-cover" />
        <span v-if="idx === 0" class="absolute right-1 top-1 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] text-white">کاور</span>
        <button
          type="button"
          @click="removeAt(idx)"
          class="absolute left-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100"
        >
          حذف
        </button>
      </div>
    </div>

    <p v-if="errorMsg" class="mt-1 text-xs text-red-600">{{ errorMsg }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  label: { type: String, default: 'عکس‌ها' },
  maxFiles: { type: Number, default: 7 },
  uploadFn: { type: Function, required: true } // تابعی که فایل را آپلود کرده و URL برمی‌گرداند
})
const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const uploading = ref(false)
const errorMsg = ref('')

async function handleFiles(fileList) {
  errorMsg.value = ''
  const remaining = props.maxFiles - props.modelValue.length
  const files = Array.from(fileList).slice(0, remaining)
  if (!files.length) return

  uploading.value = true
  const newUrls = []
  try {
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        errorMsg.value = `فایل «${file.name}» بیشتر از ۱۰ مگابایت است.`
        continue
      }
      const url = await props.uploadFn(file)
      newUrls.push(url)
    }
    emit('update:modelValue', [...props.modelValue, ...newUrls])
  } catch (e) {
    errorMsg.value = 'خطا در آپلود: ' + e.message
  } finally {
    uploading.value = false
  }
}

function onFilesSelected(e) {
  handleFiles(e.target.files)
  e.target.value = ''
}
function onDrop(e) {
  handleFiles(e.dataTransfer.files)
}
function removeAt(idx) {
  const copy = [...props.modelValue]
  copy.splice(idx, 1)
  emit('update:modelValue', copy)
}
</script>
