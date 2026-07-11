<template>
  <!--
    ردیف افقی محصولات که فقط در یک خط قرار می‌گیرند و عرض صفحه اسکرول می‌شود
    (برای نمایش ۱۵ محصول تخفیف‌دار در صفحه اول)
  -->
  <div class="scrollbar-thin flex gap-4 overflow-x-auto pb-3">
    <div v-for="p in products" :key="p.id" class="w-40 shrink-0 sm:w-48">
      <ProductCard :product="p" />
    </div>
  </div>
</template>

<script setup>
import ProductCard from './ProductCard.vue'
defineProps({
  products: { type: Array, required: true }
})
</script>
