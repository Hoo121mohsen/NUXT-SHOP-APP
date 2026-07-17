<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">گزارش دوره‌ای ارزش افزوده</h1>

    <!-- انتخاب سریع فصل مالیاتی (طبق تقویم رسمی سازمان امور مالیاتی) -->
    <div class="print-hidden mb-4 flex flex-wrap gap-2">
      <button
        v-for="q in quarters"
        :key="q.label"
        type="button"
        class="rounded-full border px-3 py-1.5 text-xs"
        :class="activeQuarter === q.label ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'border-stone-300 text-stone-600 dark:border-stone-600 dark:text-stone-300'"
        @click="selectQuarter(q)"
      >
        {{ q.label }} {{ toFa(currentJalaliYear) }}
      </button>
    </div>

    <div class="print-hidden mb-6 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
      <JalaliDateRangeFilter v-model="dateRange" />
    </div>

    <SkeletonTable v-if="loading" :rows="4" :columns="2" :with-image="false" />

    <PrintableSection v-else title="گزارش دوره‌ای مالیات بر ارزش افزوده" :subtitle="periodLabel" element-id="vat-report-print-area" file-name="گزارش-ارزش-افزوده">
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="rounded-xl border p-4">
          <p class="text-sm text-stone-500">مجموع فروش خالص (بدون مالیات)</p>
          <p class="mt-1 text-xl font-bold text-brand-600">{{ formatRial(report.netSales) }} ریال</p>
        </div>
        <div class="rounded-xl border p-4">
          <p class="text-sm text-stone-500">مالیات بر ارزش افزوده فروش (پرداختنی)</p>
          <p class="mt-1 text-xl font-bold text-red-600">{{ formatRial(report.outputVat) }} ریال</p>
        </div>
        <div class="rounded-xl border p-4">
          <p class="text-sm text-stone-500">مجموع خرید خالص (بدون مالیات)</p>
          <p class="mt-1 text-xl font-bold text-stone-700">{{ formatRial(report.netPurchases) }} ریال</p>
        </div>
        <div class="rounded-xl border p-4">
          <p class="text-sm text-stone-500">مالیات بر ارزش افزوده خرید (قابل مطالبه)</p>
          <p class="mt-1 text-xl font-bold text-brand-600">{{ formatRial(report.inputVat) }} ریال</p>
        </div>
      </div>

      <div class="mt-4 rounded-xl border-2 border-dashed border-brand-400 bg-brand-50 p-5">
        <p class="text-sm text-stone-600">
          مالیات بر ارزش افزوده خالص قابل پرداخت به سازمان امور مالیاتی (فروش − خرید) در این دوره:
        </p>
        <p class="mt-1 text-2xl font-bold" :class="netVatPayable >= 0 ? 'text-red-600' : 'text-brand-600'">
          {{ formatRial(Math.abs(netVatPayable)) }} ریال
          <span class="text-sm font-normal">{{ netVatPayable >= 0 ? '(بدهکار به دارایی)' : '(بستانکار از دارایی / قابل استرداد)' }}</span>
        </p>
      </div>
    </PrintableSection>

    <p class="print-hidden mt-4 text-xs text-stone-400">
      این گزارش بر اساس اسناد حسابداری ثبت‌شده در بازه انتخابی محاسبه می‌شود. برای جزئیات کامل هر سند به «اسناد حسابداری» مراجعه کنید.
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import jalaali from 'jalaali-js'
import SkeletonTable from '~/components/common/SkeletonTable.vue'
import JalaliDateRangeFilter from '~/components/common/JalaliDateRangeFilter.vue'
import PrintableSection from '~/components/dashboard/PrintableSection.vue'
import { formatRial } from '~/composables/useProductHelpers'
import { toJalaliDate } from '~/composables/useJalaliDate'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'گزارش ارزش افزوده' })

const currentJalaliYear = jalaali.toJalaali(new Date()).jy

function toFa(n) {
  return String(n).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d])
}

