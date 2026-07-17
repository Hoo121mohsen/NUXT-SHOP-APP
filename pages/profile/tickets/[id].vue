<template>
  <div class="mx-auto max-w-2xl px-4 py-8">
    <NuxtLink to="/profile/tickets" class="mb-4 inline-block text-sm text-brand-600 hover:underline">← بازگشت به لیست تیکت‌ها</NuxtLink>

    <div v-if="ticket" class="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <div class="border-b border-stone-200 p-4 dark:border-stone-700">
        <h1 class="text-lg font-bold text-stone-800 dark:text-stone-100">{{ ticket.subject }}</h1>
        <span class="mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium" :class="ticket.status === 'open' ? 'bg-brand-50 text-brand-700' : 'bg-stone-100 text-stone-500'">
          {{ ticket.status === 'open' ? 'باز' : 'بسته‌شده' }}
        </span>
      </div>

      <div class="max-h-96 space-y-3 overflow-y-auto p-4">
        <div
          v-for="m in ticket.ticket_messages"
          :key="m.id"
          class="max-w-[80%] rounded-xl p-3 text-sm"
          :class="m.sender_role === 'customer' ? 'mr-auto bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-200' : 'ml-auto bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-200'"
        >
          <p>{{ m.message }}</p>
          <p class="mt-1 text-[10px] opacity-60">{{ toJalaliDateTime(m.created_at) }}</p>
        </div>
      </div>

      <form v-if="ticket.status === 'open'" @submit.prevent="handleSend" class="flex gap-2 border-t border-stone-200 p-4 dark:border-stone-700">
        <input v-model="newMessage" type="text" placeholder="پیام خود را بنویسید..." class="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100" />
        <BaseButton type="submit" :loading="sending">ارسال</BaseButton>
      </form>
      <p v-else class="p-4 text-center text-xs text-stone-400">این تیکت بسته شده است.</p>
    </div>

    <p v-else-if="!loading" class="text-stone-500">تیکت یافت نشد.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useTicketsStore } from '~/stores/tickets'
import BaseButton from '~/components/common/BaseButton.vue'
import { toJalaliDateTime } from '~/composables/useJalaliDate'

useSeoMeta({ title: 'مکالمه تیکت' })

const route = useRoute()
const authStore = useAuthStore()
const ticketsStore = useTicketsStore()

const ticket = ref(null)
const loading = ref(true)
const newMessage = ref('')
const sending = ref(false)

async function loadTicket() {
  const supabase = useSupabase()
  const { data } = await supabase
    .from('tickets')
    .select('*, ticket_messages(*)')
    .eq('id', route.params.id)
    .single()
  ticket.value = data
  loading.value = false
}

onMounted(async () => {
  await authStore.fetchUser()
  await loadTicket()
})

async function handleSend() {
  if (!newMessage.value.trim() || !authStore.user) return
  sending.value = true
  try {
    await ticketsStore.sendMessage(ticket.value.id, 'customer', authStore.user.id, newMessage.value.trim())
    newMessage.value = ''
    await loadTicket()
  } finally {
    sending.value = false
  }
}
</script>
