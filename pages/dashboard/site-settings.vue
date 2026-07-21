<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">تنظیمات سایت</h1>

    <div class="max-w-xl space-y-6 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
      <div>
        <h2 class="mb-1 text-lg font-semibold text-stone-800 dark:text-stone-100">ورود/ثبت‌نام با موبایل (پیامک)</h2>
        <p class="mb-3 text-xs text-stone-500 dark:text-stone-400">
          اگر هنوز پنل پیامک تهیه نکرده‌اید، این گزینه را غیرفعال نگه دارید تا گزینه «ورود/ثبت‌نام با موبایل» به کاربران نمایش داده نشود.
        </p>
        <label class="flex items-center gap-2">
          <input v-model="form.is_enabled" type="checkbox" class="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500" />
          <span class="text-sm text-stone-700 dark:text-stone-300">فعال‌سازی ورود/ثبت‌نام با موبایل</span>
        </label>
      </div>

      <template v-if="form.is_enabled">
        <div>
          <label class="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">سرویس‌دهنده پیامک</label>
          <select v-model="form.provider" class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100">
            <option value="kavenegar">کاوه‌نگار (Kavenegar)</option>
            <option value="melipayamak">ملی‌پیامک (MeliPayamak)</option>
            <option value="custom">سرویس دیگر (آدرس سفارشی)</option>
          </select>
        </div>

        <BaseInput v-model="form.api_key" label="کلید API / توکن پنل پیامک" />
        <BaseInput v-model="form.sender_line" label="شماره خط ارسال‌کننده (در صورت نیاز)" />
        <BaseInput v-if="form.provider === 'custom'" v-model="form.api_endpoint" label="آدرس API سرویس پیامکی" />

        <p class="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          💡 این کلیدها فقط توسط Edge Function های <code>send-otp</code> / <code>verify-otp</code> (سمت سرور Supabase) استفاده می‌شوند و برای پیاده‌سازی/استقرار این توابع به فایل <code>supabase/functions/send-otp/index.ts</code> در پروژه مراجعه کنید.
        </p>
      </template>

      <p v-if="successMsg" class="text-sm text-green-600">{{ successMsg }}</p>
      <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>
      <BaseButton :loading="saving" @click="handleSave">ذخیره تنظیمات</BaseButton>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useSiteSettingsStore } from '~/stores/siteSettings'
import BaseInput from '~/components/common/BaseInput.vue'
import BaseButton from '~/components/common/BaseButton.vue'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'تنظیمات سایت' })

const siteSettingsStore = useSiteSettingsStore()

const form = reactive({
  is_enabled: false,
  provider: 'kavenegar',
  api_key: '',
  sender_line: '',
  api_endpoint: ''
})
const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

onMounted(async () => {
  const s = await siteSettingsStore.fetchFullSmsSettings()
  Object.assign(form, s)
})

async function handleSave() {
  successMsg.value = ''
  errorMsg.value = ''
  saving.value = true
  try {
    await siteSettingsStore.updateSmsSettings(form)
    successMsg.value = 'تنظیمات با موفقیت ذخیره شد.'
  } catch (e) {
    errorMsg.value = 'خطا: ' + e.message
  } finally {
    saving.value = false
  }
}
</script>
