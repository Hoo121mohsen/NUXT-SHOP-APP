<template>
  <!--
    انتخاب‌گر رنگ ساده: خودِ دایره یک input[type=color] نیتیو مرورگر است
    با کلیک روی دایره، پالت کامل رنگ مرورگر (همراه با ابزار قطره‌چکان در کروم/اج) باز می‌شود
    بدون محدودیت تعداد رنگ و بدون پنجره سفارشی
  -->
  <input
    type="color"
    :value="modelValue || '#20a870'"
    class="color-swatch-input h-9 w-9 shrink-0 cursor-pointer rounded-full border-2 border-stone-300 dark:border-stone-600"
    :title="'انتخاب رنگ با قطره‌چکان'"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' }
})
defineEmits(['update:modelValue'])
</script>
