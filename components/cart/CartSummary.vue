<template>
  <div class="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-700 dark:bg-stone-800">
    <h3 class="mb-4 text-lg font-semibold text-stone-800 dark:text-stone-100">خلاصه سفارش</h3>
    <div class="flex justify-between text-sm text-stone-600 dark:text-stone-400">
      <span>جمع کالاها</span>
      <span>{{ Number(subtotal).toLocaleString('fa-IR') }} تومان</span>
    </div>
    <div class="mt-2 flex justify-between text-sm text-stone-600 dark:text-stone-400">
      <span>هزینه ارسال</span>
      <span>رایگان</span>
    </div>
    <hr class="my-3 border-stone-200 dark:border-stone-700" />
    <div class="flex justify-between font-bold text-stone-800 dark:text-stone-100">
      <span>مبلغ نهایی</span>
      <span>{{ Number(subtotal).toLocaleString('fa-IR') }} تومان</span>
    </div>
    <BaseButton class="mt-4 w-full" @click="$emit('checkout')">ادامه فرآیند خرید</BaseButton>
  </div>
</template>

<script setup>
import BaseButton from '../common/BaseButton.vue'
defineProps({ subtotal: { type: Number, required: true } })
defineEmits(['checkout'])
</script>
