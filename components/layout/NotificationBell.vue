<template>
  <div class="relative">
    <button class="relative text-xl" @click="toggleOpen">
      <i class="fa-regular fa-bell"></i>
      <span
        v-if="notificationsStore.unreadCount"
        class="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white"
      >
        {{ notificationsStore.unreadCount > 9 ? '۹+' : notificationsStore.unreadCount }}
      </span>
    </button>

    <Teleport to="body">
      <div v-if="open" class="fixed inset-0 z-40" @click="open = false" />
    </Teleport>

    <div
      v-if="open"
      class="glass-strong absolute left-0 top-full z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-xl p-2 shadow-2xl"
    >
      <div class="mb-1 flex items-center justify-between px-2 py-1">
        <span class="text-sm font-semibold text-stone-800 dark:text-stone-100">اعلان‌ها</span>
        <button v-if="notificationsStore.unreadCount" class="text-xs text-brand-600 hover:underline" @click="markAll">
          علامت‌گذاری همه به‌عنوان خوانده‌شده
        </button>
      </div>

      <div v-if="!notificationsStore.items.length" class="p-4 text-center text-xs text-stone-400">اعلانی وجود ندارد.</div>

      <NuxtLink
        v-for="n in notificationsStore.items"
        :key="n.id"
        :to="notifLink(n)"
        class="block rounded-lg px-2 py-2 text-xs hover:bg-stone-100 dark:hover:bg-stone-800"
        :class="!n.is_read ? 'bg-brand-50 dark:bg-brand-900/20' : ''"
        @click="handleClick(n)"
      >
        <p class="font-medium text-stone-800 dark:text-stone-100">{{ n.title }}</p>
        <p class="mt-0.5 text-stone-500 dark:text-stone-400">{{ n.body }}</p>
        <p class="mt-1 text-[10px] text-stone-400">{{ toJalaliDate(n.created_at) }}</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useNotificationsStore } from '~/stores/notifications'
import { toJalaliDate } from '~/composables/useJalaliDate'

const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()
const open = ref(false)

onMounted(async () => {
  if (authStore.user) {
    await notificationsStore.fetchForUser(authStore.user.id)
  }
})

async function toggleOpen() {
  open.value = !open.value
  if (open.value && authStore.user) {
    await notificationsStore.fetchForUser(authStore.user.id)
  }
}

async function markAll() {
  if (authStore.user) await notificationsStore.markAllAsRead(authStore.user.id)
}

function handleClick(n) {
  if (!n.is_read) notificationsStore.markAsRead(n.id)
  open.value = false
}

function notifLink(n) {
  if (n.product_id) return `/products/${n.product_id}`
  if (n.order_id) return `/track-order`
  return '/profile/notifications'
}
</script>
