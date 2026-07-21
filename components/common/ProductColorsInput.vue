<template>
  <!--
    رنگ‌بندی محصول:
    - چک‌باکس بالا: آیا محصول اصلا تنوع رنگی دارد؟
      - فعال: لیست دینامیک رنگ‌ها (قطره‌چکان + دراپ‌داون رنگ‌های متعارف + تعداد هر رنگ)
      - غیرفعال: فقط یک اینپوت تعداد کل (متن چک‌باکس به «فاقد تنوع رنگی» تغییر می‌کند)
    جمع تعداد همه رنگ‌ها (یا تعداد واحد در حالت فاقد تنوع) = موجودی کل محصول
  -->
  <div>
    <label class="mb-3 flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700 dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-300">
      <input
        :checked="hasVariants"
        type="checkbox"
        class="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
        @change="toggleHasVariants($event.target.checked)"
      />
      {{ hasVariants ? 'این محصول تنوع رنگی دارد' : 'فاقد تنوع رنگی' }}
    </label>

    <!-- ===================== حالت فاقد تنوع رنگی: فقط تعداد ===================== -->
    <div v-if="!hasVariants" class="rounded-lg border border-stone-200 p-3 dark:border-stone-700">
      <label class="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">تعداد موجودی</label>
      <input
        :value="simpleQuantity"
        type="number"
        min="0"
        placeholder="تعداد"
        class="w-32 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
        @input="updateSimpleQuantity($event.target.value)"
      />
    </div>

    <!-- ===================== حالت دارای تنوع رنگی ===================== -->
    <template v-else>
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

          <!-- دراپ‌داون رنگ‌های متعارف؛ با انتخاب هر گزینه، نام و هگز رنگ به‌طور خودکار ست می‌شود -->
          <select
            :value="isPredefined(row.name) ? row.name : '__custom__'"
            class="w-36 rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
            @change="handlePresetChange(idx, $event.target.value)"
          >
            <option value="__custom__">سایر (تایپی)</option>
            <option v-for="c in presetColors" :key="c.name" :value="c.name">{{ c.name }}</option>
          </select>

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
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ColorPicker from './ColorPicker.vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] }, // آرایه‌ای از {name, hex, quantity}
  hasColorVariants: { type: Boolean, default: true },
  simpleQuantity: { type: [Number, String], default: 0 } // تعداد کل، فقط در حالت فاقد تنوع رنگی
})
const emit = defineEmits(['update:modelValue', 'update:hasColorVariants', 'update:simpleQuantity'])

// رنگ‌های متعارف پیش‌فرض که ادمین می‌تواند به‌جای تایپ، از دراپ‌داون انتخاب کند
const presetColors = [
  { name: 'آبی', hex: '#1d4ed8' },
  { name: 'قرمز', hex: '#dc2626' },
  { name: 'زرد', hex: '#eab308' },
  { name: 'سبز', hex: '#16a34a' },
  { name: 'بنفش', hex: '#9333ea' },
  { name: 'سورمه‌ای', hex: '#1e3a5f' },
  { name: 'سفید', hex: '#ffffff' },
  { name: 'مشکی', hex: '#000000' },
  { name: 'نارنجی', hex: '#f97316' },
  { name: 'قهوه‌ای', hex: '#78350f' }
]

function isPredefined(name) {
  return presetColors.some((c) => c.name === name)
}

const hasVariants = ref(props.hasColorVariants !== false)

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

// انتخاب یک رنگ متعارف از دراپ‌داون: نام و هگز به‌طور خودکار پر می‌شود، فقط تعداد باقی می‌ماند برای کاربر
function handlePresetChange(idx, selected) {
  if (selected === '__custom__') return
  const preset = presetColors.find((c) => c.name === selected)
  if (!preset) return
  rows.value[idx].name = preset.name
  rows.value[idx].hex = preset.hex
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

function toggleHasVariants(checked) {
  hasVariants.value = checked
  emit('update:hasColorVariants', checked)
}

function updateSimpleQuantity(value) {
  emit('update:simpleQuantity', Number(value) || 0)
}

watch(
  () => props.hasColorVariants,
  (val) => { hasVariants.value = val !== false }
)

watch(
  () => props.modelValue,
  (val) => {
    if (val && val.length && JSON.stringify(val) !== JSON.stringify(rows.value)) {
      rows.value = val.map((r) => ({ ...r }))
    }
  }
)
</script>
