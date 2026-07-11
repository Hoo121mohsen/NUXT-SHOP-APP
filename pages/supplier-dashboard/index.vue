<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-stone-800 dark:text-stone-100">داشبورد تامین‌کننده</h1>
      <button class="text-sm text-stone-500 hover:text-red-600" @click="handleLogout">خروج</button>
    </div>

    <p v-if="!loading && myVendors.length" class="mb-4 text-sm text-stone-500 dark:text-stone-400">
      فروشنده(های) شما:
      <span v-for="v in myVendors" :key="v.id" class="mr-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">{{ v.name }}</span>
    </p>

    <SkeletonTable v-if="loading" :rows="6" :columns="5" :with-image="false" />

    <template v-else-if="myVendorIds.length">
      <OrdersAccordion
        :orders="orders"
        mode="supplier"
        :supplier-vendor-ids="myVendorIds"
        @update-vendor-status="handleUpdateVendorStatus"
      />
    </template>

    <p v-else class="text-stone-500">هنوز هیچ فروشنده‌ای به حساب شما متصل نشده است. با ادمین تماس بگیرید.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useOrdersStore } from '~/stores/orders'
import { useVendorSuppliersStore } from '~/stores/vendorSuppliers'
import { useVendorsStore } from '~/stores/vendors'
import SkeletonTable from '~/components/common/SkeletonTable.vue'
import OrdersAccordion from '~/components/dashboard/OrdersAccordion.vue'

useSeoMeta({ title: 'داشبورد تامین‌کننده' })

const authStore = useAuthStore()
const ordersStore = useOrdersStore()
const vendorSuppliersStore = useVendorSuppliersStore()
const vendorsStore = useVendorsStore()
const router = useRouter()

const loading = ref(true)
const orders = ref([])
const myVendorIds = ref([])
const myVendors = ref([])
let unsubscribe = null

async function loadOrders() {
  orders.value = await ordersStore.fetchOrdersForSupplier(myVendorIds.value)
}

onMounted(async () => {
  await authStore.fetchUser()
  if (authStore.user) {
    myVendorIds.value = await vendorSuppliersStore.fetchVendorIdsForUser(authStore.user.id)
    await vendorsStore.fetchVendors()
    myVendors.value = vendorsStore.vendors.filter((v) => myVendorIds.value.includes(v.id))
    if (myVendorIds.value.length) await loadOrders()
  }
  loading.value = false
  unsubscribe = ordersStore.subscribeToVendorStatusChanges(() => loadOrders())
})
onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})

async function handleUpdateVendorStatus(orderId, vendorId, status) {
  await ordersStore.updateVendorStatus(orderId, vendorId, status)
  await loadOrders()
}

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}
</script>
