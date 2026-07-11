<template>
  <div>
    <p class="mb-3 text-xs text-stone-500 dark:text-stone-400">
      از تنوع موجود؛ یکی را انتخاب و سپس تعداد آن را مشخص کنید. برای انتخاب تنوع بیشتر؛ بر روی «+ افزودن ردیف» کلیک کنید.
    </p>

    <!-- انتخاب رنگ فعلی -->
    <div class="mb-3 flex flex-wrap gap-2">
      <button
        v-for="c in colors"
        :key="c.id"
        type="button"
        class="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition"
        :class="pickerColorId === c.id
          ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
          : 'border-stone-300 text-stone-600 hover:border-brand-400 dark:border-stone-600 dark:text-stone-300'"
        :disabled="remainingStock(c) <= 0"
        :style="remainingStock(c) <= 0 ? 'opacity:0.4;cursor:not-allowed' : ''"
        @click="pickerColorId = c.id"
      >
        <span class="h-4 w-4 rounded-full border-2" :style="{ backgroundColor: c.color_hex, borderColor: c.color_hex }" />
        {{ c.color_name }}
        <span class="text-stone-400">({{ remainingStock(c) > 0 ? `${remainingStock(c)} عدد` : 'ناموجود' }})</span>
      </button>
    </div>

    <!-- تعداد + دکمه افزودن ردیف -->
    <div class="mb-4 flex items-center gap-2">
      <div class="flex items-center gap-2">
        <button type="button" class="h-8 w-8 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300" @click="pickerQty = Math.min(maxPickerQty, pickerQty + 1)">+</button>
        <span class="w-6 text-center dark:text-stone-200">{{ pickerQty }}</span>
        <button type="button" class="h-8 w-8 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300" @click="pickerQty = Math.max(1, pickerQty - 1)">-</button>
      </div>
      <BaseButton type="button" variant="secondary" :disabled="!pickerColorId || maxPickerQty <= 0" @click="addRow">
        + افزودن ردیف
      </BaseButton>
    </div>

    <!-- ردیف‌های اضافه‌شده -->
    <div v-if="rows.length" class="mb-4 space-y-2 border-t border-stone-200 pt-3 dark:border-stone-700">
      <div v-for="row in rows" :key="row.colorId" class="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2 text-sm dark:bg-stone-900/40">
        <div class="flex items-center gap-2">
          <span class="h-4 w-4 rounded-full border-2" :style="{ backgroundColor: row.hex, borderColor: row.hex }" />
          <span class="text-stone-700 dark:text-stone-200">{{ row.name }}</span>
          <span class="text-xs text-stone-400">× {{ row.quantity }}</span>
        </div>
        <button type="button" class="text-stone-400 hover:text-red-500" @click="removeRow(row.colorId)">✕</button>
      </div>
    </div>

    <p v-if="errorMsg" class="mb-2 text-xs text-red-600">{{ errorMsg }}</p>

    <!-- به‌محض انتخاب یک تنوع، این دکمه فعال می‌شود؛ نیازی نیست حتماً «افزودن ردیف» زده شود -->
    <BaseButton class="w-full" :disabled="!rows.length && !pickerColorId" @click="handleConfirm">
      افزودن به سبد خرید ({{ totalSelected }} عدد)
    </BaseButton>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseButton from '../common/BaseButton.vue'

const props = defineProps({
  colors: { type: Array, required: true } // [{id, color_name, color_hex, quantity}]
})
const emit = defineEmits(['confirm'])

const pickerColorId = ref('')
const pickerQty = ref(1)
const rows = ref([]) // [{colorId, name, hex, quantity}]
const errorMsg = ref('')

// موجودی باقی‌مانده یک رنگ با احتساب مقداری که از قبل در ردیف‌ها انتخاب شده
function remainingStock(color) {
  const already = rows.value.find((r) => r.colorId === color.id)?.quantity || 0
  return Math.max(0, color.quantity - already)
}

const maxPickerQty = computed(() => {
  const color = props.colors.find((c) => c.id === pickerColorId.value)
  return color ? remainingStock(color) : 1
})

// جمع تعداد ردیف‌های ثبت‌شده + تنوعی که هم‌اکنون انتخاب شده ولی هنوز ردیف نشده (برای نمایش دقیق روی دکمه)
const totalSelected = computed(() => {
  const rowsTotal = rows.value.reduce((sum, r) => sum + r.quantity, 0)
  if (!pickerColorId.value) return rowsTotal
  const alreadyInRows = rows.value.some((r) => r.colorId === pickerColorId.value)
  return alreadyInRows ? rowsTotal : rowsTotal + pickerQty.value
})

function addRow() {
  errorMsg.value = ''
  const color = props.colors.find((c) => c.id === pickerColorId.value)
  if (!color) {
    errorMsg.value = 'یک رنگ انتخاب کنید.'
    return
  }
  const qty = Math.min(pickerQty.value, remainingStock(color))
  if (qty <= 0) {
    errorMsg.value = 'موجودی این رنگ کافی نیست.'
    return
  }

  const existing = rows.value.find((r) => r.colorId === color.id)
  if (existing) {
    // اگر همین رنگ قبلا اضافه شده، به‌جای ردیف تکراری، تعدادش را جمع می‌زنیم
    existing.quantity = Math.min(color.quantity, existing.quantity + qty)
  } else {
    rows.value.push({ colorId: color.id, name: color.color_name, hex: color.color_hex, quantity: qty })
  }

  pickerColorId.value = ''
  pickerQty.value = 1
}

function removeRow(colorId) {
  rows.value = rows.value.filter((r) => r.colorId !== colorId)
}

// اگر کاربر فقط یک تنوع را انتخاب کرده و مستقیم «افزودن به سبد خرید» را بزند (بدون زدن «افزودن ردیف»)،
// همان انتخاب فعلی به‌طور خودکار به‌عنوان یک ردیف لحاظ می‌شود
function handleConfirm() {
  if (pickerColorId.value) {
    addRow()
  }
  if (!rows.value.length) return
  emit('confirm', rows.value)
  rows.value = []
}
</script>
