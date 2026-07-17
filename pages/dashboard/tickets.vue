<template>
  <div class="mx-auto flex max-w-5xl gap-6 px-4 py-8">
    <!-- لیست تیکت‌ها -->
    <div class="w-72 shrink-0">
      <h1 class="mb-4 text-xl font-bold text-stone-800 dark:text-stone-100">پیام‌های پشتیبانی</h1>
      <select v-model="statusFilter" class="mb-3 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100">
        <option value="all">همه</option>
        <option value="open">باز</option>
        <option value="closed">بسته‌شده</option>
      </select>

      <SkeletonList v-if="ticketsStore.loading" :rows="4" :with-image="false" />
      <div v-else class="space-y-2">
        <button
          v-for="t in filtered"
          :key="t.id"
          class="block w-full rounded-lg border p-3 text-right text-sm"
          :class="selectedId === t.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800'"
          @click="selectTicket(t.id)"
        >
          <p class="font-medium text-stone-800 dark:text-stone-100">{{ t.subject }}</p>
          <p class="text-xs text-stone-400">{{ t.profiles?.email || '' }}</p>
          <span class="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px]" :class="t.status === 'open' ? 'bg-brand-100 text-brand-700' : 'bg-stone-100 text-stone-500'">
            {{ t.status === 'open' ? 'باز' : 'بسته' }}
          </span>
        </button>
        <p v-if="!filtered.length" class="text-center text-sm text-stone-400">تیکتی یافت نشد.</p>
      </div>
    </div>

    <!-- مکالمه -->
    <div class="flex-1">
      <div v-if="selectedTicket" class="rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
        <div class="flex items-center justify-between border-b border-stone-200 p-4 dark:border-stone-700">
          <div>
            <h2 class="font-bold text-stone-800 dark:text-stone-100">{{ selectedTicket.subject }}</h2>
            <p class="text-xs text-stone-400">{{ selectedTicket.profiles?.email }}</p>
          </div>
          <button
            class="text-xs text-stone-500 hover:underline"
            @click="toggleStatus"
          >
            {{ selectedTicket.status === 'open' ? 'بستن تیکت' : 'بازگشایی تیکت' }}
          </button>
        </div>

        <div class="max-h-96 space-y-3 overflow-y-auto p-4">
          <div
            v-for="m in selectedTicket.ticket_messages"
            :key="m.id"
            class="max-w-[80%] rounded-xl p-3 text-sm"
            :class="m.sender_role === 'admin' ? 'mr-auto bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-200' : 'ml-auto bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-200'"
          >
            <p>{{ m.message }}</p>
            <p class="mt-1 text-[10px] opacity-60">{{ toJalaliDateTime(m.created_at) }}</p>
          </div>
        </div>

        <form v-if="selectedTicket.status === 'open'" @submit.prevent="handleReply" class="flex gap-2 border-t border-stone-200 p-4 dark:border-stone-700">
          <input v-model="replyMessage" type="text" placeholder="پاسخ خود را بنویسید..." class="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100" />
          <BaseButton type="submit" :loading="sending">ارسال</BaseButton>
        </form>
      </div>
      <p v-else class="text-stone-500">یک تیکت را از لیست انتخاب کنید.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useTicketsStore } from '~/stores/tickets'
import BaseButton from '~/components/common/BaseButton.vue'
import SkeletonList from '~/components/common/SkeletonList.vue'
import { toJalaliDateTime } from '~/composables/useJalaliDate'

useSeoMeta({ title: 'مدیریت تیکت‌ها' })

const authStore = useAuthStore()
const ticketsStore = useTicketsStore()

const statusFilter = ref('open')
const selectedId = ref(null)
const replyMessage = ref('')
const sending = ref(false)

onMounted(async () => {
  await authStore.fetchUser()
  await ticketsStore.fetchAll()
})

const filtered = computed(() => {
  if (statusFilter.value === 'all') return ticketsStore.tickets
  return ticketsStore.tickets.filter((t) => t.status === statusFilter.value)
})

const selectedTicket = computed(() => ticketsStore.tickets.find((t) => t.id === selectedId.value))

function selectTicket(id) {
  selectedId.value = id
}

async function handleReply() {
  if (!replyMessage.value.trim() || !selectedTicket.value) return
  sending.value = true
  try {
    await ticketsStore.sendMessage(selectedTicket.value.id, 'admin', authStore.user?.id, replyMessage.value.trim())
    replyMessage.value = ''
    await ticketsStore.fetchAll()
  } finally {
    sending.value = false
  }
}

async function toggleStatus() {
  const newStatus = selectedTicket.value.status === 'open' ? 'closed' : 'open'
  await ticketsStore.updateStatus(selectedTicket.value.id, newStatus)
  await ticketsStore.fetchAll()
}
</script>
