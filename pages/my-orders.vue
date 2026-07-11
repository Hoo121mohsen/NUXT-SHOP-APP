<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <h1 class="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">سفارش‌های من</h1>

    <SkeletonList v-if="loading" :rows="3" />
    <p v-else-if="!orders.length" class="text-stone-500">هنوز سفارشی ثبت نکرده‌اید.</p>

    <div v-else class="space-y-3">
      <div
        v-for="o in orders"
        :key="o.id"
        class="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800"
      >
        <div>
          <p class="font-mono text-sm text-stone-500 dark:text-stone-400">{{ o.order_number }}</p>
          <p class="mt-1 text-sm text-stone-800 dark:text-stone-100">{{ formatToman(o.total_price) }} تومان</p>
          <p class="text-xs text-stone-400">{{ toJalaliDate(o.created_at) }}</p>
        </div>
        <span class="rounded-md px-2 py-1 text-xs font-medium" :class="orderStatusColor(o.status)">
          {{ orderStatusLabel(o.status) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useOrdersStore, orderStatusLabel, orderStatusColor } from '~/stores/orders'
import SkeletonList from '~/components/common/SkeletonList.vue'
import { formatToman } from '~/composables/useProductHelpers'
import { toJalaliDate } from '~/composables/useJalaliDate'

useSeoMeta({ title: 'سفارش‌های من' })

const authStore = useAuthStore()
const ordersStore = useOrdersStore()
const orders = ref([])
const loading = ref(true)

onMounted(async () => {
  await authStore.fetchUser()
  if (authStore.user) {
    orders.value = await ordersStore.fetchUserOrders(authStore.user.id)
  }
  loading.value = false
})
</script>
