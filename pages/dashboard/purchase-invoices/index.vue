<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-stone-800 dark:text-stone-100">فاکتورهای خرید / فروش</h1>
      <BaseButton @click="showForm = !showForm">{{ showForm ? 'بستن فرم' : '+ فاکتور خرید جدید' }}</BaseButton>
    </div>
    <p class="mb-4 text-xs text-stone-500 dark:text-stone-400">
      فاکتورهای خرید دستی از این‌جا ثبت می‌شوند؛ فاکتورهای فروش خودکار و بر اساس مشخصات مشتری، به‌ازای هر سفارش ثبت‌شده در سایت صادر می‌شوند.
    </p>

    <!-- فرم ثبت فاکتور خرید جدید -->
    <form
      v-if="showForm"
      @submit.prevent="handleSubmit"
      class="mb-8 space-y-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800"
    >
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <BaseInput v-model="form.invoice_number" label="شماره فاکتور" required />
        <div>
          <label class="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">فروشنده</label>
          <select v-model="form.vendor_id" class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100">
            <option value="">انتخاب فروشنده</option>
            <option v-for="v in vendorsStore.vendors" :key="v.id" :value="v.id">{{ v.name }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">انبار مقصد</label>
          <select v-model="form.warehouse_id" class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100">
            <option value="">انتخاب انبار</option>
            <option v-for="w in warehousesStore.warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
          </select>
        </div>
      </div>

      <p class="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
        💰 قیمت‌ها به تومان وارد شوند. با ثبت این فاکتور، موجودی همان تنوع رنگ انتخابی + موجودی کل محصول افزایش می‌یابد و مبلغ کل به‌عنوان بدهی شرکت ثبت می‌شود.
      </p>

      <div class="space-y-3">
        <PurchaseInvoiceItemRow
          v-for="(row, idx) in form.items"
          :key="idx"
          :row="row"
          :products="productsStore.products"
          :disable-remove="form.items.length === 1"
          @update="(updated) => (form.items[idx] = updated)"
          @remove="removeRow(idx)"
        />
      </div>

      <button type="button" class="text-sm text-brand-600 hover:underline dark:text-brand-400" @click="addRow">+ افزودن ردیف</button>

      <div class="flex items-center gap-2">
        <label class="text-sm text-stone-600 dark:text-stone-400">نرخ مالیات بر ارزش افزوده (٪):</label>
        <input v-model.number="vatRate" type="number" step="0.5" min="0" class="w-20 rounded-lg border border-stone-300 bg-white px-2 py-1 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100" />
      </div>

      <div class="space-y-1 border-t border-stone-200 pt-4 text-sm dark:border-stone-700">
        <div class="flex justify-between text-stone-600 dark:text-stone-400">
          <span>مبلغ خالص</span>
          <span>{{ formatToman(subtotal) }} تومان</span>
        </div>
        <div class="flex justify-between text-stone-600 dark:text-stone-400">
          <span>مالیات بر ارزش افزوده ({{ vatRate }}٪)</span>
          <span>{{ formatToman(vatAmount) }} تومان</span>
        </div>
        <div class="flex justify-between font-bold text-stone-800 dark:text-stone-100">
          <span>جمع کل فاکتور (بدهی)</span>
          <span>{{ formatToman(subtotal + vatAmount) }} تومان</span>
        </div>
      </div>

      <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>
      <BaseButton type="submit" :loading="saving">ثبت فاکتور خرید</BaseButton>
    </form>

    <!-- نوار جستجو و فیلترها -->
    <div class="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
      <input
        v-model="search"
        type="text"
        placeholder="جستجو بر اساس شماره فاکتور..."
        class="w-56 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      />

      <select
        v-model="typeFilter"
        class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      >
        <option value="all">همه فاکتورها</option>
        <option value="purchase">فقط فاکتورهای خرید</option>
        <option value="sale">فقط فاکتورهای فروش</option>
      </select>

      <div class="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
        از
        <input v-model="dateFrom" type="date" class="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100" />
        تا
        <input v-model="dateTo" type="date" class="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100" />
      </div>

      <div class="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
        مبلغ از
        <input v-model="amountMin" type="number" placeholder="حداقل" class="w-24 rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100" />
        تا
        <input v-model="amountMax" type="number" placeholder="حداکثر" class="w-24 rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100" />
      </div>

      <span class="text-xs text-stone-400">{{ filtered.length }} فاکتور</span>
    </div>

    <SkeletonTable v-if="loadingAll" :rows="6" :columns="5" :with-image="false" />
    <div v-else class="overflow-x-auto rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <table class="w-full text-right text-sm">
        <thead class="border-b border-stone-200 bg-stone-50 text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
          <tr>
            <th class="px-4 py-3">نوع</th>
            <th class="px-4 py-3">شماره فاکتور</th>
            <th class="px-4 py-3">طرف حساب</th>
            <th class="px-4 py-3">مبلغ کل</th>
            <th class="px-4 py-3">تاریخ</th>
            <th class="px-4 py-3">مشاهده/چاپ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paginated" :key="row.key" class="border-b border-stone-100 last:border-0 dark:border-stone-700">
            <td class="px-4 py-3">
              <span
                class="rounded-md px-2 py-0.5 text-xs font-medium"
                :class="row.type === 'purchase' ? 'bg-indigo-50 text-indigo-700' : 'bg-brand-50 text-brand-700'"
              >
                {{ row.type === 'purchase' ? 'خرید' : 'فروش' }}
              </span>
            </td>
            <td class="px-4 py-3 font-mono text-stone-800 dark:text-stone-100">{{ row.number }}</td>
            <td class="px-4 py-3 text-stone-600 dark:text-stone-400">{{ row.party }}</td>
            <td class="px-4 py-3 text-stone-600 dark:text-stone-400">{{ formatToman(row.amount) }} تومان</td>
            <td class="px-4 py-3 text-stone-600 dark:text-stone-400">{{ toJalaliDate(row.date) }}</td>
            <td class="px-4 py-3">
              <NuxtLink :to="row.link" class="text-brand-600 hover:underline">مشاهده فاکتور</NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="!filtered.length" class="p-6 text-center text-stone-500">فاکتوری با این فیلتر یافت نشد.</p>
    </div>

    <Pagination :current-page="currentPage" :total-pages="totalPages" @prev="prev" @next="next" @go-to="goTo" />
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { usePurchaseInvoicesStore } from '~/stores/purchaseInvoices'
import { useOrdersStore } from '~/stores/orders'
import { useVendorsStore } from '~/stores/vendors'
import { useWarehousesStore } from '~/stores/warehouses'
import { useProductsStore } from '~/stores/products'
import { useTaxSettingsStore } from '~/stores/taxSettings'
import BaseInput from '~/components/common/BaseInput.vue'
import BaseButton from '~/components/common/BaseButton.vue'
import SkeletonTable from '~/components/common/SkeletonTable.vue'
import Pagination from '~/components/common/Pagination.vue'
import PurchaseInvoiceItemRow from '~/components/dashboard/PurchaseInvoiceItemRow.vue'
import { formatToman } from '~/composables/useProductHelpers'
import { toJalaliDate } from '~/composables/useJalaliDate'
import { usePagination } from '~/composables/usePagination'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'فاکتورهای خرید / فروش' })

