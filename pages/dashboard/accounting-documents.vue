<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-stone-800 dark:text-stone-100">اسناد حسابداری</h1>
      <BaseButton @click="showManualForm = !showManualForm">{{ showManualForm ? 'بستن فرم' : '+ سند دستی جدید' }}</BaseButton>
    </div>
    <p class="mb-4 text-xs text-stone-500 dark:text-stone-400">
      دفتر روزنامه بر پایه حسابداری دوبل (بدهکار/بستانکار). اسناد فروش، خرید، دارایی اولیه و مرجوعی به‌صورت خودکار از عملیات سایت ثبت می‌شوند؛ برای مواردی خارج از این جریان (مثلاً اصلاحیه)، از فرم سند دستی استفاده کنید.
    </p>

    <!-- فرم ثبت سند دستی -->
    <form v-if="showManualForm" @submit.prevent="handleManualSubmit" class="mb-8 space-y-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
      <BaseInput v-model="manualForm.description" label="شرح سند" required />

      <div class="space-y-2">
        <div v-for="(line, idx) in manualForm.lines" :key="idx" class="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:items-end">
          <div class="sm:col-span-5">
            <label class="mb-1 block text-xs text-stone-500 dark:text-stone-400">حساب</label>
            <select v-model="line.account_code" class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100">
              <option value="">انتخاب حساب</option>
              <option v-for="a in chartStore.accounts" :key="a.id" :value="a.code">{{ a.code }} - {{ a.name }}</option>
            </select>
          </div>
          <div class="sm:col-span-3">
            <PriceInput v-model="line.debit" label="بدهکار (تومان)" />
          </div>
          <div class="sm:col-span-3">
            <PriceInput v-model="line.credit" label="بستانکار (تومان)" />
          </div>
          <div class="sm:col-span-1">
            <button type="button" class="text-red-500 hover:text-red-700" :disabled="manualForm.lines.length === 2" @click="removeLine(idx)">✕</button>
          </div>
        </div>
      </div>

      <button type="button" class="text-sm text-brand-600 hover:underline dark:text-brand-400" @click="addLine">+ افزودن آرتیکل</button>

      <div class="flex justify-between border-t border-stone-200 pt-3 text-sm dark:border-stone-700">
        <span :class="isBalanced ? 'text-brand-600' : 'text-red-600'">
          بدهکار: {{ formatToman(manualTotalDebit) }} تومان — بستانکار: {{ formatToman(manualTotalCredit) }} تومان
          {{ isBalanced ? '✓ بالانس' : '✗ نامتوازن' }}
        </span>
      </div>

      <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>
      <BaseButton type="submit" :loading="saving" :disabled="!isBalanced">ثبت سند</BaseButton>
    </form>

    <!-- فیلترها -->
    <div class="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
      <input v-model="search" type="text" placeholder="جستجو در شرح سند یا نام حساب..." class="w-64 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100" />
      <select v-model="sourceFilter" class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100">
        <option value="all">همه منابع</option>
        <option value="sale">فروش</option>
        <option value="sale_cogs">بهای تمام‌شده فروش</option>
        <option value="purchase">خرید</option>
        <option value="asset_initial">دارایی اولیه</option>
        <option value="return">مرجوعی</option>
        <option value="return_cogs">برگشت بهای تمام‌شده</option>
        <option value="expense">هزینه</option>
        <option value="bank_transfer">حواله بانکی</option>
        <option value="manual">سند دستی</option>
      </select>
      <JalaliDateRangeFilter v-model="dateRange" />
      <span class="text-xs text-stone-400">{{ filtered.length }} سند</span>
    </div>

    <SkeletonTable v-if="journalStore.loading" :rows="6" :columns="4" :with-image="false" />

    <div v-else class="space-y-2">
      <div v-for="entry in paginated" :key="entry.id" class="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
        <button type="button" class="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-right hover:bg-stone-50 dark:hover:bg-stone-900/40" @click="toggle(entry.id)">
          <div class="flex items-center gap-3">
            <span class="text-lg text-stone-400">{{ openIds.has(entry.id) ? '▾' : '◂' }}</span>
            <span class="font-mono text-xs text-stone-400">#{{ entry.entry_number }}</span>
            <span class="text-xs text-stone-500 dark:text-stone-400">{{ toJalaliDate(entry.entry_date) }}</span>
            <span class="rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-600 dark:bg-stone-900 dark:text-stone-300">{{ sourceLabel(entry.source_type) }}</span>
            <span class="text-sm text-stone-700 dark:text-stone-300">{{ entry.description }}</span>
          </div>
          <span class="font-medium text-stone-800 dark:text-stone-100">{{ formatRial(entryTotal(entry)) }} ریال</span>
        </button>

        <div v-if="openIds.has(entry.id)" class="border-t border-stone-100 p-4 dark:border-stone-700">
          <table class="w-full text-right text-xs">
            <thead class="text-stone-500 dark:text-stone-400">
              <tr>
                <th class="px-2 py-1">کد</th>
                <th class="px-2 py-1">حساب</th>
                <th class="px-2 py-1">بدهکار (ریال)</th>
                <th class="px-2 py-1">بستانکار (ریال)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="line in entry.journal_lines" :key="line.id" class="border-t border-stone-100 dark:border-stone-700">
                <td class="px-2 py-1.5 font-mono text-stone-400">{{ line.chart_of_accounts?.code }}</td>
                <td class="px-2 py-1.5 text-stone-700 dark:text-stone-300">{{ line.chart_of_accounts?.name }}</td>
                <td class="px-2 py-1.5 text-brand-600">{{ line.debit > 0 ? formatRial(line.debit) : '—' }}</td>
                <td class="px-2 py-1.5 text-red-500">{{ line.credit > 0 ? formatRial(line.credit) : '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p v-if="!filtered.length" class="p-6 text-center text-stone-500">سندی با این فیلتر یافت نشد.</p>
    </div>

    <Pagination :current-page="currentPage" :total-pages="totalPages" @prev="prev" @next="next" @go-to="goTo" />

    <!-- پیش‌نمایش چاپ: تمام اسناد فیلترشده (نه فقط صفحه فعلی)، هر آرتیکل یک ردیف مسطح -->
    <div class="mt-8">
      <PrintableSection title="دفتر روزنامه حسابداری" :subtitle="filterSubtitle" element-id="journal-print-area" file-name="دفتر-روزنامه">
        <table class="w-full border-collapse text-right text-xs">
          <thead>
            <tr class="border-b bg-stone-50 text-stone-600">
              <th class="p-2">شماره سند</th>
              <th class="p-2">تاریخ</th>
              <th class="p-2">منبع</th>
              <th class="p-2">شرح</th>
              <th class="p-2">کد حساب</th>
              <th class="p-2">نام حساب</th>
              <th class="p-2">بدهکار (ریال)</th>
              <th class="p-2">بستانکار (ریال)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in printRows" :key="idx" class="border-b">
              <td class="p-2 font-mono">{{ row.entry_number }}</td>
              <td class="p-2">{{ toJalaliDate(row.entry_date) }}</td>
              <td class="p-2">{{ sourceLabel(row.source_type) }}</td>
              <td class="p-2">{{ row.description }}</td>
              <td class="p-2 font-mono">{{ row.account_code }}</td>
              <td class="p-2">{{ row.account_name }}</td>
              <td class="p-2">{{ row.debit > 0 ? formatRial(row.debit) : '—' }}</td>
              <td class="p-2">{{ row.credit > 0 ? formatRial(row.credit) : '—' }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t font-bold">
              <td class="p-2" colspan="6">جمع کل</td>
              <td class="p-2">{{ formatRial(printTotals.debit) }}</td>
              <td class="p-2">{{ formatRial(printTotals.credit) }}</td>
            </tr>
          </tfoot>
        </table>
        <p v-if="!printRows.length" class="p-6 text-center text-stone-500">سندی برای نمایش وجود ندارد.</p>
      </PrintableSection>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useJournalStore } from '~/stores/journal'
import { useChartOfAccountsStore } from '~/stores/chartOfAccounts'
import BaseInput from '~/components/common/BaseInput.vue'
import BaseButton from '~/components/common/BaseButton.vue'
import PriceInput from '~/components/common/PriceInput.vue'
import SkeletonTable from '~/components/common/SkeletonTable.vue'
import Pagination from '~/components/common/Pagination.vue'
import JalaliDateRangeFilter from '~/components/common/JalaliDateRangeFilter.vue'
import PrintableSection from '~/components/dashboard/PrintableSection.vue'
import { formatToman, formatRial } from '~/composables/useProductHelpers'
import { toJalaliDate } from '~/composables/useJalaliDate'
import { usePagination } from '~/composables/usePagination'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'اسناد حسابداری' })

