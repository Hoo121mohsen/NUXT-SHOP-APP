<template>
  <!-- محصولات پیشنهادی رندم زیر صفحه جزئیات محصول -->
  <section class="mt-12">
    <h2 class="mb-4 text-center text-xl font-bold text-stone-800 dark:text-stone-100">محصولات پیشنهادی</h2>
    <SkeletonGrid v-if="loading" :count="10" />
    <template v-else-if="products.length">
      <ProductGrid :products="paginated" />
      <Pagination :current-page="currentPage" :total-pages="totalPages" @prev="prev" @next="next" @go-to="goTo" />
    </template>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '~/stores/products'
import ProductGrid from './ProductGrid.vue'
import SkeletonGrid from '../common/SkeletonGrid.vue'
import Pagination from '../common/Pagination.vue'
import { usePagination } from '~/composables/usePagination'

const props = defineProps({
  excludeId: { type: String, default: null }
})

const productsStore = useProductsStore()
const products = ref([])
const loading = ref(true)

const productsRef = computed(() => products.value)
const { currentPage, totalPages, paginated, goTo, next, prev } = usePagination(productsRef, 10)

onMounted(async () => {
  products.value = await productsStore.fetchRandomProducts(30, props.excludeId)
  loading.value = false
})
</script>