const purchaseInvoicesStore = usePurchaseInvoicesStore()
const ordersStore = useOrdersStore()
const vendorsStore = useVendorsStore()
const warehousesStore = useWarehousesStore()
const productsStore = useProductsStore()
const taxSettingsStore = useTaxSettingsStore()

const showForm = ref(false)
const saving = ref(false)
const errorMsg = ref('')
const loadingAll = ref(true)
const vatRate = ref(9)

function emptyRow() {
  return { product_id: '', color_id: '', quantity: 1, unit_price: '', priceMode: 'current', new_sale_price: '' }
}
function emptyForm() {
  return {
    invoice_number: '',
    vendor_id: '',
    warehouse_id: '',
    items: [emptyRow()]
  }
}
const form = reactive(emptyForm())

const subtotal = computed(() =>
  form.items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0)
)
const vatAmount = computed(() => Math.round((subtotal.value * Number(vatRate.value || 0)) / 100))

onMounted(async () => {
  await Promise.all([
    purchaseInvoicesStore.fetchInvoices(),
    ordersStore.fetchOrders(),
    vendorsStore.fetchVendors(),
    warehousesStore.fetchWarehouses(),
    productsStore.fetchProducts(),
    taxSettingsStore.fetchSettings()
  ])
  vatRate.value = taxSettingsStore.settings.vat_rate ?? 9
  loadingAll.value = false
})

