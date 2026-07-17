<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:flex-row">
    <ProfileSidebar />

    <div class="flex-1">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-stone-800 dark:text-stone-100">اعلان‌ها</h1>
        <button v-if="notificationsStore.unreadCount" class="text-sm text-brand-600 hover:underline" @click="markAll">
          علامت‌گذاری همه به‌عنوان خوانده‌شده
        </button>
      </div>

      <SkeletonList v-if="notificationsStore.loading" :rows="4" :with-image="false" />
      <p v-else-if="!notificationsStore.items.length" class="text-stone-500">اعلانی وجود ندارد.</p>

      <div v-else class="space-y-2">
        <NuxtLink
          v-for="n in notificationsStore.items"
          :key="n.id"
          :to="n.product_id ? `/products/${n.product_id}` : '/my-orders'"
          class="block rounded-xl border p-4 text-sm"
          :class="!n.is_read ? 'border-brand-200 bg-brand-50 dark:border-brand-900 dark:bg-brand-900/20' : 'border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800'"
          @click="!n.is_read && notificationsStore.markAsRead(n.id)"
        >
          <p class="font-medium text-stone-800 dark:text-stone-100">{{ n.title }}</p>
          <p class="mt-1 text-stone-600 dark:text-stone-400">{{ n.body }}</p>
          <p class="mt-2 text-xs text-stone-400">{{ toJalaliDate(n.created_at) }}</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useNotificationsStore } from '~/stores/notifications'
import ProfileSidebar from '~/components/profile/ProfileSidebar.vue'
import SkeletonList from '~/components/common/SkeletonList.vue'
import { toJalaliDate } from '~/composables/useJalaliDate'

useSeoMeta({ title: 'اعلان‌ها' })

const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()

onMounted(async () => {
  await authStore.fetchUser()
  if (authStore.user) await notificationsStore.fetchForUser(authStore.user.id)
})

async function markAll() {
  if (authStore.user) await notificationsStore.markAllAsRead(authStore.user.id)
}
</script>
