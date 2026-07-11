<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">مدیریت سفارش‌ها</h1>

    <!-- نوار جستجو و فیلترها -->
    <div class="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
      <input
        v-model="search"
        type="text"
        placeholder="جستجو بر اساس کد یکتا یا نام مشتری..."
        class="w-64 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      />

      <select
        v-model="statusFilter"
        class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      >
        <option value="all">همه وضعیت‌ها</option>
        <option v-for="s in ORDER_STATUSES" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>

      <JalaliDateRangeFilter v-model="dateRange" />

      <div class="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
        مبلغ از
        <input v-model="amountMin" type="number" placeholder="حداقل" class="w-24 rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100" />
        تا
        <input v-model="amountMax" type="number" placeholder="حداکثر" class="w-24 rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100" />
      </div>

      <span class="text-xs text-stone-400">{{ filtered.length }} سفارش</span>
    </div>

    <SkeletonTable v-if="loading" :rows="6" :columns="5" :with-image="false" />

    <template v-else>
      <OrdersAccordion
        :orders="paginated"
        mode="admin"
        @update-order-status="handleUpdateOrderStatus"
        @update-vendor-status="handleUpdateVendorStatus"
      />
      <Pagination :current-page="currentPage" :total-pages="totalPages" @prev="prev" @next="next" @go-to="goTo" />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useOrdersStore, ORDER_STATUSES } from '~/stores/orders'
import SkeletonTable from '~/components/common/SkeletonTable.vue'
import Pagination from '~/components/common/Pagination.vue'
import JalaliDateRangeFilter from '~/components/common/JalaliDateRangeFilter.vue'
import OrdersAccordion from '~/components/dashboard/OrdersAccordion.vue'
import { usePagination } from '~/composables/usePagination'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'مدیریت سفارش‌ها' })

const ordersStore = useOrdersStore()
const loading = ref(true)
let unsubscribe = null

const search = ref('')
const statusFilter = ref('all')
const dateRange = ref({ from: null, to: null })
const amountMin = ref('')
const amountMax = ref('')

async function loadOrders() {
  await ordersStore.fetchOrdersWithItems()
  loading.value = false
}

onMounted(async () => {
  await loadOrders()
  // بازتاب لحظه‌ای تغییر وضعیت فروشنده (وقتی تامین‌کننده در پنل خودش وضعیت را عوض می‌کند)
  unsubscribe = ordersStore.subscribeToVendorStatusChanges(() => loadOrders())
})
onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  return ordersStore.orders.filter((o) => {
    const matchesSearch =
      !term ||
      o.order_number?.toLowerCase().includes(term) ||
      o.full_name?.toLowerCase().includes(term)

    const matchesStatus = statusFilter.value === 'all' || o.status === statusFilter.value

    const orderDate = new Date(o.created_at)
    const matchesFrom = !dateRange.value.from || orderDate >= new Date(dateRange.value.from)
    const matchesTo = !dateRange.value.to || orderDate <= new Date(dateRange.value.to + 'T23:59:59')

    const amount = Number(o.total_price)
    const matchesMin = amountMin.value === '' || amount >= Number(amountMin.value)
    const matchesMax = amountMax.value === '' || amount <= Number(amountMax.value)

    return matchesSearch && matchesStatus && matchesFrom && matchesTo && matchesMin && matchesMax
  })
})

const { currentPage, totalPages, paginated, goTo, next, prev } = usePagination(filtered, 10)

async function handleUpdateOrderStatus(orderId, status) {
  await ordersStore.updateStatus(orderId, status)
  await loadOrders()
}
async function handleUpdateVendorStatus(orderId, vendorId, status) {
  await ordersStore.updateVendorStatus(orderId, vendorId, status)
  await loadOrders()
}
</script>
