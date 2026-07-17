<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">ثبت هزینه‌ها</h1>

    <form @submit.prevent="handleSubmit" class="mb-8 max-w-xl space-y-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
      <BaseInput v-model="form.title" label="عنوان هزینه (مثلا اجاره آبان‌ماه)" required />

      <div>
        <label class="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">دسته هزینه</label>
        <select v-model="form.accountCode" class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100" required>
          <option value="">انتخاب کنید</option>
          <option v-for="a in expenseAccounts" :key="a.id" :value="a.code">{{ a.name }}</option>
        </select>
      </div>

      <PriceInput v-model="form.amount" label="مبلغ (تومان)" />

      <div class="grid grid-cols-2 gap-4">
        <JalaliDateInput v-model="form.expense_date" label="تاریخ هزینه" />
        <div>
          <label class="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">روش پرداخت</label>
          <select v-model="form.payment_method" class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100">
            <option value="cash">نقدی (صندوق)</option>
            <option value="bank">بانکی</option>
          </select>
        </div>
      </div>

      <BaseTextarea v-model="form.description" label="توضیحات (اختیاری)" :rows="2" />

      <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>
      <BaseButton type="submit" :loading="saving">ثبت هزینه</BaseButton>
    </form>

    <!-- فیلترها -->
    <div class="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
      <input v-model="search" type="text" placeholder="جستجو در عنوان هزینه..." class="w-56 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100" />
      <select v-model="accountFilter" class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100">
        <option value="all">همه دسته‌ها</option>
        <option v-for="a in expenseAccounts" :key="a.id" :value="a.code">{{ a.name }}</option>
      </select>
      <select v-model="paymentFilter" class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100">
        <option value="all">همه روش‌های پرداخت</option>
        <option value="cash">نقدی</option>
        <option value="bank">بانکی</option>
      </select>
      <JalaliDateRangeFilter v-model="dateRange" />
      <span class="text-xs text-stone-400">{{ filtered.length }} هزینه</span>
    </div>

    <SkeletonTable v-if="expensesStore.loading" :rows="5" :columns="4" :with-image="false" />

    <PrintableSection v-else title="گزارش هزینه‌ها" :subtitle="filterSubtitle" element-id="expenses-print-area" file-name="گزارش-هزینه-ها">
      <table class="w-full border-collapse text-right text-sm">
        <thead>
          <tr class="border-b bg-stone-50 text-stone-600">
            <th class="p-2">عنوان</th>
            <th class="p-2">دسته</th>
            <th class="p-2">مبلغ (ریال)</th>
            <th class="p-2">روش پرداخت</th>
            <th class="p-2">تاریخ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in filtered" :key="e.id" class="border-b">
            <td class="p-2">{{ e.title }}</td>
            <td class="p-2">{{ e.chart_of_accounts?.name || '—' }}</td>
            <td class="p-2">{{ formatRial(e.amount) }}</td>
            <td class="p-2">{{ e.payment_method === 'bank' ? 'بانکی' : 'نقدی' }}</td>
            <td class="p-2">{{ toJalaliDate(e.expense_date) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="border-t font-bold">
            <td class="p-2" colspan="2">جمع کل</td>
            <td class="p-2">{{ formatRial(totalAmount) }}</td>
            <td class="p-2" colspan="2"></td>
          </tr>
        </tfoot>
      </table>
      <p v-if="!filtered.length" class="p-6 text-center text-stone-500">هزینه‌ای با این فیلتر یافت نشد.</p>
    </PrintableSection>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useExpensesStore } from '~/stores/expenses'
import { useChartOfAccountsStore } from '~/stores/chartOfAccounts'
import BaseInput from '~/components/common/BaseInput.vue'
import BaseTextarea from '~/components/common/BaseTextarea.vue'
import BaseButton from '~/components/common/BaseButton.vue'
import PriceInput from '~/components/common/PriceInput.vue'
import SkeletonTable from '~/components/common/SkeletonTable.vue'
import JalaliDateInput from '~/components/common/JalaliDateInput.vue'
import JalaliDateRangeFilter from '~/components/common/JalaliDateRangeFilter.vue'
import PrintableSection from '~/components/dashboard/PrintableSection.vue'
import { formatRial } from '~/composables/useProductHelpers'
import { toJalaliDate } from '~/composables/useJalaliDate'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'ثبت هزینه‌ها' })

const expensesStore = useExpensesStore()
const chartStore = useChartOfAccountsStore()

const expenseAccounts = computed(() => chartStore.accounts.filter((a) => a.type === 'expense' && a.code !== '5010'))

function emptyForm() {
  return { title: '', accountCode: '', amount: '', expense_date: '', payment_method: 'cash', description: '' }
}
const form = reactive(emptyForm())
const saving = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  await chartStore.fetchAccounts()
  await expensesStore.fetchExpenses()
})

async function handleSubmit() {
  errorMsg.value = ''
  if (!form.accountCode || !form.amount) {
    errorMsg.value = 'دسته هزینه و مبلغ را وارد کنید.'
    return
  }
  saving.value = true
  try {
    await expensesStore.createExpense({
      title: form.title,
      accountCode: form.accountCode,
      amount: Number(form.amount),
      expense_date: form.expense_date,
      payment_method: form.payment_method,
      description: form.description
    })
    Object.assign(form, emptyForm())
  } catch (e) {
    errorMsg.value = 'خطا در ثبت هزینه: ' + e.message
  } finally {
    saving.value = false
  }
}

// فیلترها
const search = ref('')
const accountFilter = ref('all')
const paymentFilter = ref('all')
const dateRange = ref({ from: null, to: null })

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  return expensesStore.expenses.filter((e) => {
    const matchesSearch = !term || e.title?.toLowerCase().includes(term)
    const matchesAccount = accountFilter.value === 'all' || e.chart_of_accounts?.code === accountFilter.value
    const matchesPayment = paymentFilter.value === 'all' || e.payment_method === paymentFilter.value

    const d = new Date(e.expense_date)
    const matchesFrom = !dateRange.value.from || d >= new Date(dateRange.value.from)
    const matchesTo = !dateRange.value.to || d <= new Date(dateRange.value.to + 'T23:59:59')

    return matchesSearch && matchesAccount && matchesPayment && matchesFrom && matchesTo
  })
})

const totalAmount = computed(() => filtered.value.reduce((s, e) => s + Number(e.amount), 0))

const filterSubtitle = computed(() => {
  const parts = []
  if (accountFilter.value !== 'all') {
    const acc = expenseAccounts.value.find((a) => a.code === accountFilter.value)
    parts.push(`دسته: ${acc?.name || ''}`)
  }
  if (paymentFilter.value !== 'all') parts.push(`روش پرداخت: ${paymentFilter.value === 'bank' ? 'بانکی' : 'نقدی'}`)
  if (dateRange.value.from || dateRange.value.to) parts.push(`بازه تاریخ: ${toJalaliDate(dateRange.value.from) || '...'} تا ${toJalaliDate(dateRange.value.to) || '...'}`)
  return parts.join(' | ')
})
</script>
