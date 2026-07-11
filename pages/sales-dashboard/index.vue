<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-stone-800 dark:text-stone-100">داشبورد مدیر فروش</h1>
      <button class="text-sm text-stone-500 hover:text-red-600" @click="handleLogout">خروج</button>
    </div>

    <!-- نوار جستجو -->
    <div class="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
      <input
        v-model="search"
        type="text"
        placeholder="جستجو بر اساس کد یکتا یا نام مشتری..."
        class="w-64 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      />
      <span class="text-xs text-stone-400">{{ filtered.length }} سفارش</span>
    </div>

    <SkeletonTable v-if="loading" :rows="6" :columns="5" :with-image="false" />
    <OrdersAccordion
      v-else
      :orders="filtered"
      mode="sales"
      @update-order-status="handleUpdateOrderStatus"
      @update-vendor-status="handleUpdateVendorStatus"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useOrdersStore } from '~/stores/orders'
import SkeletonTable from '~/components/common/SkeletonTable.vue'
import OrdersAccordion from '~/components/dashboard/OrdersAccordion.vue'

useSeoMeta({ title: 'داشبورد مدیر فروش' })

const authStore = useAuthStore()
const ordersStore = useOrdersStore()
const router = useRouter()
const loading = ref(true)
const search = ref('')
let unsubscribe = null

async function loadOrders() {
  await ordersStore.fetchOrdersWithItems()
  loading.value = false
}

onMounted(async () => {
  await loadOrders()
  unsubscribe = ordersStore.subscribeToVendorStatusChanges(() => loadOrders())
})
onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return ordersStore.orders
  return ordersStore.orders.filter(
    (o) => o.order_number?.toLowerCase().includes(term) || o.full_name?.toLowerCase().includes(term)
  )
})

async function handleUpdateOrderStatus(orderId, status) {
  await ordersStore.updateStatus(orderId, status)
  await loadOrders()
}
async function handleUpdateVendorStatus(orderId, vendorId, status) {
  await ordersStore.updateVendorStatus(orderId, vendorId, status)
  await loadOrders()
}

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}
</script>
