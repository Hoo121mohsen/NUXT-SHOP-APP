<template>
  <!--
    زیر قیمت خرید/فروش در فرم تعریف محصول نمایش داده می‌شود
    بر اساس نرخ ارزش افزوده تنظیم‌شده در بخش حسابداری (tax_settings.vat_rate) محاسبه می‌شود
  -->
  <p v-if="salePrice > 0" class="mt-1.5 text-xs leading-6 text-stone-500 dark:text-stone-400">
    بر اساس نرخ ارزش افزوده تنظیم‌شده ({{ vatRate }}٪): مبلغ ارزش افزوده
    <span class="font-medium text-stone-700 dark:text-stone-300">{{ formatToman(vatAmount) }} تومان</span>
    — سود خالص فروش (پس از کسر ارزش افزوده از قیمت فروش):
    <span class="font-medium text-brand-600 dark:text-brand-400">{{ formatToman(netProfit) }} تومان</span>
  </p>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useTaxSettingsStore } from '~/stores/taxSettings'

const props = defineProps({
  salePrice: { type: [Number, String], default: 0 }
})

const taxSettingsStore = useTaxSettingsStore()

const vatRate = computed(() => Number(taxSettingsStore.settings?.vat_rate ?? 9))

// مبلغ ارزش افزوده = درصد ارزش افزوده روی قیمت فروش
const vatAmount = computed(() => {
  const price = Number(props.salePrice) || 0
  return Math.round((price * vatRate.value) / 100)
})

// سود خالص فروش = قیمت فروش منهای ارزش افزوده
const netProfit = computed(() => {
  const price = Number(props.salePrice) || 0
  return price - vatAmount.value
})

function formatToman(amount) {
  return (amount || 0).toLocaleString('fa-IR')
}

onMounted(() => {
  if (!taxSettingsStore.loaded) taxSettingsStore.fetchSettings()
})
</script>
