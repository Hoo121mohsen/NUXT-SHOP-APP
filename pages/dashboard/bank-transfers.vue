<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">حواله‌های بانکی</h1>

    <form @submit.prevent="handleSubmit" class="mb-8 max-w-xl space-y-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
      <div>
        <label class="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">نوع تراکنش</label>
        <div class="flex gap-4">
          <label class="flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-300">
            <input v-model="form.transfer_type" type="radio" value="deposit" /> واریز به حساب
          </label>
          <label class="flex items-center gap-1.5 text-sm text-stone-600 dark:text-stone-300">
            <input v-model="form.transfer_type" type="radio" value="withdrawal" /> برداشت / پرداخت از حساب
          </label>
        </div>
      </div>

      <PriceInput v-model="form.amount" label="مبلغ (تومان)" />

      <div class="grid grid-cols-2 gap-4">
        <BaseInput v-model="form.bank_name" label="نام بانک" />
        <BaseInput v-model="form.tracking_code" label="کد پیگیری / شماره حواله" />
      </div>

      <BaseInput v-model="form.related_party" label="طرف حساب (نام شخص/شرکت)" />

      <div>
        <label class="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">حساب طرف مقابل تراکنش</label>
        <select v-model="form.counterAccountCode" class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100" required>
          <option value="">انتخاب کنید</option>
          <option v-for="a in counterAccounts" :key="a.id" :value="a.code">{{ a.code }} - {{ a.name }}</option>
        </select>
        <p class="mt-1 text-xs text-stone-400">
          مثلا اگر بابت بدهی به یک فروشنده پرداخت می‌کنید، «حساب‌های پرداختنی» را انتخاب کنید؛ اگر بابت هزینه است، حساب هزینه مربوطه را انتخاب کنید.
        </p>
      </div>

      <JalaliDateInput v-model="form.transfer_date" label="تاریخ" />

      <BaseTextarea v-model="form.description" label="توضیحات" :rows="2" />

      <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>
      <BaseButton type="submit" :loading="saving">ثبت حواله</BaseButton>
    </form>

    <!-- فیلترها -->
    <div class="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
      <input v-model="search" type="text" placeholder="جستجو: کد پیگیری، طرف حساب، بانک..." class="w-60 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100" />

      <select v-model="typeFilter" class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100">
        <option value="all">همه انواع</option>
        <option value="deposit">فقط واریز</option>
        <option value="withdrawal">فقط برداشت</option>
      </select>

      <select v-model="counterAccountFilter" class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100">
        <option value="all">همه حساب‌های مقابل</option>
        <option v-for="a in counterAccounts" :key="a.id" :value="a.code">{{ a.name }}</option>
      </select>

      <div class="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
        مبلغ از
        <input v-model="amountMin" type="number" placeholder="حداقل" class="w-24 rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100" />
        تا
        <input v-model="amountMax" type="number" placeholder="حداکثر" class="w-24 rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100" />
      </div>

      <JalaliDateRangeFilter v-model="dateRange" />
      <span class="text-xs text-stone-400">{{ filtered.length }} حواله</span>
    </div>

    <SkeletonTable v-if="transfersStore.loading" :rows="5" :columns="5" :with-image="false" />

    <PrintableSection v-else title="گزارش حواله‌های بانکی" :subtitle="filterSubtitle" element-id="transfers-print-area" file-name="گزارش-حواله‌های-بانکی">
      <table class="w-full border-collapse text-right text-sm">
        <thead>
          <tr class="border-b bg-stone-50 text-stone-600">
            <th class="p-2">نوع</th>
            <th class="p-2">مبلغ (ریال)</th>
            <th class="p-2">بانک</th>
            <th class="p-2">کد پیگیری</th>
            <th class="p-2">طرف حساب</th>
            <th class="p-2">حساب مقابل</th>
            <th class="p-2">تاریخ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in filtered" :key="t.id" class="border-b">
            <td class="p-2">{{ t.transfer_type === 'deposit' ? 'واریز' : 'برداشت' }}</td>
            <td class="p-2">{{ formatRial(t.amount) }}</td>
            <td class="p-2">{{ t.bank_name || '—' }}</td>
            <td class="p-2">{{ t.tracking_code || '—' }}</td>
            <td class="p-2">{{ t.related_party || '—' }}</td>
            <td class="p-2">{{ t.chart_of_accounts?.name || '—' }}</td>
            <td class="p-2">{{ toJalaliDate(t.transfer_date) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="!filtered.length" class="p-6 text-center text-stone-500">حواله‌ای با این فیلتر یافت نشد.</p>
    </PrintableSection>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useBankTransfersStore } from '~/stores/bankTransfers'
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
useSeoMeta({ title: 'حواله‌های بانکی' })

const transfersStore = useBankTransfersStore()
const chartStore = useChartOfAccountsStore()

// حساب بانک (۱۰۲۰) خودش نباید به‌عنوان «طرف مقابل» انتخاب شود
const counterAccounts = computed(() => chartStore.accounts.filter((a) => a.code !== '1020'))

function emptyForm() {
  return {
    transfer_type: 'deposit',
    amount: '',
    bank_name: '',
    tracking_code: '',
    related_party: '',
    counterAccountCode: '',
    transfer_date: '',
    description: ''
  }
}
const form = reactive(emptyForm())
const saving = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  await chartStore.fetchAccounts()
  await transfersStore.fetchTransfers()
})

