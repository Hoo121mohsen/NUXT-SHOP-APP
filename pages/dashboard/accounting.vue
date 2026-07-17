<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">حسابداری</h1>

    <div class="mb-8 grid gap-4 sm:grid-cols-3">
      <div class="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
        <p class="text-sm text-stone-500 dark:text-stone-400">دارایی اولیه (تعریف محصول)</p>
        <p class="mt-1 text-xl font-bold text-brand-600 dark:text-brand-400">{{ formatRial(accountingStore.totals.assets) }} ریال</p>
      </div>
      <div class="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
        <p class="text-sm text-stone-500 dark:text-stone-400">بدهی (فاکتورهای خرید)</p>
        <p class="mt-1 text-xl font-bold text-red-600 dark:text-red-400">{{ formatRial(accountingStore.totals.liabilities) }} ریال</p>
      </div>
      <div class="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
        <p class="text-sm text-stone-500 dark:text-stone-400">درآمد فروش</p>
        <p class="mt-1 text-xl font-bold text-accent">{{ formatRial(accountingStore.totals.revenue) }} ریال</p>
      </div>
    </div>

    <!-- نوار فیلترها -->
    <div class="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
      <input
        v-model="customerSearch"
        type="text"
        placeholder="جستجو بر اساس نام مشتری..."
        class="w-52 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      />
      <input
        v-model="productSearch"
        type="text"
        placeholder="جستجو بر اساس نام/شناسه محصول..."
        class="w-52 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      />

      <select v-model="typeFilter" class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100">
        <option value="all">همه انواع سند</option>
        <option value="liability_purchase">فقط فاکتورهای خرید</option>
        <option value="revenue_sale">فقط فاکتورهای فروش</option>
        <option value="asset_initial">فقط دارایی اولیه</option>
      </select>

      <select v-model="vendorFilter" class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100">
        <option value="all">همه فروشنده‌ها</option>
        <option v-for="v in vendorsStore.vendors" :key="v.id" :value="v.id">{{ v.name }}</option>
      </select>

      <JalaliDateRangeFilter v-model="dateRange" />

      <span class="text-xs text-stone-400">{{ filtered.length }} سند</span>
    </div>

    <h2 class="mb-4 text-lg font-semibold text-stone-800 dark:text-stone-100">دفتر حسابداری</h2>
    <SkeletonTable v-if="accountingStore.loading" :rows="6" :columns="4" :with-image="false" />

    <div v-else class="space-y-2">
      <div
        v-for="e in paginated"
        :key="e.id"
        class="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800"
      >
        <!-- سربرگ آکاردئون -->
        <button type="button" class="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-right hover:bg-stone-50 dark:hover:bg-stone-900/40" @click="toggle(e)">
          <div class="flex items-center gap-3">
            <span class="text-lg text-stone-400">{{ openIds.has(e.id) ? '▾' : '◂' }}</span>
            <span class="text-xs text-stone-500 dark:text-stone-400">{{ toJalaliDate(e.created_at) }}</span>
            <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="entryStyle(e.entry_type)">{{ entryLabel(e.entry_type) }}</span>
            <ProductNameHover v-if="e.products" :title="e.products.title" :image="getCoverImage(e.products)" />
            <span v-else class="text-sm text-stone-700 dark:text-stone-300">{{ e.description }}</span>
          </div>
          <span class="font-medium text-stone-800 dark:text-stone-100">{{ formatRial(e.amount) }} ریال</span>
        </button>

        <!-- جزئیات باز شده -->
        <div v-if="openIds.has(e.id)" class="border-t border-stone-100 p-4 text-sm dark:border-stone-700">
          <SkeletonBox v-if="!details[e.id]" height="4rem" />

          <template v-else>
            <!-- سند بدهی خرید: ریز اقلام فاکتور -->
            <div v-if="details[e.id].kind === 'purchase_invoice' && details[e.id].invoice">
              <p class="mb-2 text-xs text-stone-500 dark:text-stone-400">
                فاکتور خرید شماره {{ details[e.id].invoice.invoice_number }} — فروشنده: {{ details[e.id].invoice.vendors?.name || '—' }}
              </p>
              <div class="overflow-x-auto rounded-lg border border-stone-100 dark:border-stone-700">
                <table class="w-full text-right text-xs">
                  <thead class="bg-stone-50 text-stone-500 dark:bg-stone-900 dark:text-stone-400">
                    <tr>
                      <th class="px-3 py-2">کالا</th>
                      <th class="px-3 py-2">رنگ</th>
                      <th class="px-3 py-2">تعداد</th>
                      <th class="px-3 py-2">قیمت واحد</th>
                      <th class="px-3 py-2">جمع</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in details[e.id].invoice.purchase_invoice_items" :key="item.id" class="border-t border-stone-100 dark:border-stone-700">
                      <td class="px-3 py-2"><ProductNameHover :title="item.products?.title || '—'" :image="getCoverImage(item.products || {})" /></td>
                      <td class="px-3 py-2 text-stone-500">{{ item.product_colors?.color_name || '—' }}</td>
                      <td class="px-3 py-2">{{ item.quantity }}</td>
                      <td class="px-3 py-2">{{ formatRial(item.unit_price) }}</td>
                      <td class="px-3 py-2">{{ formatRial(item.line_total) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <NuxtLink :to="`/dashboard/purchase-invoices/${e.reference_id}`" class="mt-2 inline-block text-xs text-brand-600 hover:underline">مشاهده فاکتور کامل ←</NuxtLink>
            </div>

            <!-- سند درآمد فروش: محصول + تعداد + قیمت + فروشنده + شماره سفارش -->
            <div v-else-if="details[e.id].kind === 'revenue_sale'" class="grid gap-1 text-xs text-stone-600 dark:text-stone-400">
              <p><span class="font-medium text-stone-800 dark:text-stone-200">محصول:</span> {{ e.products?.title || '—' }}</p>
              <p><span class="font-medium text-stone-800 dark:text-stone-200">تعداد:</span> {{ e.quantity }}</p>
              <p><span class="font-medium text-stone-800 dark:text-stone-200">قیمت واحد:</span> {{ formatRial(e.unit_price) }} ریال</p>
              <p><span class="font-medium text-stone-800 dark:text-stone-200">فروشنده:</span> {{ e.vendors?.name || '—' }}</p>
              <p><span class="font-medium text-stone-800 dark:text-stone-200">مشتری:</span> {{ e.customer_name || details[e.id].order?.full_name || '—' }}</p>
              <p><span class="font-medium text-stone-800 dark:text-stone-200">شماره سفارش:</span> {{ details[e.id].order?.order_number || '—' }}</p>
              <NuxtLink :to="`/dashboard/orders/${e.reference_id}`" class="mt-1 text-brand-600 hover:underline">مشاهده فاکتور فروش ←</NuxtLink>
            </div>

            <!-- سند دارایی اولیه -->
            <div v-else class="grid gap-1 text-xs text-stone-600 dark:text-stone-400">
              <p><span class="font-medium text-stone-800 dark:text-stone-200">محصول:</span> {{ e.products?.title || '—' }}</p>
              <p><span class="font-medium text-stone-800 dark:text-stone-200">تعداد:</span> {{ e.quantity }}</p>
              <p><span class="font-medium text-stone-800 dark:text-stone-200">قیمت خرید واحد:</span> {{ formatRial(e.unit_price) }} ریال</p>
              <p><span class="font-medium text-stone-800 dark:text-stone-200">فروشنده:</span> {{ e.vendors?.name || '—' }}</p>
            </div>
          </template>
        </div>
      </div>

      <p v-if="!filtered.length" class="p-6 text-center text-stone-500">سندی با این فیلتر یافت نشد.</p>
    </div>

    <Pagination :current-page="currentPage" :total-pages="totalPages" @prev="prev" @next="next" @go-to="goTo" />

    <!-- پیش‌نمایش چاپ: تمام اسناد فیلترشده (نه فقط صفحه فعلی) به‌صورت یک جدول مسطح -->
    <div class="mt-8">
      <PrintableSection title="دفتر حسابداری" :subtitle="filterSubtitle" element-id="accounting-print-area" file-name="دفتر-حسابداری">
        <table class="w-full border-collapse text-right text-xs">
          <thead>
            <tr class="border-b bg-stone-50 text-stone-600">
              <th class="p-2">تاریخ</th>
              <th class="p-2">نوع سند</th>
              <th class="p-2">شرح / محصول</th>
              <th class="p-2">تعداد</th>
              <th class="p-2">فروشنده</th>
              <th class="p-2">مشتری</th>
              <th class="p-2">مبلغ (ریال)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in filtered" :key="e.id" class="border-b">
              <td class="p-2">{{ toJalaliDate(e.created_at) }}</td>
              <td class="p-2">{{ entryLabel(e.entry_type) }}</td>
              <td class="p-2">{{ e.products?.title || e.description }}</td>
              <td class="p-2">{{ e.quantity ?? '—' }}</td>
              <td class="p-2">{{ e.vendors?.name || '—' }}</td>
              <td class="p-2">{{ e.customer_name || '—' }}</td>
              <td class="p-2">{{ formatRial(e.amount) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t font-bold">
              <td class="p-2" colspan="6">جمع کل</td>
              <td class="p-2">{{ formatRial(filtered.reduce((s, e) => s + Number(e.amount || 0), 0)) }}</td>
            </tr>
          </tfoot>
        </table>
        <p v-if="!filtered.length" class="p-6 text-center text-stone-500">سندی برای نمایش وجود ندارد.</p>
      </PrintableSection>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAccountingStore } from '~/stores/accounting'
import { useVendorsStore } from '~/stores/vendors'
import SkeletonTable from '~/components/common/SkeletonTable.vue'
import SkeletonBox from '~/components/common/SkeletonBox.vue'
import Pagination from '~/components/common/Pagination.vue'
import JalaliDateRangeFilter from '~/components/common/JalaliDateRangeFilter.vue'
import PrintableSection from '~/components/dashboard/PrintableSection.vue'
import ProductNameHover from '~/components/common/ProductNameHover.vue'
import { getCoverImage, formatRial } from '~/composables/useProductHelpers'
import { toJalaliDate } from '~/composables/useJalaliDate'
import { usePagination } from '~/composables/usePagination'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'حسابداری' })

const accountingStore = useAccountingStore()
const vendorsStore = useVendorsStore()

onMounted(() => {
  accountingStore.fetchEntries()
  accountingStore.fetchTotals()
  vendorsStore.fetchVendors()
})

const customerSearch = ref('')
const productSearch = ref('')
const typeFilter = ref('all')
const vendorFilter = ref('all')
const dateRange = ref({ from: null, to: null })

const filtered = computed(() => {
  const customerTerm = customerSearch.value.trim().toLowerCase()
  const productTerm = productSearch.value.trim().toLowerCase()

  return accountingStore.entries.filter((e) => {
    const matchesCustomer = !customerTerm || (e.customer_name || '').toLowerCase().includes(customerTerm)
    const matchesProduct =
      !productTerm ||
      e.products?.title?.toLowerCase().includes(productTerm) ||
      e.product_id?.toLowerCase().includes(productTerm)
    const matchesType = typeFilter.value === 'all' || e.entry_type === typeFilter.value
    const matchesVendor = vendorFilter.value === 'all' || e.vendor_id === vendorFilter.value

    const entryDate = new Date(e.created_at)
    const matchesFrom = !dateRange.value.from || entryDate >= new Date(dateRange.value.from)
    const matchesTo = !dateRange.value.to || entryDate <= new Date(dateRange.value.to + 'T23:59:59')

    return matchesCustomer && matchesProduct && matchesType && matchesVendor && matchesFrom && matchesTo
  })
})

const { currentPage, totalPages, paginated, goTo, next, prev } = usePagination(filtered, 15)

// باز/بسته کردن آکاردئون + لود تنبل جزئیات هر سند فقط در اولین باز شدن
const openIds = ref(new Set())
const details = ref({})

async function toggle(entry) {
  if (openIds.value.has(entry.id)) {
    openIds.value.delete(entry.id)
  } else {
    openIds.value.add(entry.id)
    if (!details.value[entry.id]) {
      details.value[entry.id] = await accountingStore.fetchEntryDetails(entry)
    }
  }
  openIds.value = new Set(openIds.value)
}

function entryLabel(type) {
  return { asset_initial: 'دارایی اولیه', liability_purchase: 'بدهی خرید', revenue_sale: 'درآمد فروش' }[type] || type
}
function entryStyle(type) {
  if (type === 'liability_purchase') return 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  if (type === 'revenue_sale') return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
  return 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
}

// عنوان استاندارد گزارش شامل فیلترهای اعمال‌شده (برای درج در بالای نسخه چاپی)
const filterSubtitle = computed(() => {
  const parts = []
  if (typeFilter.value !== 'all') parts.push(`نوع سند: ${entryLabel(typeFilter.value)}`)
  if (vendorFilter.value !== 'all') {
    const v = vendorsStore.vendors.find((vv) => vv.id === vendorFilter.value)
    parts.push(`فروشنده: ${v?.name || ''}`)
  }
  if (customerSearch.value.trim()) parts.push(`مشتری: «${customerSearch.value.trim()}»`)
  if (productSearch.value.trim()) parts.push(`محصول: «${productSearch.value.trim()}»`)
  if (dateRange.value.from || dateRange.value.to) {
    parts.push(`بازه تاریخ: ${toJalaliDate(dateRange.value.from) || '...'} تا ${toJalaliDate(dateRange.value.to) || '...'}`)
  }
  return parts.length ? parts.join(' | ') : 'همه اسناد (بدون فیلتر)'
})
</script>
