<template>
  <div class="flex items-center gap-4 border-b border-stone-200 py-4 dark:border-stone-700">
    <img :src="item.image || 'https://placehold.co/100'" class="h-16 w-16 rounded-lg object-cover" />
    <div class="flex-1">
      <h4 class="text-sm font-medium text-stone-800 dark:text-stone-100">{{ item.title }}</h4>
      <p v-if="item.color_name" class="mt-0.5 flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
        <span class="h-3 w-3 rounded-full border" :style="{ backgroundColor: item.color_hex, borderColor: item.color_hex }" />
        رنگ: {{ item.color_name }}
      </p>
      <p class="text-sm text-stone-500 dark:text-stone-400">{{ Number(item.price).toLocaleString('fa-IR') }} تومان</p>
    </div>
    <div class="flex items-center gap-2">
      <button @click="$emit('update-qty', item.id, item.quantity + 1, item.color_id)" class="h-7 w-7 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300">+</button>
      <span class="w-6 text-center dark:text-stone-200">{{ item.quantity }}</span>
      <button @click="$emit('update-qty', item.id, item.quantity - 1, item.color_id)" class="h-7 w-7 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300">-</button>
    </div>
    <button @click="$emit('remove', item.id, item.color_id)" class="text-sm text-red-500 hover:text-red-700">حذف</button>
  </div>
</template>

<script setup>
defineProps({ item: { type: Object, required: true } })
defineEmits(['update-qty', 'remove'])
</script>