function addRow() {
  form.items.push(emptyRow())
}
function removeRow(idx) {
  if (form.items.length === 1) return
  form.items.splice(idx, 1)
}

async function handleSubmit() {
  errorMsg.value = ''
  const validItems = form.items.filter((i) => i.product_id && Number(i.quantity) > 0 && Number(i.unit_price) >= 0)
  if (!validItems.length) {
    errorMsg.value = 'حداقل یک ردیف معتبر (با انتخاب محصول، تعداد و قیمت خرید) وارد کنید.'
    return
  }
  saving.value = true
  try {
    const items = validItems.map((i) => ({
      product_id: i.product_id,
      color_id: i.color_id || null,
      quantity: i.quantity,
      unit_price: i.unit_price,
      new_sale_price: i.priceMode === 'new' ? i.new_sale_price : null
    }))

    await purchaseInvoicesStore.createPurchaseInvoice({
      invoice_number: form.invoice_number,
      vendor_id: form.vendor_id || null,
      warehouse_id: form.warehouse_id || null,
      items,
      vatRate: vatRate.value
    })
    Object.assign(form, emptyForm())
    showForm.value = false
    await purchaseInvoicesStore.fetchInvoices()
    await productsStore.fetchProducts()
  } catch (e) {
    errorMsg.value = 'خطا در ثبت فاکتور: ' + e.message
  } finally {
    saving.value = false
  }
}

// -------------------- ترکیب فاکتورهای خرید و فروش (سفارش‌ها) در یک لیست واحد --------------------
const search = ref('')
const typeFilter = ref('all')
const dateFrom = ref('')
const dateTo = ref('')
const amountMin = ref('')
const amountMax = ref('')

const combinedRows = computed(() => {
  const purchaseRows = purchaseInvoicesStore.invoices.map((inv) => ({
    key: `purchase-${inv.id}`,
    type: 'purchase',
    number: inv.invoice_number,
    party: inv.vendors?.name || '—',
    amount: Number(inv.total_amount),
    date: inv.created_at,
    link: `/dashboard/purchase-invoices/${inv.id}`
  }))

  const saleRows = ordersStore.orders.map((o) => ({
    key: `sale-${o.id}`,
    type: 'sale',
    number: o.order_number || o.id.slice(0, 8),
    party: o.full_name,
    amount: Number(o.total_price),
    date: o.created_at,
    link: `/dashboard/orders/${o.id}`
  }))

  return [...purchaseRows, ...saleRows].sort((a, b) => new Date(b.date) - new Date(a.date))
})

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  return combinedRows.value.filter((row) => {
    const matchesSearch = !term || row.number.toLowerCase().includes(term)
    const matchesType = typeFilter.value === 'all' || row.type === typeFilter.value

    const rowDate = new Date(row.date)
    const matchesFrom = !dateFrom.value || rowDate >= new Date(dateFrom.value)
    const matchesTo = !dateTo.value || rowDate <= new Date(dateTo.value + 'T23:59:59')

    const matchesMin = amountMin.value === '' || row.amount >= Number(amountMin.value)
    const matchesMax = amountMax.value === '' || row.amount <= Number(amountMax.value)

    return matchesSearch && matchesType && matchesFrom && matchesTo && matchesMin && matchesMax
  })
})

const { currentPage, totalPages, paginated, goTo, next, prev } = usePagination(filtered, 10)
</script>
