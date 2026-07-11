<template>
  <div class="mx-auto max-w-2xl px-4 py-10">
    <h1 class="mb-6 text-center text-2xl font-bold text-stone-800 dark:text-stone-100">پیگیری سفارش</h1>

    <form @submit.prevent="handleTrack" class="mb-8 space-y-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
      <BaseInput v-model="orderNumber" label="کد پیگیری سفارش (مثلا ORD-4F82K9)" required />
      <BaseInput v-model="phone" label="شماره تماسی که هنگام سفارش وارد کردید" required />
      <BaseButton type="submit" class="w-full" :loading="loading">پیگیری سفارش</BaseButton>
      <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>
    </form>

    <!-- نتیجه پیگیری: نمایش وضعیت فعلی روی نوار مراحل -->
    <div v-if="order" class="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
      <div class="mb-4 flex items-center justify-between">
        <span class="font-mono text-sm text-stone-500 dark:text-stone-400">{{ order.order_number }}</span>
        <span class="rounded-md px-2 py-1 text-xs font-medium" :class="orderStatusColor(order.status)">
          {{ orderStatusLabel(order.status) }}
        </span>
      </div>

      <!-- نوار مراحل سفارش -->
      <ol class="space-y-3">
        <li v-for="(step, idx) in steps" :key="step.value" class="flex items-center gap-3">
          <span
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            :class="idx <= currentStepIndex ? 'bg-brand-600 text-white' : 'bg-stone-200 text-stone-500 dark:bg-stone-700 dark:text-stone-400'"
          >
            {{ idx <= currentStepIndex ? '✓' : idx + 1 }}
          </span>
          <span :class="idx <= currentStepIndex ? 'text-stone-800 dark:text-stone-100' : 'text-stone-400 dark:text-stone-500'">
            {{ step.label }}
          </span>
        </li>
      </ol>

      <p v-if="order.status === 'returned'" class="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
        این سفارش مرجوع شده است.
      </p>
      <p v-if="order.status === 'reviewing'" class="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
        سفارش شما در حال بررسی مجدد است.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useOrdersStore, ORDER_STATUSES, orderStatusLabel, orderStatusColor } from '~/stores/orders'
import BaseInput from '~/components/common/BaseInput.vue'
import BaseButton from '~/components/common/BaseButton.vue'

useSeoMeta({ title: 'پیگیری سفارش' })

const ordersStore = useOrdersStore()

const orderNumber = ref('')
const phone = ref('')
const loading = ref(false)
const errorMsg = ref('')
const order = ref(null)

// مراحل خطی گردش کار سفارش (بررسی مجدد/مرجوع شد خارج از این مسیر اصلی هستند)
const steps = ORDER_STATUSES.filter((s) => !['reviewing', 'returned'].includes(s.value))

const currentStepIndex = computed(() => {
  if (!order.value) return -1
  const idx = steps.findIndex((s) => s.value === order.value.status)
  if (idx !== -1) return idx
  // برای «بررسی مجدد» یا «مرجوع شد» فقط تا مرحله «تایید سفارش» را تکمیل‌شده نشان می‌دهیم
  return steps.findIndex((s) => s.value === 'confirmed')
})

async function handleTrack() {
  errorMsg.value = ''
  order.value = null
  loading.value = true
  const result = await ordersStore.trackOrder(orderNumber.value, phone.value)
  loading.value = false
  if (!result) {
    errorMsg.value = 'سفارشی با این مشخصات یافت نشد. کد پیگیری و شماره تماس را بررسی کنید.'
    return
  }
  order.value = result
}
</script>
