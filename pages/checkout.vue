<template>
  <div class="mx-auto max-w-3xl px-4 py-8">
    <h1 class="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">تکمیل خرید</h1>

    <!-- بعد از ثبت موفق: نمایش کد یکتای سفارش برای پیگیری -->
    <div v-if="successOrderNumber" class="rounded-xl border border-brand-200 bg-brand-50 p-6 text-center dark:border-brand-900 dark:bg-brand-900/20">
      <p class="text-lg font-bold text-brand-700 dark:text-brand-300">✅ سفارش شما با موفقیت ثبت شد!</p>
      <p class="mt-2 text-sm text-stone-600 dark:text-stone-300">کد پیگیری سفارش شما:</p>
      <p class="mt-1 select-all font-mono text-xl font-bold text-stone-800 dark:text-stone-100">{{ successOrderNumber }}</p>
      <p class="mt-3 text-xs text-stone-500 dark:text-stone-400">این کد را همراه با شماره تماستان برای پیگیری وضعیت سفارش نگه دارید.</p>
      <NuxtLink to="/track-order" class="mt-4 inline-block text-sm text-brand-600 hover:underline dark:text-brand-400">
        پیگیری وضعیت سفارش ←
      </NuxtLink>
    </div>

    <form v-else @submit.prevent="submitOrder" class="space-y-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
      <BaseInput v-model="fullName" label="نام و نام خانوادگی" required />
      <BaseInput v-model="phone" label="شماره تماس" required />
      <BaseInput v-model="address" label="آدرس کامل" required />

      <!-- درخواست فاکتور رسمی (اختیاری) -->
      <label class="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700 dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-300">
        <input v-model="needsOfficialInvoice" type="checkbox" class="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500" />
        نیاز به فاکتور رسمی (حقوقی) دارم
      </label>
      <div v-if="needsOfficialInvoice" class="grid gap-3 sm:grid-cols-3">
        <BaseInput v-model="buyerCompanyName" label="نام شرکت/سازمان" />
        <BaseInput v-model="buyerEconomicCode" label="شماره اقتصادی" />
        <BaseInput v-model="buyerNationalId" label="شناسه ملی" />
      </div>

      <!-- ریز مبلغ: مبلغ خالص + مالیات بر ارزش افزوده طبق آیین‌نامه سازمان امور مالیاتی -->
      <div class="space-y-1 border-t border-stone-200 pt-4 text-sm dark:border-stone-700">
        <div class="flex justify-between text-stone-600 dark:text-stone-400">
          <span>مبلغ خالص</span>
          <span>{{ formatToman(subtotal) }} تومان</span>
        </div>
        <div class="flex justify-between text-stone-600 dark:text-stone-400">
          <span>مالیات بر ارزش افزوده ({{ vatRate }}٪)</span>
          <span>{{ formatToman(vatAmount) }} تومان</span>
        </div>
        <div class="flex justify-between border-t border-stone-200 pt-2 font-bold text-stone-800 dark:border-stone-700 dark:text-stone-100">
          <span>مبلغ قابل پرداخت</span>
          <span>{{ formatToman(cartStore.totalPrice) }} تومان</span>
        </div>
      </div>

      <BaseButton type="submit" class="w-full" :loading="submitting">ثبت سفارش</BaseButton>
      <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useOrdersStore } from '~/stores/orders'
import { useTaxSettingsStore } from '~/stores/taxSettings'
import BaseInput from '~/components/common/BaseInput.vue'
import BaseButton from '~/components/common/BaseButton.vue'
import { formatToman } from '~/composables/useProductHelpers'

useSeoMeta({ title: 'تکمیل خرید' })

const cartStore = useCartStore()
const authStore = useAuthStore()
const ordersStore = useOrdersStore()
const taxSettingsStore = useTaxSettingsStore()

const fullName = ref('')
const phone = ref('')
const address = ref('')
const needsOfficialInvoice = ref(false)
const buyerCompanyName = ref('')
const buyerEconomicCode = ref('')
const buyerNationalId = ref('')
const submitting = ref(false)
const successOrderNumber = ref('')
const errorMsg = ref('')

const vatRate = ref(9)
onMounted(async () => {
  await taxSettingsStore.fetchSettings()
  vatRate.value = taxSettingsStore.settings.vat_rate ?? 9
})

// قیمت‌های سایت شامل مالیات فرض می‌شوند؛ مبلغ خالص و مالیات از دل مبلغ نهایی استخراج می‌شود
const subtotal = computed(() => Math.round(cartStore.totalPrice / (1 + Number(vatRate.value) / 100)))
const vatAmount = computed(() => cartStore.totalPrice - subtotal.value)

async function submitOrder() {
  submitting.value = true
  errorMsg.value = ''
  const supabase = useSupabase()
  const orderNumber = ordersStore.generateOrderNumber()

  const { data: order, error } = await supabase
    .from('orders')
    .insert([
      {
        order_number: orderNumber,
        user_id: authStore.user?.id,
        full_name: fullName.value,
        phone: phone.value,
        address: address.value,
        items: cartStore.items,
        total_price: cartStore.totalPrice,
        subtotal: subtotal.value,
        vat_rate: vatRate.value,
        vat_amount: vatAmount.value,
        needs_official_invoice: needsOfficialInvoice.value,
        buyer_company_name: needsOfficialInvoice.value ? buyerCompanyName.value : null,
        buyer_economic_code: needsOfficialInvoice.value ? buyerEconomicCode.value : null,
        buyer_national_id: needsOfficialInvoice.value ? buyerNationalId.value : null,
        status: 'pending'
      }
    ])
    .select()
    .single()

  if (error) {
    submitting.value = false
    errorMsg.value = 'خطا در ثبت سفارش: ' + error.message
    return
  }

  // در این لحظه هنوز وجهی دریافت نشده (وضعیت سفارش = «در انتظار تایید پرداخت»)
  // پس موجودی انبار کم نمی‌شود و سند حسابداری فروش صادر نمی‌شود؛ این کار زمانی انجام می‌شود که
  // ادمین وضعیت سفارش را به «تایید سفارش» تغییر دهد (یعنی پرداخت واقعاً تایید شده باشد)
  // فقط ردیف‌های نرمال‌شده سفارش (برای تفکیک فروشنده در پنل ادمین/تامین‌کننده) همین الان ثبت می‌شود
  try {
    await ordersStore.createOrderItems(order.id, cartStore.items)
  } catch (e) {
    // اگر ثبت ردیف‌های سفارش با خطا مواجه شد، سفارش همچنان ثبت شده باقی می‌ماند
  }

  submitting.value = false
  successOrderNumber.value = order.order_number
  cartStore.clearCart()
}
</script>