const journalStore = useJournalStore()
const chartStore = useChartOfAccountsStore()

onMounted(async () => {
  await chartStore.fetchAccounts()
  await journalStore.fetchEntries()
})

const showManualForm = ref(false)
const saving = ref(false)
const errorMsg = ref('')

function emptyLine() {
  return { account_code: '', debit: '', credit: '' }
}
const manualForm = reactive({ description: '', lines: [emptyLine(), emptyLine()] })

const manualTotalDebit = computed(() => manualForm.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0))
const manualTotalCredit = computed(() => manualForm.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0))
const isBalanced = computed(() => manualTotalDebit.value > 0 && manualTotalDebit.value === manualTotalCredit.value)

function addLine() {
  manualForm.lines.push(emptyLine())
}
function removeLine(idx) {
  if (manualForm.lines.length === 2) return
  manualForm.lines.splice(idx, 1)
}

async function handleManualSubmit() {
  errorMsg.value = ''
  saving.value = true
  try {
    await journalStore.postEntry({
      description: manualForm.description,
      source_type: 'manual',
      lines: manualForm.lines.filter((l) => l.account_code)
    })
    manualForm.description = ''
    manualForm.lines = [emptyLine(), emptyLine()]
    showManualForm.value = false
    await journalStore.fetchEntries()
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    saving.value = false
  }
}

