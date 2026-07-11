<template>
  <!-- دکمه تغییر حالت روز/شب -->
  <button
    @click="toggle"
    class="flex h-9 w-9 items-center justify-center rounded-full text-lg text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
    :title="isDark ? 'حالت روز' : 'حالت شب'"
  >
    <span v-if="isDark">☀️</span>
    <span v-else>🌙</span>
  </button>
</template>

<script setup>
const { isDark, toggle } = useDarkMode()
</script>
