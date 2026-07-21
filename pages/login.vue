<template>
  <div class="flex min-h-[70vh] items-center justify-center px-4 py-10">
    <div class="glass-strong w-full max-w-sm rounded-xl p-6 shadow-xl">
      <h1 class="mb-6 text-center text-xl font-bold text-stone-800 dark:text-stone-100">ورود به حساب کاربری</h1>

      <!-- دو حالت ورود: ایمیل / موبایل (فقط اگر ادمین ورود با موبایل را فعال کرده باشد) -->
      <div v-if="siteSettingsStore.smsEnabled" class="mb-5 flex rounded-lg bg-stone-100 p-1 dark:bg-stone-900">
        <button
          type="button"
          class="flex-1 rounded-md py-1.5 text-sm transition"
          :class="mode === 'email' ? 'bg-white text-brand-700 shadow dark:bg-stone-800 dark:text-brand-400' : 'text-stone-500'"
          @click="mode = 'email'"
        >
          ورود با ایمیل
        </button>
        <button
          type="button"
          class="flex-1 rounded-md py-1.5 text-sm transition"
          :class="mode === 'phone' ? 'bg-white text-brand-700 shadow dark:bg-stone-800 dark:text-brand-400' : 'text-stone-500'"
          @click="mode = 'phone'"
        >
          ورود با موبایل
        </button>
      </div>

      <LoginForm v-if="mode === 'email'" />
      <PhoneOtpForm v-else purpose="login" @success="handlePhoneSuccess" />

      <p class="mt-4 text-center text-sm text-stone-500 dark:text-stone-400">
        حساب ندارید؟ <NuxtLink to="/register" class="text-brand-600 hover:underline">ثبت‌نام کنید</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSiteSettingsStore } from '~/stores/siteSettings'
import LoginForm from '~/components/auth/LoginForm.vue'
import PhoneOtpForm from '~/components/auth/PhoneOtpForm.vue'

useSeoMeta({ title: 'ورود' })

const siteSettingsStore = useSiteSettingsStore()
const mode = ref('email')
const router = useRouter()
const route = useRoute()

onMounted(() => {
  siteSettingsStore.fetchPublicSmsStatus()
})

function handlePhoneSuccess() {
  router.push(route.query.redirect || '/')
}
</script>
