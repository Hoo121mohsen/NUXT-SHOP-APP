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

      <div class="flex justify-between border-t border-stone-200 pt-4 font-bold text-stone-800 dark:border-stone-700 dark:text-stone-100">
        <span>مبلغ قابل پرداخت</span>
        <span>{{ Number(cartStore.totalPrice).toLocaleString('fa-IR') }} تومان</span>
      </div>

      <BaseButton type="submit" class="w-full" :loading="submitting">ثبت سفارش</BaseButton>
      <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useProductsStore } from '~/stores/products'
import { useOrdersStore } from '~/stores/orders'
import BaseInput from '~/components/common/BaseInput.vue'
import BaseButton from '~/components/common/BaseButton.vue'

useSeoMeta({ title: 'تکمیل خرید' })

const cartStore = useCartStore()
const authStore = useAuthStore()
const productsStore = useProductsStore()
const ordersStore = useOrdersStore()

const fullName = ref('')
const phone = ref('')
const address = ref('')
const submitting = ref(false)
const successOrderNumber = ref('')
const errorMsg = ref('')

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

  // یکپارچگی با انبار و حسابداری: کاهش موجودی هر کالا + ثبت گردش کالا (فروش) + ثبت درآمد فروش
  try {
    await productsStore.decreaseStockForOrder(cartStore.items, order.id)
    await ordersStore.createOrderItems(order.id, cartStore.items)
  } catch (e) {
    // اگر ثبت گردش کالا با خطا مواجه شد، سفارش همچنان ثبت شده باقی می‌ماند
  }

  submitting.value = false
  successOrderNumber.value = order.order_number
  cartStore.clearCart()
}
</script>
