<template>
  <div>
    <label v-if="label" class="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">{{ label }}</label>
    <div class="flex items-center gap-2">
      <select v-model.number="year" class="jdi-select" @change="emitChange">
        <option value="">سال</option>
        <option v-for="y in years" :key="y" :value="y">{{ toFa(y) }}</option>
      </select>
      <select v-model.number="month" class="jdi-select" @change="emitChange">
        <option value="">ماه</option>
        <option v-for="(m, idx) in jalaliMonthNames" :key="idx" :value="idx + 1">{{ m }}</option>
      </select>
      <select v-model.number="day" class="jdi-select" @change="emitChange">
        <option value="">روز</option>
        <option v-for="d in 31" :key="d" :value="d">{{ toFa(d) }}</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import jalaali from 'jalaali-js'
import { jalaliMonthNames } from '~/composables/useJalaliDate'

// modelValue: رشته تاریخ میلادی 'YYYY-MM-DD' (یا خالی) - همانند input[type=date] استاندارد
const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const currentJalaliYear = jalaali.toJalaali(new Date()).jy
const years = Array.from({ length: 6 }, (_, i) => currentJalaliYear - i)

const year = ref('')
const month = ref('')
const day = ref('')

function toFa(n) {
  return String(n).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d])
}

function hydrate() {
  if (props.modelValue) {
    const j = jalaali.toJalaali(new Date(props.modelValue))
    year.value = j.jy
    month.value = j.jm
    day.value = j.jd
  } else {
    // پیش‌فرض: امروز
    const j = jalaali.toJalaali(new Date())
    year.value = j.jy
    month.value = j.jm
    day.value = j.jd
    emitChange()
  }
}
hydrate()

function emitChange() {
  if (year.value && month.value && day.value) {
    const g = jalaali.toGregorian(year.value, month.value, day.value)
    emit('update:modelValue', `${g.gy}-${String(g.gm).padStart(2, '0')}-${String(g.gd).padStart(2, '0')}`)
  }
}

watch(() => props.modelValue, (val) => {
  if (!val) hydrate()
})
</script>

<style scoped>
.jdi-select {
  border-radius: 0.5rem;
  border: 1px solid rgb(214 211 209);
  background: white;
  padding: 0.45rem 0.5rem;
  font-size: 0.875rem;
  flex: 1;
}
.dark .jdi-select {
  border-color: rgb(87 83 78);
  background: rgb(28 25 23);
  color: rgb(231 229 228);
}
</style>
