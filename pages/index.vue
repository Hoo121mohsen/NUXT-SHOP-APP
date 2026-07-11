<template>
  <div class="mx-auto max-w-7xl px-4 py-6">
    <!-- ردیف دسته‌بندی‌ها: عکس گرد + عنوان - عنوان و ردیف از وسط صفحه -->
    <section class="mb-8">
      <h2 class="mb-3 text-center text-lg font-bold text-stone-800 dark:text-stone-100">دسته‌بندی‌ها</h2>
      <div v-if="categoriesStore.loading" class="flex justify-center gap-4 overflow-x-auto pb-2">
        <div v-for="i in 6" :key="i" class="flex w-20 shrink-0 flex-col items-center gap-2">
          <div class="skeleton h-16 w-16 rounded-full"></div>
          <div class="skeleton h-3 w-12 rounded"></div>
        </div>
      </div>
      <CategoryList v-else :categories="categoriesStore.categories" />
    </section>

    <!-- بخش محصولات دارای تخفیف - بین دسته‌بندی‌ها و محصولات پیشنهادی، به‌صورت یک ردیف افقی اسکرول‌شونده -->
    <section v-if="discountedProducts.length" class="mb-10">
      <h2 class="mb-3 text-center text-lg font-bold text-stone-800 dark:text-stone-100">
        محصولات دارای <span class="text-red-600">تخفیف</span>
      </h2>
      <HorizontalProductScroll :products="discountedProducts" />
    </section>

    <!-- محصولات پیشنهادی (رندم یا نتیجه جستجو/فیلتر دسته‌بندی) - عنوان از وسط + صفحه‌بندی -->
    <section>
      <h2 class="mb-3 text-center text-lg font-bold text-stone-800 dark:text-stone-100">
        {{ route.query.q ? `نتایج جستجو برای «${route.query.q}»` : 'محصولات پیشنهادی' }}
      </h2>
      <SkeletonGrid v-if="loadingMain" :count="15" />
      <p v-else-if="!mainProducts.length" class="text-center text-stone-500">محصولی یافت نشد.</p>
      <template v-else>
        <ProductGrid :products="paginated" />
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @prev="prev"
          @next="next"
          @go-to="goTo"
        />
      </template>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useProductsStore } from '~/stores/products'
import { useCategoriesStore } from '~/stores/categories'
import CategoryList from '~/components/category/CategoryList.vue'
import HorizontalProductScroll from '~/components/product/HorizontalProductScroll.vue'
import ProductGrid from '~/components/product/ProductGrid.vue'
import SkeletonGrid from '~/components/common/SkeletonGrid.vue'
import Pagination from '~/components/common/Pagination.vue'
import { usePagination } from '~/composables/usePagination'

useSeoMeta({
  title: 'فروشگاه من - خرید آنلاین با بهترین قیمت',
  description: 'خرید انواع محصولات با تنوع رنگی و ارسال سریع'
})

const route = useRoute()
const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()

const discountedProducts = ref([])
const mainProducts = ref([])
const loadingMain = ref(true)

// صفحه‌بندی محصولات پیشنهادی/جستجو - ۱۵ محصول در هر صفحه
const mainProductsRef = computed(() => mainProducts.value)
const { currentPage, totalPages, paginated, goTo, next, prev } = usePagination(mainProductsRef, 15)

async function loadMain() {
  loadingMain.value = true
  const supabase = useSupabase()

  if (route.query.q) {
    // جستجوی محصول بر اساس عنوان یا تگ‌ها - فقط محصولات منتشرشده
    const { data } = await supabase
      .from('products')
      .select('*, product_images(*), product_colors(*)')
      .eq('is_published', true)
      .ilike('title', `%${route.query.q}%`)
    mainProducts.value = data || []
  } else if (route.query.category) {
    const { data } = await supabase
      .from('products')
      .select('*, product_images(*), product_colors(*)')
      .eq('is_published', true)
      .eq('category_id', route.query.category)
    mainProducts.value = data || []
  } else {
    mainProducts.value = await productsStore.fetchRandomProducts(45)
  }
  loadingMain.value = false
}

onMounted(async () => {
  await categoriesStore.fetchCategories()
  await productsStore.fetchDiscountedProducts(15)
  discountedProducts.value = productsStore.discountedProducts
  await loadMain()
})

watch(() => route.query, loadMain)
</script>
