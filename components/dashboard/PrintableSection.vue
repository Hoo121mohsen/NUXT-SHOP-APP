<template>
  <div>
    <!-- نوار ابزار چاپ (در پرینت مخفی می‌شود) -->
    <div class="print-hidden mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-700 dark:bg-stone-800">
      <span class="text-xs text-stone-500 dark:text-stone-400">🖨 پیش‌نمایش چاپ این گزارش پایین صفحه آماده است</span>
      <div class="flex items-center gap-2">
        <select v-model="pageSize" class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100">
          <option value="A4">اندازه چاپ: A4</option>
          <option value="A5">اندازه چاپ: A5</option>
        </select>
        <BaseButton variant="secondary" @click="printNow">🖨 چاپ</BaseButton>
        <BaseButton @click="downloadPdf(elementId, `${fileName || title}.pdf`)">⬇ دانلود PDF</BaseButton>
      </div>
    </div>

    <!-- ناحیه قابل چاپ -->
    <div
      :id="elementId"
      class="mx-auto rounded-xl border border-stone-200 bg-white p-6 text-stone-800 dark:border-stone-700 dark:bg-white dark:text-stone-800"
      :style="{ maxWidth: pageSize === 'A5' ? '148mm' : '210mm' }"
    >
      <div class="mb-4 border-b pb-3">
        <p v-if="taxSettingsStore.settings.company_name" class="text-xs text-stone-500">{{ taxSettingsStore.settings.company_name }}</p>
        <h1 class="text-lg font-bold">{{ title }}</h1>
        <p v-if="subtitle" class="mt-1 text-xs text-stone-500">{{ subtitle }}</p>
        <p class="mt-1 text-xs text-stone-400">تاریخ تهیه گزارش: {{ toJalaliDate(new Date()) }}</p>
      </div>

      <slot />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import BaseButton from '../common/BaseButton.vue'
import { useTaxSettingsStore } from '~/stores/taxSettings'
import { toJalaliDate } from '~/composables/useJalaliDate'
import { usePrintInvoice } from '~/composables/usePrintInvoice'

const props = defineProps({
  title: { type: String, required: true },      // عنوان استاندارد گزارش (شامل بازه/نوع فیلتر توسط صفحه ساخته می‌شود)
  subtitle: { type: String, default: '' },        // توضیح فیلترهای اعمال‌شده
  elementId: { type: String, required: true },     // شناسه یکتای ناحیه چاپ (برای PDF)
  fileName: { type: String, default: '' }
})

const taxSettingsStore = useTaxSettingsStore()
const { pageSize, printNow, downloadPdf } = usePrintInvoice()

onMounted(() => {
  if (!taxSettingsStore.loaded) taxSettingsStore.fetchSettings()
})
</script>
