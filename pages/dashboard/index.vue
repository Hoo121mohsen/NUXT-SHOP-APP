<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">نمای کلی</h1>
    <div class="grid gap-4 sm:grid-cols-5">
      <div class="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
        <p class="text-sm text-stone-500 dark:text-stone-400">تعداد محصولات</p>
        <p class="mt-1 text-2xl font-bold text-stone-800 dark:text-stone-100">{{ productsStore.products.length }}</p>
      </div>
      <div class="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
        <p class="text-sm text-stone-500 dark:text-stone-400">تعداد دسته‌بندی‌ها</p>
        <p class="mt-1 text-2xl font-bold text-stone-800 dark:text-stone-100">{{ categoriesStore.categories.length }}</p>
      </div>
      <div class="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
        <p class="text-sm text-stone-500 dark:text-stone-400">تعداد سفارش‌ها</p>
        <p class="mt-1 text-2xl font-bold text-stone-800 dark:text-stone-100">{{ ordersCount }}</p>
      </div>
      <div class="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
        <p class="text-sm text-stone-500 dark:text-stone-400">درآمد کل (تومان)</p>
        <p class="mt-1 text-2xl font-bold text-stone-800 dark:text-stone-100">{{ formatToman(totalRevenue) }}</p>
      </div>
      <div class="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
        <p class="text-sm text-stone-500 dark:text-stone-400">بازدید کلی سایت</p>
        <p class="mt-1 text-2xl font-bold text-stone-800 dark:text-stone-100">{{ analyticsStore.overallVisits.toLocaleString('fa-IR') }}</p>
      </div>
    </div>

    <!-- گزارش پربازدیدترین محصولات -->
    <div class="mt-8">
      <h2 class="mb-4 text-lg font-semibold text-stone-800 dark:text-stone-100">پربازدیدترین محصولات</h2>
      <SkeletonTable v-if="analyticsStore.loading" :rows="4" :columns="3" />
      <p v-else-if="!analyticsStore.topProducts.length" class="text-sm text-stone-500">
        هنوز آماری از بازدید محصولات ثبت نشده است.
      </p>
      <div v-else class="overflow-x-auto rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
        <table class="w-full text-right text-sm">
          <thead class="border-b border-stone-200 bg-stone-50 text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
            <tr>
              <th class="px-4 py-3">تصویر</th>
              <th class="px-4 py-3">عنوان محصول</th>
              <th class="px-4 py-3">تعداد بازدید</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in analyticsStore.topProducts" :key="p.id" class="border-b border-stone-100 last:border-0 dark:border-stone-700">
              <td class="px-4 py-3"><img :src="getCoverImage(p)" class="h-10 w-10 rounded-lg object-cover" /></td>
              <td class="px-4 py-3 text-stone-800 dark:text-stone-100">{{ p.title }}</td>
              <td class="px-4 py-3 font-medium text-brand-600 dark:text-brand-400">{{ p.viewCount }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductsStore } from '~/stores/products'
import { useCategoriesStore } from '~/stores/categories'
import { useAnalyticsStore } from '~/stores/analytics'
import SkeletonTable from '~/components/common/SkeletonTable.vue'
import { formatToman, getCoverImage } from '~/composables/useProductHelpers'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'داشبورد مدیریت' })

const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()
const analyticsStore = useAnalyticsStore()
const ordersCount = ref(0)
const totalRevenue = ref(0)

onMounted(async () => {
  await productsStore.fetchProducts()
  await categoriesStore.fetchCategories()
  await analyticsStore.fetchOverallVisits()
  await analyticsStore.fetchTopProducts(5)

  const supabase = useSupabase()
  const { data } = await supabase.from('orders').select('total_price')
  if (data) {
    ordersCount.value = data.length
    totalRevenue.value = data.reduce((sum, o) => sum + Number(o.total_price), 0)
  }
})
</script>
