<template>
  <!-- با تایپ نام محصول، از بین محصولات از‌پیش‌تعریف‌شده جستجو و پیشنهاد می‌شود -->
  <div class="relative">
    <input
      v-model="searchText"
      type="text"
      placeholder="نام محصول را تایپ کنید..."
      class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
      @focus="open = true"
      @input="open = true"
      @blur="onBlur"
    />

    <ul
      v-if="open && filtered.length"
      class="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-stone-200 bg-white shadow-lg dark:border-stone-700 dark:bg-stone-800"
    >
      <li
        v-for="p in filtered"
        :key="p.id"
        class="cursor-pointer px-3 py-2 text-sm hover:bg-brand-50 dark:text-stone-100 dark:hover:bg-stone-700"
        @mousedown.prevent="select(p)"
      >
        {{ p.title }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  products: { type: Array, default: () => [] },
  modelValue: { type: String, default: '' } // product_id
})
const emit = defineEmits(['update:modelValue', 'select'])

const searchText = ref('')
const open = ref(false)

// اگر از بیرون product_id تغییر کرد (مثلا ریست فرم)، متن جستجو هم به‌روز شود
watch(
  () => props.modelValue,
  (id) => {
    if (!id) {
      searchText.value = ''
      return
    }
    const found = props.products.find((p) => p.id === id)
    if (found) searchText.value = found.title
  }
)

const filtered = computed(() => {
  const term = searchText.value.trim().toLowerCase()
  if (!term) return props.products.slice(0, 8)
  return props.products.filter((p) => p.title.toLowerCase().includes(term)).slice(0, 8)
})

function select(product) {
  searchText.value = product.title
  open.value = false
  emit('update:modelValue', product.id)
  emit('select', product)
}

function onBlur() {
  // کمی تاخیر تا کلیک روی گزینه قبل از بسته شدن لیست ثبت شود
  setTimeout(() => (open.value = false), 150)
}
</script>
