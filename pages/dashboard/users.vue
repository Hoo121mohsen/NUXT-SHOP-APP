<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">مدیریت کاربران و دسترسی‌ها</h1>

    <div class="mb-4 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
      <input
        v-model="search"
        type="text"
        placeholder="جستجو بر اساس ایمیل..."
        class="w-72 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      />
    </div>

    <SkeletonTable v-if="usersStore.loading" :rows="6" :columns="3" :with-image="false" />

    <div v-else class="space-y-3">
      <div
        v-for="u in filtered"
        :key="u.id"
        class="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-sm font-medium text-stone-800 dark:text-stone-100">{{ u.email }}</p>
            <p class="text-xs text-stone-400">عضویت: {{ toJalaliDate(u.created_at) }}</p>
          </div>

          <select
            :value="u.role"
            class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
            @change="handleRoleChange(u, $event.target.value)"
          >
            <option value="customer">مشتری (بدون دسترسی پنل)</option>
            <option value="admin">ادمین (دسترسی کامل)</option>
            <option value="sales_manager">مدیر فروش</option>
            <option value="supplier">تامین‌کننده</option>
          </select>
        </div>

        <!-- اتصال فروشنده(ها) به کاربر تامین‌کننده -->
        <div v-if="u.role === 'supplier'" class="mt-3 border-t border-stone-100 pt-3 dark:border-stone-700">
          <p class="mb-2 text-xs text-stone-500 dark:text-stone-400">فروشنده‌های متصل به این تامین‌کننده:</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="link in vendorSuppliersStore.linksForUser(u.id)"
              :key="link.id"
              class="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
            >
              {{ link.vendors?.name }}
              <button type="button" class="text-brand-400 hover:text-red-600" @click="removeVendor(u.id, link.vendor_id)">✕</button>
            </span>

            <select
              class="rounded-full border border-dashed border-stone-300 bg-transparent px-3 py-1 text-xs text-stone-500 dark:border-stone-600 dark:text-stone-400"
              @change="addVendor(u.id, $event.target.value); $event.target.value = ''"
            >
              <option value="">+ افزودن فروشنده</option>
              <option v-for="v in availableVendors(u.id)" :key="v.id" :value="v.id">{{ v.name }}</option>
            </select>
          </div>
        </div>
      </div>

      <p v-if="!filtered.length" class="p-6 text-center text-stone-500">کاربری یافت نشد.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUsersStore } from '~/stores/users'
import { useVendorSuppliersStore } from '~/stores/vendorSuppliers'
import { useVendorsStore } from '~/stores/vendors'
import SkeletonTable from '~/components/common/SkeletonTable.vue'
import { toJalaliDate } from '~/composables/useJalaliDate'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'مدیریت کاربران' })

const usersStore = useUsersStore()
const vendorSuppliersStore = useVendorSuppliersStore()
const vendorsStore = useVendorsStore()

const search = ref('')

onMounted(async () => {
  await usersStore.fetchUsers()
  await vendorSuppliersStore.fetchAll()
  await vendorsStore.fetchVendors()
})

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return usersStore.users
  return usersStore.users.filter((u) => u.email?.toLowerCase().includes(term))
})

async function handleRoleChange(user, role) {
  await usersStore.updateRole(user.id, role)
}

function availableVendors(userId) {
  const linkedIds = vendorSuppliersStore.linksForUser(userId).map((l) => l.vendor_id)
  return vendorsStore.vendors.filter((v) => !linkedIds.includes(v.id))
}

async function addVendor(userId, vendorId) {
  if (!vendorId) return
  await vendorSuppliersStore.assignVendor(userId, vendorId)
}
async function removeVendor(userId, vendorId) {
  await vendorSuppliersStore.removeVendor(userId, vendorId)
}
</script>
