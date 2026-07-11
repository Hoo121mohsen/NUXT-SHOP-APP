<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">مدیریت تخفیف‌ها</h1>

    <div class="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
      <span class="text-sm text-stone-600 dark:text-stone-400">
        {{ selectedIds.length }} محصول انتخاب شده
      </span>
      <BaseInput v-model="percentage" type="number" label="" placeholder="درصد تخفیف" class="w-32" />
      <BaseButton :disabled="!selectedIds.length || !percentage" @click="handleApply">اعمال تخفیف</BaseButton>
      <BaseButton variant="secondary" :disabled="!selectedIds.length" @click="handleRemove">حذف تخفیف</BaseButton>
    </div>

    <!-- نوار جستجو و فیلترها -->
    <div class="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
      <input
        v-model="search"
        type="text"
        placeholder="جستجو بر اساس نام یا شناسه محصول..."
        class="w-64 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      />

      <select
        v-model="stockFilter"
        class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      >
        <option value="all">همه موجودی‌ها</option>
        <option value="out">فقط ناموجود (موجودی صفر)</option>
        <option value="low">موجودی کمتر از ...</option>
        <option value="high">موجودی بیشتر از ...</option>
      </select>

      <input
        v-if="stockFilter === 'low'"
        v-model="lowStockThreshold"
        type="number"
        min="1"
        class="w-24 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      />
      <input
        v-if="stockFilter === 'high'"
        v-model="highStockThreshold"
        type="number"
        min="0"
        class="w-24 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      />

      <select
        v-model="vendorId"
        class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      >
        <option value="all">همه فروشنده‌ها</option>
        <option v-for="v in vendorsStore.vendors" :key="v.id" :value="v.id">{{ v.name }}</option>
      </select>

      <select
        v-model="warehouseId"
        class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      >
        <option value="all">همه انبارها</option>
        <option v-for="w in warehousesStore.warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
      </select>

      <span class="text-xs text-stone-400">{{ filtered.length }} محصول</span>
    </div>

    <SkeletonTable v-if="productsStore.loading" :rows="6" :columns="4" />

    <div v-else class="overflow-x-auto rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <table class="w-full text-right text-sm">
        <thead class="border-b border-stone-200 bg-stone-50 text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
          <tr>
            <th class="px-4 py-3">
              <input type="checkbox" @change="toggleAll($event.target.checked)" />
            </th>
            <th class="px-4 py-3">شناسه</th>
            <th class="px-4 py-3">تصویر</th>
            <th class="px-4 py-3">عنوان</th>
            <th class="px-4 py-3">فروشنده</th>
            <th class="px-4 py-3">انبار</th>
            <th class="px-4 py-3">موجودی</th>
            <th class="px-4 py-3">قیمت فروش</th>
            <th class="px-4 py-3">تخفیف فعلی</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in paginated" :key="p.id" class="border-b border-stone-100 last:border-0 dark:border-stone-700">
            <td class="px-4 py-3">
              <input type="checkbox" :value="p.id" v-model="selectedIds" />
            </td>
            <td class="px-4 py-3 text-xs text-stone-400">{{ p.id.slice(0, 8) }}</td>
            <td class="px-4 py-3"><img :src="getCoverImage(p)" class="h-12 w-12 rounded-lg object-cover" /></td>
            <td class="px-4 py-3 text-stone-800 dark:text-stone-100">{{ p.title }}</td>
            <td class="px-4 py-3 text-stone-600 dark:text-stone-400">{{ p.vendors?.name || '—' }}</td>
            <td class="px-4 py-3 text-stone-600 dark:text-stone-400">{{ p.warehouses?.name || '—' }}</td>
            <td class="px-4 py-3" :class="p.stock_quantity > 0 ? 'text-brand-600' : 'text-red-500'">
              {{ p.stock_quantity > 0 ? p.stock_quantity : 'ناموجود' }}
            </td>
            <td class="px-4 py-3 text-stone-600 dark:text-stone-400">{{ formatToman(p.sale_price) }}</td>
            <td class="px-4 py-3">
              <span v-if="p.discount_percentage > 0" class="rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
                {{ p.discount_percentage }}٪
              </span>
              <span v-else class="text-stone-300">—</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!filtered.length" class="p-6 text-center text-stone-500">محصولی با این فیلتر یافت نشد.</p>
    </div>

    <Pagination :current-page="currentPage" :total-pages="totalPages" @prev="prev" @next="next" @go-to="goTo" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '~/stores/products'
import { useVendorsStore } from '~/stores/vendors'
import { useWarehousesStore } from '~/stores/warehouses'
import BaseInput from '~/components/common/BaseInput.vue'
import BaseButton from '~/components/common/BaseButton.vue'
import SkeletonTable from '~/components/common/SkeletonTable.vue'
import Pagination from '~/components/common/Pagination.vue'
import { getCoverImage, formatToman } from '~/composables/useProductHelpers'
import { useProductFilters } from '~/composables/useProductFilters'
import { usePagination } from '~/composables/usePagination'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'مدیریت تخفیف‌ها' })

const productsStore = useProductsStore()
const vendorsStore = useVendorsStore()
const warehousesStore = useWarehousesStore()
const selectedIds = ref([])
const percentage = ref('')

// جستجو بر اساس نام/شناسه + فیلتر موجودی (کمتر/بیشتر از عدد دلخواه) + فروشنده + انبار
const productsRef = computed(() => productsStore.products)
const {
  search,
  stockFilter,
  lowStockThreshold,
  highStockThreshold,
  vendorId,
  warehouseId,
  filtered
} = useProductFilters(productsRef)

// صفحه‌بندی روی نتیجه فیلترشده - «انتخاب همه» همچنان کل filtered (همه صفحات) را انتخاب می‌کند
const { currentPage, totalPages, paginated, goTo, next, prev } = usePagination(filtered, 10)

onMounted(() => {
  productsStore.fetchProducts()
  vendorsStore.fetchVendors()
  warehousesStore.fetchWarehouses()
})

// دکمه "انتخاب همه" فقط روی محصولاتی که با فیلتر فعلی مطابقت دارند عمل می‌کند (همه صفحات)
function toggleAll(checked) {
  selectedIds.value = checked ? filtered.value.map((p) => p.id) : []
}

async function handleApply() {
  await productsStore.applyDiscount(selectedIds.value, Number(percentage.value))
  await productsStore.fetchProducts()
  percentage.value = ''
  selectedIds.value = []
}

async function handleRemove() {
  await productsStore.removeDiscount(selectedIds.value)
  await productsStore.fetchProducts()
  selectedIds.value = []
}
</script>
