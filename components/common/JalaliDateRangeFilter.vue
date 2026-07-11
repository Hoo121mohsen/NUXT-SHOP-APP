<template>
  <!-- فیلتر بازه تاریخ شمسی (از تاریخ - تا تاریخ) - خروجی همیشه تاریخ میلادی (ISO) برای فیلتر روی داده‌هاست -->
  <div class="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
    <span>از تاریخ:</span>
    <select v-model.number="fromYear" class="jdrf-select" @change="emitChange">
      <option value="">سال</option>
      <option v-for="y in years" :key="y" :value="y">{{ toFa(y) }}</option>
    </select>
    <select v-model.number="fromMonth" class="jdrf-select" @change="emitChange">
      <option value="">ماه</option>
      <option v-for="(m, idx) in jalaliMonthNames" :key="idx" :value="idx + 1">{{ m }}</option>
    </select>
    <select v-model.number="fromDay" class="jdrf-select" @change="emitChange">
      <option value="">روز</option>
      <option v-for="d in 31" :key="d" :value="d">{{ toFa(d) }}</option>
    </select>

    <span>تا تاریخ:</span>
    <select v-model.number="toYear" class="jdrf-select" @change="emitChange">
      <option value="">سال</option>
      <option v-for="y in years" :key="y" :value="y">{{ toFa(y) }}</option>
    </select>
    <select v-model.number="toMonth" class="jdrf-select" @change="emitChange">
      <option value="">ماه</option>
      <option v-for="(m, idx) in jalaliMonthNames" :key="idx" :value="idx + 1">{{ m }}</option>
    </select>
    <select v-model.number="toDay" class="jdrf-select" @change="emitChange">
      <option value="">روز</option>
      <option v-for="d in 31" :key="d" :value="d">{{ toFa(d) }}</option>
    </select>

    <button
      v-if="fromYear || toYear"
      type="button"
      class="text-red-500 hover:underline"
      @click="clearAll"
    >
      پاک کردن
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import jalaali from 'jalaali-js'
import { jalaliMonthNames } from '~/composables/useJalaliDate'

// modelValue: { from: 'YYYY-MM-DD' یا null (میلادی، برای فیلتر مستقیم روی created_at) , to: همینطور }
const props = defineProps({
  modelValue: { type: Object, default: () => ({ from: null, to: null }) }
})
const emit = defineEmits(['update:modelValue'])

const currentJalaliYear = jalaali.toJalaali(new Date()).jy
// یک بازه منطقی از سال‌های شمسی برای انتخاب (۵ سال قبل تا سال جاری)
const years = Array.from({ length: 6 }, (_, i) => currentJalaliYear - i)

const fromYear = ref('')
const fromMonth = ref('')
const fromDay = ref('')
const toYear = ref('')
const toMonth = ref('')
const toDay = ref('')

function toFa(n) {
  return String(n).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d])
}

// اگر مقدار اولیه از بیرون (میلادی) داده شده باشد، آن را به شمسی تبدیل و در select ها قرار می‌دهیم
function hydrateFromModelValue() {
  if (props.modelValue?.from) {
    const j = jalaali.toJalaali(new Date(props.modelValue.from))
    fromYear.value = j.jy
    fromMonth.value = j.jm
    fromDay.value = j.jd
  }
  if (props.modelValue?.to) {
    const j = jalaali.toJalaali(new Date(props.modelValue.to))
    toYear.value = j.jy
    toMonth.value = j.jm
    toDay.value = j.jd
  }
}
hydrateFromModelValue()

function emitChange() {
  let from = null
  let to = null

  if (fromYear.value && fromMonth.value && fromDay.value) {
    const g = jalaali.toGregorian(fromYear.value, fromMonth.value, fromDay.value)
    from = `${g.gy}-${String(g.gm).padStart(2, '0')}-${String(g.gd).padStart(2, '0')}`
  }
  if (toYear.value && toMonth.value && toDay.value) {
    const g = jalaali.toGregorian(toYear.value, toMonth.value, toDay.value)
    to = `${g.gy}-${String(g.gm).padStart(2, '0')}-${String(g.gd).padStart(2, '0')}`
  }

  emit('update:modelValue', { from, to })
}

function clearAll() {
  fromYear.value = ''
  fromMonth.value = ''
  fromDay.value = ''
  toYear.value = ''
  toMonth.value = ''
  toDay.value = ''
  emit('update:modelValue', { from: null, to: null })
}

watch(() => props.modelValue, (val, oldVal) => {
  // فقط وقتی از بیرون (نه از خود کامپوننت) ریست شده، همگام‌سازی کن
  if (!val?.from && !val?.to && (oldVal?.from || oldVal?.to)) {
    clearAll()
  }
})
</script>

<style scoped>
.jdrf-select {
  border-radius: 0.5rem;
  border: 1px solid rgb(214 211 209);
  background: white;
  padding: 0.3rem 0.4rem;
  font-size: 0.75rem;
}
.dark .jdrf-select {
  border-color: rgb(87 83 78);
  background: rgb(28 25 23);
  color: rgb(231 229 228);
}
</style>
