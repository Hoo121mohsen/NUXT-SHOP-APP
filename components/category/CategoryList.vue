<template>
  <!-- ردیف افقی اسکرول‌شونده از دسته‌بندی‌ها (عکس گرد + عنوان) - وسط‌چین وقتی جا دارد -->
  <div class="scrollbar-thin flex justify-center gap-4 overflow-x-auto pb-2">
    <CategoryCircle v-for="c in categories" :key="c.id" :category="c" />
  </div>
</template>

<script setup>
import CategoryCircle from './CategoryCircle.vue'
defineProps({
  categories: { type: Array, required: true }
})
</script>
