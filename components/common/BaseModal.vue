<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      @click.self="$emit('update:modelValue', false)"
    >
      <div class="glass-strong w-full max-w-md rounded-xl p-6 shadow-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-stone-800 dark:text-stone-100">{{ title }}</h3>
          <button @click="$emit('update:modelValue', false)" class="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">✕</button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' }
})
defineEmits(['update:modelValue'])
</script>
