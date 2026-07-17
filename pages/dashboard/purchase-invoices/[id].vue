<template>
  <div>
    <!-- نوار ابزار (در چاپ مخفی می‌شود) -->
    <div class="print-hidden mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold text-stone-800 dark:text-stone-100">فاکتور خرید</h1>
      <div class="flex items-center gap-2">
        <select v-model="pageSize" class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100">
          <option value="A4">اندازه چاپ: A4</option>
          <option value="A5">اندازه چاپ: A5</option>
        </select>
        <BaseButton variant="secondary" @click="printNow">🖨 چاپ</BaseButton>
        <BaseButton @click="downloadPdf('invoice-print-area', `invoice-${invoice?.invoice_number}.pdf`)">⬇ دانلود PDF</BaseButton>
      </div>
    </div>

    <div v-if="loading" class="mx-auto max-w-2xl space-y-4 rounded-xl border border-stone-200 bg-white p-8 dark:border-stone-700 dark:bg-stone-800">
      <SkeletonBox height="1.5rem" width="50%" />
      <SkeletonBox height="1rem" width="30%" />
      <SkeletonBox height="8rem" width="100%" />
      <SkeletonBox height="1.5rem" width="40%" />
    </div>

    <div
      v-else-if="invoice"
      id="invoice-print-area"
      class="mx-auto rounded-xl border border-stone-200 bg-white p-8 text-stone-800 dark:border-stone-700 dark:bg-white dark:text-stone-800"
      :style="{ maxWidth: pageSize === 'A5' ? '148mm' : '210mm' }"
    >
      <div class="mb-6 flex items-start justify-between border-b pb-4">
        <div>
          <h2 class="text-lg font-bold">فاکتور خرید</h2>
          <p class="text-sm text-stone-500">شماره فاکتور: {{ invoice.official_invoice_number }} (داخلی: {{ invoice.invoice_number }})</p>
          <p class="text-sm text-stone-500">تاریخ: {{ toJalaliDate(invoice.created_at) }}</p>
        </div>
        <LinearBarcode :value="invoice.invoice_number" :height="45" />
      </div>

      <div class="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-stone-50 p-3 text-xs">
        <div>
          <p class="mb-1 font-bold text-stone-700">فروشنده (تامین‌کننده):</p>
          <p>{{ invoice.vendors?.name || '—' }}</p>
          <p v-if="invoice.vendors?.phone" class="text-stone-500">{{ invoice.vendors.phone }}</p>
        </div>
        <div>
          <p class="mb-1 font-bold text-stone-700">خریدار:</p>
          <p>{{ taxSettingsStore.settings.company_name || '—' }}</p>
          <p>شماره اقتصادی: {{ taxSettingsStore.settings.economic_code || '—' }}</p>
          <p>شناسه ملی: {{ taxSettingsStore.settings.national_id || '—' }}</p>
        </div>
      </div>
      <p class="mb-4 text-xs text-stone-500">انبار مقصد: {{ invoice.warehouses?.name || '—' }}</p>

      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="border-b bg-stone-50 text-stone-600">
            <th class="p-2 text-right">کالا</th>
            <th class="p-2 text-right">تعداد</th>
            <th class="p-2 text-right">قیمت واحد (ریال)</th>
            <th class="p-2 text-right">جمع (ریال)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in invoice.purchase_invoice_items" :key="item.id" class="border-b">
            <td class="p-2">
              <ProductNameHover :title="item.products?.title || '—'" :image="getCoverImage(item.products || {})" />
              <span v-if="item.product_colors" class="mr-1.5 inline-flex items-center gap-1 text-xs text-stone-500">
                <span class="h-2.5 w-2.5 rounded-full border border-stone-200" :style="{ backgroundColor: item.product_colors.color_hex }" />
                {{ item.product_colors.color_name }}
              </span>
            </td>
            <td class="p-2">{{ item.quantity.toLocaleString('fa-IR') }}</td>
            <td class="p-2">{{ formatRial(item.unit_price) }}</td>
            <td class="p-2">{{ formatRial(item.line_total) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="mt-4 flex justify-end">
        <div class="w-64 space-y-1 text-sm">
          <div class="flex justify-between text-stone-600">
            <span>مبلغ خالص</span>
            <span>{{ formatRial(invoice.subtotal ?? invoice.total_amount) }} ریال</span>
          </div>
          <div class="flex justify-between text-stone-600">
            <span>مالیات بر ارزش افزوده ({{ invoice.vat_rate ?? 0 }}٪)</span>
            <span>{{ formatRial(invoice.vat_amount ?? 0) }} ریال</span>
          </div>
          <div class="flex justify-between border-t pt-2 font-bold">
            <span>جمع کل</span>
            <span>{{ formatRial(invoice.total_amount) }} ریال</span>
          </div>
        </div>
      </div>

      <p v-if="invoice.notes" class="mt-6 text-xs text-stone-500">یادداشت: {{ invoice.notes }}</p>
    </div>

    <p v-else class="text-stone-500">فاکتور مورد نظر یافت نشد.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePurchaseInvoicesStore } from '~/stores/purchaseInvoices'
import { useTaxSettingsStore } from '~/stores/taxSettings'
import BaseButton from '~/components/common/BaseButton.vue'
import SkeletonBox from '~/components/common/SkeletonBox.vue'
import LinearBarcode from '~/components/common/LinearBarcode.vue'
import ProductNameHover from '~/components/common/ProductNameHover.vue'
import { getCoverImage, formatRial } from '~/composables/useProductHelpers'
import { toJalaliDate } from '~/composables/useJalaliDate'
import { usePrintInvoice } from '~/composables/usePrintInvoice'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'مشاهده فاکتور خرید' })

const route = useRoute()
const purchaseInvoicesStore = usePurchaseInvoicesStore()
const taxSettingsStore = useTaxSettingsStore()
const { pageSize, printNow, downloadPdf } = usePrintInvoice()

const invoice = ref(null)
const loading = ref(true)

onMounted(async () => {
  invoice.value = await purchaseInvoicesStore.fetchInvoiceById(route.params.id)
  loading.value = false
  await taxSettingsStore.fetchSettings()
})
</script>
