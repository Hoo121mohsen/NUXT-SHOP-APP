<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">گردش کالا (انبارداری)</h1>

    <!-- جستجو: بر اساس محصول (نام/شناسه) و/یا بر اساس نام خریدار -->
    <div class="mb-6 grid gap-4 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-2 dark:border-stone-700 dark:bg-stone-800">
      <div>
        <label class="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">جستجوی محصول (نام یا شناسه)</label>
        <ProductAutocomplete :products="productsStore.products" :model-value="selectedProductId" @select="onSelectProduct" />
        <button v-if="selectedProductId" type="button" class="mt-1 text-xs text-red-500 hover:underline" @click="clearProduct">پاک کردن انتخاب محصول</button>
      </div>
      <div>
        <label class="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">جستجوی خریدار (نام مشتری)</label>
        <input
          v-model="buyerSearch"
          type="text"
          placeholder="مثلا: علی محمدی"
          class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          @keyup.enter="runSearch"
        />
        <p class="mt-1 text-xs text-stone-400">می‌توانید همزمان با محصول ترکیب کنید، یا تنها با نام خریدار، گردش همه کالاهای او را ببینید.</p>
      </div>
    </div>

    <div class="mb-6">
      <BaseButton @click="runSearch">جستجو</BaseButton>
    </div>

    <div v-if="hasSearched" class="grid gap-6" :class="selectedProduct ? 'md:grid-cols-3' : ''">
      <!-- برچسب انبار با بارکد مربعی (QR) - فقط وقتی دقیقاً یک محصول انتخاب شده باشد -->
      <div v-if="selectedProduct" class="rounded-xl border border-stone-200 bg-white p-5 text-center dark:border-stone-700 dark:bg-stone-800">
        <img :src="getCoverImage(selectedProduct)" class="mx-auto mb-3 h-20 w-20 rounded-lg object-cover" />
        <p class="mb-3 text-sm font-medium text-stone-800 dark:text-stone-100">{{ selectedProduct.title }}</p>
        <MatrixBarcode :value="selectedProduct.id" :size="140" />
        <p class="mt-2 text-xs text-stone-400">برچسب انبار - برای اسکن با بارکدخوان</p>
        <p class="mt-3 text-sm">
          موجودی فعلی:
          <span class="font-bold" :class="selectedProduct.stock_quantity > 0 ? 'text-brand-600' : 'text-red-500'">
            {{ selectedProduct.stock_quantity.toLocaleString('fa-IR') }}
          </span>
        </p>
      </div>

      <!-- جدول گردش کالا -->
      <div :class="selectedProduct ? 'md:col-span-2' : ''">
        <SkeletonTable v-if="inventoryStore.loading" :rows="5" :columns="5" :with-image="selectedProduct ? false : true" />
        <div v-else class="overflow-x-auto rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
          <table class="w-full text-right text-sm">
            <thead class="border-b border-stone-200 bg-stone-50 text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
              <tr>
                <th v-if="!selectedProduct" class="px-4 py-3">محصول</th>
                <th class="px-4 py-3">تاریخ</th>
                <th class="px-4 py-3">نوع حرکت</th>
                <th class="px-4 py-3">رنگ</th>
                <th class="px-4 py-3">تغییر موجودی</th>
                <th class="px-4 py-3">مرجع</th>
                <th class="px-4 py-3">انبار</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in inventoryStore.movements" :key="m.id" class="border-b border-stone-100 last:border-0 dark:border-stone-700">
                <td v-if="!selectedProduct" class="px-4 py-3">
                  <ProductNameHover v-if="m.products" :title="m.products.title" :image="getCoverImage(m.products)" />
                  <span v-else class="text-stone-300">—</span>
                </td>
                <td class="px-4 py-3 text-stone-600 dark:text-stone-400">{{ toJalaliDate(m.created_at) }}</td>
                <td class="px-4 py-3">
                  <span class="rounded-md px-2 py-0.5 text-xs font-medium" :class="reasonStyle(m.reason)">
                    {{ reasonLabel(m.reason) }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <span v-if="m.product_colors" class="inline-flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300">
                    <span class="h-3 w-3 rounded-full border border-stone-200" :style="{ backgroundColor: m.product_colors.color_hex }" />
                    {{ m.product_colors.color_name }}
                  </span>
                  <span v-else class="text-stone-300">—</span>
                </td>
                <td class="px-4 py-3 font-medium" :class="m.change_qty > 0 ? 'text-brand-600' : 'text-red-500'">
                  {{ m.change_qty > 0 ? '+' : '' }}{{ m.change_qty.toLocaleString('fa-IR') }}
                </td>
                <td class="px-4 py-3 text-stone-600 dark:text-stone-400">{{ m.referenceLabel }}</td>
                <td class="px-4 py-3 text-stone-600 dark:text-stone-400">{{ m.warehouses?.name || '—' }}</td>
              </tr>
            </tbody>
          </table>
          <p v-if="!inventoryStore.movements.length" class="p-6 text-center text-stone-500">گردشی با این جستجو یافت نشد.</p>
        </div>
      </div>
    </div>

    <p v-else class="text-stone-500">برای مشاهده گزارش گردش کالا، یک محصول یا نام خریدار را جستجو کنید.</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '~/stores/products'
import { useInventoryStore } from '~/stores/inventory'
import BaseButton from '~/components/common/BaseButton.vue'
import SkeletonTable from '~/components/common/SkeletonTable.vue'
import MatrixBarcode from '~/components/common/MatrixBarcode.vue'
import ProductAutocomplete from '~/components/common/ProductAutocomplete.vue'
import ProductNameHover from '~/components/common/ProductNameHover.vue'
import { getCoverImage } from '~/composables/useProductHelpers'
import { toJalaliDate } from '~/composables/useJalaliDate'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'گردش کالا' })

const productsStore = useProductsStore()
const inventoryStore = useInventoryStore()

const selectedProductId = ref('')
const buyerSearch = ref('')
const hasSearched = ref(false)

const selectedProduct = computed(() =>
  productsStore.products.find((p) => p.id === selectedProductId.value)
)

onMounted(() => {
  productsStore.fetchProducts()
})

function onSelectProduct(product) {
  selectedProductId.value = product.id
}
function clearProduct() {
  selectedProductId.value = ''
}

async function runSearch() {
  const buyer = buyerSearch.value.trim()
  if (buyer) {
    hasSearched.value = true
    await inventoryStore.fetchMovementsForBuyer(buyer, selectedProductId.value || null)
  } else if (selectedProductId.value) {
    hasSearched.value = true
    await inventoryStore.fetchMovementsForProduct(selectedProductId.value)
  }
}

function reasonLabel(reason) {
  return { initial: 'موجودی اولیه', purchase: 'خرید (ورود)', sale: 'فروش (خروج)', adjustment: 'اصلاحیه' }[reason] || reason
}
function reasonStyle(reason) {
  if (reason === 'sale') return 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  return 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
}
</script>