// چهار فصل مالیاتی رسمی: بهار (۱-۳) / تابستان (۴-۶) / پاییز (۷-۹) / زمستان (۱۰-۱۲)
const quarters = [
  { label: 'بهار', startMonth: 1, endMonth: 3 },
  { label: 'تابستان', startMonth: 4, endMonth: 6 },
  { label: 'پاییز', startMonth: 7, endMonth: 9 },
  { label: 'زمستان', startMonth: 10, endMonth: 12 }
]
const activeQuarter = ref('')

function jalaliToGregorianStr(jy, jm, jd) {
  const g = jalaali.toGregorian(jy, jm, jd)
  return `${g.gy}-${String(g.gm).padStart(2, '0')}-${String(g.gd).padStart(2, '0')}`
}

function selectQuarter(q) {
  activeQuarter.value = q.label
  const lastDay = q.endMonth <= 6 ? 31 : q.endMonth === 12 ? 29 : 30
  dateRange.value = {
    from: jalaliToGregorianStr(currentJalaliYear, q.startMonth, 1),
    to: jalaliToGregorianStr(currentJalaliYear, q.endMonth, lastDay)
  }
}

const dateRange = ref({ from: null, to: null })
const loading = ref(false)
const report = ref({ netSales: 0, outputVat: 0, netPurchases: 0, inputVat: 0 })

async function loadReport() {
  if (!dateRange.value.from || !dateRange.value.to) return
  loading.value = true
  const supabase = useSupabase()

  const { data } = await supabase
    .from('journal_lines')
    .select('debit, credit, chart_of_accounts(code), journal_entries!inner(entry_date)')
    .gte('journal_entries.entry_date', dateRange.value.from)
    .lte('journal_entries.entry_date', dateRange.value.to + 'T23:59:59')

  const totals = { netSales: 0, outputVat: 0, netPurchases: 0, inputVat: 0 }
  ;(data || []).forEach((line) => {
    const code = line.chart_of_accounts?.code
    if (code === '4010') totals.netSales += Number(line.credit || 0) - Number(line.debit || 0) // فروش منهای برگشت از فروش
    if (code === '2020') totals.outputVat += Number(line.credit || 0) - Number(line.debit || 0)
    if (code === '1050') totals.inputVat += Number(line.debit || 0)
  })

  // خرید خالص: ردیف بدهکار موجودی کالا (۱۰۴۰) در اسنادی که منبعشان دقیقاً «خرید» بوده (نه دارایی اولیه یا برگشت)
  const { data: purchaseInventoryLines } = await supabase
    .from('journal_lines')
    .select('debit, chart_of_accounts(code), journal_entries!inner(entry_date, source_type)')
    .eq('journal_entries.source_type', 'purchase')
    .gte('journal_entries.entry_date', dateRange.value.from)
    .lte('journal_entries.entry_date', dateRange.value.to + 'T23:59:59')

  ;(purchaseInventoryLines || []).forEach((line) => {
    if (line.chart_of_accounts?.code === '1040') totals.netPurchases += Number(line.debit || 0)
  })

  report.value = totals
  loading.value = false
}

const netVatPayable = computed(() => report.value.outputVat - report.value.inputVat)

// برچسب دوره برای درج در بالای نسخه چاپی گزارش
const periodLabel = computed(() => {
  const from = dateRange.value.from ? toJalaliDate(dateRange.value.from) : '...'
  const to = dateRange.value.to ? toJalaliDate(dateRange.value.to) : '...'
  const quarterPart = activeQuarter.value ? `${activeQuarter.value} ${toFa(currentJalaliYear)} — ` : ''
  return `${quarterPart}از ${from} تا ${to}`
})

onMounted(() => {
  // پیش‌فرض: فصل جاری
  const currentMonth = jalaali.toJalaali(new Date()).jm
  const q = quarters.find((qq) => currentMonth >= qq.startMonth && currentMonth <= qq.endMonth)
  selectQuarter(q)
})

watch(dateRange, loadReport, { deep: true })
</script>