const search = ref('')
const sourceFilter = ref('all')
const dateRange = ref({ from: null, to: null })

function entryTotal(entry) {
  return (entry.journal_lines || []).reduce((s, l) => s + Number(l.debit || 0), 0)
}

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  return journalStore.entries.filter((e) => {
    const matchesSearch =
      !term ||
      e.description?.toLowerCase().includes(term) ||
      (e.journal_lines || []).some((l) => l.chart_of_accounts?.name?.toLowerCase().includes(term))
    const matchesSource = sourceFilter.value === 'all' || e.source_type === sourceFilter.value

    const entryDate = new Date(e.entry_date)
    const matchesFrom = !dateRange.value.from || entryDate >= new Date(dateRange.value.from)
    const matchesTo = !dateRange.value.to || entryDate <= new Date(dateRange.value.to + 'T23:59:59')

    return matchesSearch && matchesSource && matchesFrom && matchesTo
  })
})

const { currentPage, totalPages, paginated, goTo, next, prev } = usePagination(filtered, 15)

const openIds = ref(new Set())
function toggle(id) {
  if (openIds.value.has(id)) openIds.value.delete(id)
  else openIds.value.add(id)
  openIds.value = new Set(openIds.value)
}

function sourceLabel(type) {
  return {
    sale: 'فروش', sale_cogs: 'بهای تمام‌شده فروش', purchase: 'خرید', asset_initial: 'دارایی اولیه',
    return: 'مرجوعی', return_cogs: 'برگشت بهای تمام‌شده', expense: 'هزینه', bank_transfer: 'حواله بانکی', manual: 'سند دستی'
  }[type] || type
}

// ردیف‌های مسطح‌شده برای چاپ: هر آرتیکل (خط بدهکار/بستانکار) یک ردیف مستقل در جدول چاپی است
const printRows = computed(() => {
  const rows = []
  for (const entry of filtered.value) {
    for (const line of entry.journal_lines || []) {
      rows.push({
        entry_number: entry.entry_number,
        entry_date: entry.entry_date,
        source_type: entry.source_type,
        description: entry.description,
        account_code: line.chart_of_accounts?.code,
        account_name: line.chart_of_accounts?.name,
        debit: line.debit,
        credit: line.credit
      })
    }
  }
  return rows
})

const printTotals = computed(() => ({
  debit: printRows.value.reduce((s, r) => s + Number(r.debit || 0), 0),
  credit: printRows.value.reduce((s, r) => s + Number(r.credit || 0), 0)
}))

// عنوان استاندارد گزارش شامل فیلترهای اعمال‌شده (برای درج در بالای نسخه چاپی)
const filterSubtitle = computed(() => {
  const parts = []
  if (sourceFilter.value !== 'all') parts.push(`نوع منبع: ${sourceLabel(sourceFilter.value)}`)
  if (search.value.trim()) parts.push(`جستجو: «${search.value.trim()}»`)
  if (dateRange.value.from || dateRange.value.to) {
    parts.push(`بازه تاریخ: ${toJalaliDate(dateRange.value.from) || '...'} تا ${toJalaliDate(dateRange.value.to) || '...'}`)
  }
  return parts.length ? parts.join(' | ') : 'همه اسناد (بدون فیلتر)'
})
</script>
