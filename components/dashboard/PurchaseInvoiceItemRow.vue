<template>
  <div class="space-y-3 rounded-lg border border-stone-200 p-3 dark:border-stone-700">
    <div class="flex items-start gap-2">
      <!-- ۱) جستجوی تایپی محصول از بین کالاهای از‌پیش‌تعریف‌شده -->
      <div class="flex-1">
        <label class="mb-1 block text-xs text-stone-500 dark:text-stone-400">محصول</label>
        <ProductAutocomplete
          :products="products"
          :model-value="row.product_id"
          @select="onSelectProduct"
        />
      </div>
      <button type="button" class="mt-6 text-red-500 hover:text-red-700" :disabled="disableRemove" :class="disableRemove ? 'opacity-30' : ''" @click="$emit('remove')">
        ✕
      </button>
    </div>

    <!-- ۲) انتخاب تنوع رنگ - هویت با نام رنگ است؛ دایره هگز فقط جهت نمایش -->
    <div v-if="selectedProduct && selectedProduct.product_colors?.length">
      <label class="mb-1 block text-xs text-stone-500 dark:text-stone-400">کدام رنگ‌بندی؟</label>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="c in selectedProduct.product_colors"
          :key="c.id"
          type="button"
          class="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition"
          :class="row.color_id === c.id
            ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
            : 'border-stone-300 text-stone-600 hover:border-brand-400 dark:border-stone-600 dark:text-stone-300'"
          @click="updateField('color_id', c.id)"
        >
          <span class="h-3.5 w-3.5 rounded-full border border-stone-200" :style="{ backgroundColor: c.color_hex }" />
          {{ c.color_name }}
          <span class="text-stone-400">(موجودی فعلی: {{ c.quantity }})</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <!-- ۳) تعداد خرید -->
      <div>
        <label class="mb-1 block text-xs text-stone-500 dark:text-stone-400">تعداد خرید</label>
        <input
          :value="row.quantity"
          type="number"
          min="1"
          class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          @input="updateField('quantity', $event.target.value)"
        />
      </div>

      <!-- قیمت خرید واحد (هزینه تمام‌شده - برای محاسبه بدهی فاکتور) -->
      <PriceInput :model-value="row.unit_price" label="قیمت خرید واحد (تومان)" @update:model-value="updateField('unit_price', $event)" />
    </div>

    <!-- ۴) تصمیم قیمت فروش سایت -->
    <div v-if="selectedProduct">
      <label class="mb-1 block text-xs text-stone-500 dark:text-stone-400">قیمت فروش این کالا در سایت</label>
      <div class="flex flex-wrap items-center gap-4">
        <label class="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300">
          <input type="radio" :checked="row.priceMode === 'current'" @change="updateField('priceMode', 'current')" />
          همان قیمت فعلی ({{ formatToman(selectedProduct.sale_price) }} تومان)
        </label>
        <label class="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300">
          <input type="radio" :checked="row.priceMode === 'new'" @change="updateField('priceMode', 'new')" />
          تعیین قیمت فروش جدید
        </label>
      </div>
      <PriceInput
        v-if="row.priceMode === 'new'"
        class="mt-2"
        :model-value="row.new_sale_price"
        label="قیمت فروش جدید (تومان)"
        @update:model-value="updateField('new_sale_price', $event)"
      />
    </div>

    <p class="text-left text-xs text-stone-500 dark:text-stone-400">
      جمع این ردیف: {{ formatToman((row.quantity || 0) * (row.unit_price || 0)) }} تومان
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProductAutocomplete from '../common/ProductAutocomplete.vue'
import PriceInput from '../common/PriceInput.vue'
import { formatToman } from '~/composables/useProductHelpers'

const props = defineProps({
  row: { type: Object, required: true },
  products: { type: Array, required: true },
  disableRemove: { type: Boolean, default: false }
})
const emit = defineEmits(['update', 'remove'])

const selectedProduct = computed(() => props.products.find((p) => p.id === props.row.product_id) || null)

function updateField(field, value) {
  emit('update', { ...props.row, [field]: value })
}

function onSelectProduct(product) {
  emit('update', {
    ...props.row,
    product_id: product.id,
    color_id: '',
    priceMode: 'current',
    new_sale_price: ''
  })
}
</script>
