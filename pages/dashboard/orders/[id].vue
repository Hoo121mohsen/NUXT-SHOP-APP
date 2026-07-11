<template>
  <div>
    <div class="print-hidden mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-2xl font-bold text-stone-800 dark:text-stone-100">فاکتور فروش</h1>
      <div class="flex items-center gap-2">
        <select v-model="pageSize" class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100">
          <option  value="A4">اندازه چاپ: A4</option>
          <option value="A5">اندازه چاپ: A5</option>
        </select>
        <BaseButton variant="secondary" @click="printNow">🖨 چاپ</BaseButton>
        <BaseButton @click="downloadPdf('order-print-area', `${order?.order_number || order?.id.slice(0, 8)}.pdf`)">⬇ دانلود PDF</BaseButton>
      </div>
    </div>

    <div v-if="loading" class="mx-auto max-w-2xl space-y-4 rounded-xl border border-stone-200 bg-white p-8 dark:border-stone-700 dark:bg-stone-800">
      <SkeletonBox height="1.5rem" width="50%" />
      <SkeletonBox height="1rem" width="30%" />
      <SkeletonBox height="8rem" width="100%" />
      <SkeletonBox height="1.5rem" width="40%" />
    </div>

    <div
      v-else-if="order"
      id="order-print-area"
      class="mx-auto rounded-xl border border-stone-200 bg-white p-8 text-stone-800 dark:border-stone-700 dark:bg-white dark:text-stone-800"
      :style="{ maxWidth: pageSize === 'A5' ? '148mm' : '210mm' }"
    >
      <div class="mb-6 flex items-start justify-between border-b pb-4">
        <div>
          <h2 class="text-lg font-bold">فاکتور فروش</h2>
          <p class="text-sm text-stone-500">کد سفارش: {{ order.order_number || order.id.slice(0, 8) }}</p>
          <p class="text-sm text-stone-500">تاریخ: {{ toJalaliDate(order.created_at) }}</p>
          <p class="mt-1 inline-block rounded-md px-2 py-0.5 text-xs font-medium" :class="orderStatusColor(order.status)">
            {{ orderStatusLabel(order.status) }}
          </p>
        </div>
        <LinearBarcode :value="order.order_number || order.id" :height="45" />
      </div>

      <div class="mb-6 text-sm">
        <p class="font-medium text-stone-700">مشتری:</p>
        <p>{{ order.full_name }} — {{ order.phone }}</p>
        <p class="text-stone-500">{{ order.address }}</p>
      </div>

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
          <tr v-for="(item, idx) in order.items" :key="idx" class="border-b">
            <td class="p-2">
              <ProductNameHover :title="item.title" :image="item.image" />
            </td>
            <td class="p-2">{{ Number(item.quantity).toLocaleString('fa-IR') }}</td>
            <td class="p-2">{{ formatRial(item.price) }}</td>
            <td class="p-2">{{ formatRial(item.price * item.quantity) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="mt-4 flex justify-end">
        <div class="w-56 text-sm">
          <div class="flex justify-between border-t pt-2 font-bold">
            <span>مبلغ نهایی</span>
            <span>{{ formatRial(order.total_price) }} ریال</span>
          </div>
        </div>
      </div>
    </div>

    <p v-else class="text-stone-500">سفارش مورد نظر یافت نشد.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import BaseButton from '~/components/common/BaseButton.vue'
import SkeletonBox from '~/components/common/SkeletonBox.vue'
import LinearBarcode from '~/components/common/LinearBarcode.vue'
import ProductNameHover from '~/components/common/ProductNameHover.vue'
import { formatRial } from '~/composables/useProductHelpers'
import { toJalaliDate } from '~/composables/useJalaliDate'
import { usePrintInvoice } from '~/composables/usePrintInvoice'
import { orderStatusLabel, orderStatusColor } from '~/stores/orders'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'فاکتور فروش' })

const route = useRoute()
const { pageSize, printNow, downloadPdf } = usePrintInvoice()

const order = ref(null)
const loading = ref(true)

onMounted(async () => {
  const supabase = useSupabase()
  const { data } = await supabase.from('orders').select('*').eq('id', route.params.id).single()
  order.value = data
  loading.value = false
})
</script>