async function handleSubmit() {
  errorMsg.value = ''
  if (!form.counterAccountCode || !form.amount) {
    errorMsg.value = 'مبلغ و حساب طرف مقابل را مشخص کنید.'
    return
  }
  saving.value = true
  try {
    await transfersStore.createTransfer({
      ...form,
      amount: Number(form.amount)
    })
    Object.assign(form, emptyForm())
  } catch (e) {
    errorMsg.value = 'خطا در ثبت حواله: ' + e.message
  } finally {
    saving.value = false
  }
}

// فیلترها
const search = ref('')
const typeFilter = ref('all')
const counterAccountFilter = ref('all')
const amountMin = ref('')
const amountMax = ref('')
const dateRange = ref({ from: null, to: null })

const filtered = computed(() => {
  const term = search.value.trim().toLowerCase()
  return transfersStore.transfers.filter((t) => {
    const matchesSearch =
      !term ||
      t.tracking_code?.toLowerCase().includes(term) ||
      t.related_party?.toLowerCase().includes(term) ||
      t.bank_name?.toLowerCase().includes(term)

    const matchesType = typeFilter.value === 'all' || t.transfer_type === typeFilter.value
    const matchesAccount = counterAccountFilter.value === 'all' || t.chart_of_accounts?.code === counterAccountFilter.value

    const amount = Number(t.amount)
    const matchesMin = amountMin.value === '' || amount >= Number(amountMin.value)
    const matchesMax = amountMax.value === '' || amount <= Number(amountMax.value)

    const d = new Date(t.transfer_date)
    const matchesFrom = !dateRange.value.from || d >= new Date(dateRange.value.from)
    const matchesTo = !dateRange.value.to || d <= new Date(dateRange.value.to + 'T23:59:59')

    return matchesSearch && matchesType && matchesAccount && matchesMin && matchesMax && matchesFrom && matchesTo
  })
})

const filterSubtitle = computed(() => {
  const parts = []
  if (typeFilter.value !== 'all') parts.push(`نوع: ${typeFilter.value === 'deposit' ? 'واریز' : 'برداشت'}`)
  if (counterAccountFilter.value !== 'all') {
    const acc = counterAccounts.value.find((a) => a.code === counterAccountFilter.value)
    parts.push(`حساب مقابل: ${acc?.name || ''}`)
  }
  if (dateRange.value.from || dateRange.value.to) parts.push(`بازه تاریخ: ${toJalaliDate(dateRange.value.from) || '...'} تا ${toJalaliDate(dateRange.value.to) || '...'}`)
  return parts.join(' | ')
})
</script>
