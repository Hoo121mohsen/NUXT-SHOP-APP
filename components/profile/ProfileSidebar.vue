<template>
  <aside class="glass w-full shrink-0 rounded-xl p-4 sm:w-56">
    <div class="mb-4 flex flex-col items-center gap-2 border-b border-stone-200 pb-4 dark:border-stone-700">
      <img
        v-if="authStore.profile?.avatar_url"
        :src="authStore.profile.avatar_url"
        class="h-16 w-16 rounded-full object-cover"
      />
      <i v-else class="fa-solid fa-circle-user text-6xl text-stone-400"></i>
      <p class="text-sm font-medium text-stone-800 dark:text-stone-100">
        {{ authStore.profile?.display_name || authStore.user?.email }}
      </p>
    </div>

    <nav class="flex flex-col gap-1">
      <NuxtLink to="/profile" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">👤 پروفایل من</NuxtLink>
      <NuxtLink to="/my-orders" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">🛒 سفارش‌های من</NuxtLink>
      <NuxtLink to="/profile/comments" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">💬 نظرات من</NuxtLink>
      <NuxtLink to="/profile/tickets" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">🎫 پیام‌ها و پشتیبانی</NuxtLink>
      <NuxtLink to="/profile/notifications" class="rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-brand-50 dark:text-stone-200 dark:hover:bg-stone-800">🔔 اعلان‌ها</NuxtLink>
      <button class="mt-2 rounded-lg px-3 py-2 text-right text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" @click="handleLogout">🚪 خروج از حساب</button>
    </nav>
  </aside>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}
</script>
