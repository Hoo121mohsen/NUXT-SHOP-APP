<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:flex-row">
    <ProfileSidebar />

    <div class="flex-1">
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-stone-800 dark:text-stone-100">پیام‌ها و پشتیبانی</h1>
        <BaseButton @click="showForm = !showForm">{{ showForm ? 'بستن' : '+ تیکت جدید' }}</BaseButton>
      </div>

      <form v-if="showForm" @submit.prevent="handleCreate" class="mb-6 space-y-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
        <BaseInput v-model="subject" label="موضوع" required />
        <BaseTextarea v-model="firstMessage" label="پیام شما" :rows="3" required />
        <BaseButton type="submit" :loading="saving">ارسال تیکت</BaseButton>
      </form>

      <SkeletonList v-if="ticketsStore.loading" :rows="4" :with-image="false" />
      <p v-else-if="!ticketsStore.tickets.length" class="text-stone-500">هنوز تیکتی ثبت نکرده‌اید.</p>

      <div v-else class="space-y-2">
        <NuxtLink
          v-for="t in ticketsStore.tickets"
          :key="t.id"
          :to="`/profile/tickets/${t.id}`"
          class="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800"
        >
          <div>
            <p class="text-sm font-medium text-stone-800 dark:text-stone-100">{{ t.subject }}</p>
            <p class="text-xs text-stone-400">{{ toJalaliDate(t.created_at) }} — {{ t.ticket_messages?.length || 0 }} پیام</p>
          </div>
          <span class="rounded-full px-2 py-0.5 text-[11px] font-medium" :class="t.status === 'open' ? 'bg-brand-50 text-brand-700' : 'bg-stone-100 text-stone-500'">
            {{ t.status === 'open' ? 'باز' : 'بسته‌شده' }}
          </span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useTicketsStore } from '~/stores/tickets'
import ProfileSidebar from '~/components/profile/ProfileSidebar.vue'
import BaseInput from '~/components/common/BaseInput.vue'
import BaseTextarea from '~/components/common/BaseTextarea.vue'
import BaseButton from '~/components/common/BaseButton.vue'
import SkeletonList from '~/components/common/SkeletonList.vue'
import { toJalaliDate } from '~/composables/useJalaliDate'

useSeoMeta({ title: 'پیام‌ها و پشتیبانی' })

const authStore = useAuthStore()
const ticketsStore = useTicketsStore()

const showForm = ref(false)
const subject = ref('')
const firstMessage = ref('')
const saving = ref(false)

onMounted(async () => {
  await authStore.fetchUser()
  if (authStore.user) await ticketsStore.fetchForUser(authStore.user.id)
})

async function handleCreate() {
  if (!authStore.user) return
  saving.value = true
  try {
    await ticketsStore.createTicket(authStore.user.id, subject.value, firstMessage.value)
    subject.value = ''
    firstMessage.value = ''
    showForm.value = false
    await ticketsStore.fetchForUser(authStore.user.id)
  } finally {
    saving.value = false
  }
}
</script>
