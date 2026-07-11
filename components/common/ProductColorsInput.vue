<template>
  <!--
    رنگ‌بندی محصول - لیست دینامیک (بدون محدودیت تعداد)
    هر ردیف: انتخاب‌گر رنگ (قطره‌چکان) + نام رنگ (تایپی) + تعداد موجودی همان رنگ
    جمع تعداد همه رنگ‌ها = موجودی کل محصول (برای یکپارچگی با سیستم انبار/حسابداری)
  -->
  <div>
    <div class="mb-2 flex items-center justify-between">
      <label class="block text-sm font-medium text-stone-700 dark:text-stone-300">رنگ‌بندی و موجودی هر رنگ</label>
      <span class="text-xs text-stone-400">جمع موجودی: {{ totalQuantity.toLocaleString('fa-IR') }} عدد</span>
    </div>

    <div class="space-y-2">
      <div
        v-for="(row, idx) in rows"
        :key="idx"
        class="flex items-center gap-2 rounded-lg border border-stone-200 p-2 dark:border-stone-700"
      >
        <ColorPicker :model-value="row.hex" @update:model-value="updateRow(idx, 'hex', $event)" />

        <input
          :value="row.name"
          type="text"
          placeholder="نام رنگ (مثلا قرمز)"
          class="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          @input="updateRow(idx, 'name', $event.target.value)"
        />

        <input
          :value="row.quantity"
          type="number"
          min="0"
          placeholder="تعداد"
          class="w-24 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
          @input="updateRow(idx, 'quantity', $event.target.value)"
        />

        <button
          type="button"
          class="text-stone-400 hover:text-red-500"
          :disabled="rows.length === 1"
          :class="rows.length === 1 ? 'opacity-30' : ''"
          @click="removeRow(idx)"
        >
          ✕
        </button>
      </div>
    </div>

    <button
      type="button"
      class="mt-2 text-sm text-brand-600 hover:underline dark:text-brand-400"
      @click="addRow"
    >
      + افزودن رنگ جدید
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ColorPicker from './ColorPicker.vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] } // آرایه‌ای از {name, hex, quantity}
})
const emit = defineEmits(['update:modelValue'])

function emptyRow() {
  return { name: '', hex: '#20a870', quantity: 0 }
}

// همیشه حداقل یک ردیف نمایش داده می‌شود
const rows = ref(props.modelValue.length ? props.modelValue.map((r) => ({ ...r })) : [emptyRow()])

const totalQuantity = computed(() =>
  rows.value.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0)
)

function emitChange() {
  emit('update:modelValue', rows.value)
}

function updateRow(idx, field, value) {
  rows.value[idx][field] = field === 'quantity' ? Number(value) || 0 : value
  emitChange()
}

function addRow() {
  rows.value.push(emptyRow())
  emitChange()
}

function removeRow(idx) {
  if (rows.value.length === 1) return
  rows.value.splice(idx, 1)
  emitChange()
}

watch(
  () => props.modelValue,
  (val) => {
    if (val && val.length && JSON.stringify(val) !== JSON.stringify(rows.value)) {
      rows.value = val.map((r) => ({ ...r }))
    }
  }
)
</script>
