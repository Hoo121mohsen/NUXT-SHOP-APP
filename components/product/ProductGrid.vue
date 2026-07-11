<template>
  <!-- گرید معمولی محصولات (چند ردیفه) - برای بخش محصولات رندم صفحه اول -->
  <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
    <ProductCard v-for="p in products" :key="p.id" :product="p" />
  </div>
</template>

<script setup>
import ProductCard from './ProductCard.vue'
defineProps({
  products: { type: Array, required: true }
})
</script>
