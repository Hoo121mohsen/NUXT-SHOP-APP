<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">تنظیمات مالیاتی</h1>
    <p class="mb-4 text-xs text-stone-500 dark:text-stone-400">
      این اطلاعات روی فاکتورهای رسمی فروش و خرید (برای ارائه به بازرسان سازمان امور مالیاتی) درج می‌شود.
    </p>

    <form @submit.prevent="handleSubmit" class="max-w-xl space-y-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
      <BaseInput v-model.number="form.vat_rate" label="نرخ مالیات بر ارزش افزوده (٪)" type="number" step="0.5" required />
      <BaseInput v-model="form.company_name" label="نام کامل حقوقی فروشگاه/شرکت" required />
      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model="form.economic_code" label="شماره اقتصادی" required />
        <BaseInput v-model="form.national_id" label="شناسه ملی" required />
      </div>
      <BaseInput v-model="form.address" label="نشانی قانونی" />
      <BaseInput v-model="form.phone" label="تلفن" />

      <p v-if="successMsg" class="text-sm text-green-600">{{ successMsg }}</p>
      <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>
      <BaseButton type="submit" :loading="saving">ذخیره تنظیمات</BaseButton>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useTaxSettingsStore } from '~/stores/taxSettings'
import BaseInput from '~/components/common/BaseInput.vue'
import BaseButton from '~/components/common/BaseButton.vue'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'تنظیمات مالیاتی' })

const taxSettingsStore = useTaxSettingsStore()

const form = reactive({
  vat_rate: 9,
  company_name: '',
  economic_code: '',
  national_id: '',
  address: '',
  phone: ''
})
const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

onMounted(async () => {
  const s = await taxSettingsStore.fetchSettings()
  Object.assign(form, s)
})

async function handleSubmit() {
  errorMsg.value = ''
  successMsg.value = ''
  saving.value = true
  try {
    await taxSettingsStore.updateSettings(form)
    successMsg.value = 'تنظیمات با موفقیت ذخیره شد.'
  } catch (e) {
    errorMsg.value = 'خطا: ' + e.message
  } finally {
    saving.value = false
  }
}
</script>
