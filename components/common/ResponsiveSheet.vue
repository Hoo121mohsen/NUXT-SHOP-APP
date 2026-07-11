<template>
  <!-- در موبایل: popup از پایین صفحه بالا می‌آید (Bottom Sheet) - در دسکتاپ: مودال وسط صفحه -->
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <Transition name="sheet-backdrop" appear>
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('update:modelValue', false)" />
      </Transition>

      <Transition name="sheet-panel" appear>
        <div class="glass-strong relative z-10 max-h-[85vh] w-full overflow-y-auto rounded-t-2xl p-5 shadow-2xl sm:max-w-md sm:rounded-2xl">
          <!-- دستگیره کوچک بالای Bottom Sheet (فقط موبایل) -->
          <div class="mx-auto mb-3 h-1.5 w-12 rounded-full bg-stone-300 sm:hidden dark:bg-stone-600" />

          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-base font-semibold text-stone-800 dark:text-stone-100">{{ title }}</h3>
            <button class="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200" @click="$emit('update:modelValue', false)">✕</button>
          </div>

          <slot />
        </div>
      </Transition>
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

<style scoped>
.sheet-backdrop-enter-active,
.sheet-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-backdrop-enter-from,
.sheet-backdrop-leave-to {
  opacity: 0;
}

.sheet-panel-enter-active,
.sheet-panel-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.sheet-panel-enter-from,
.sheet-panel-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
@media (min-width: 640px) {
  .sheet-panel-enter-from,
  .sheet-panel-leave-to {
    transform: translateY(0.75rem) scale(0.97);
  }
}
</style>
