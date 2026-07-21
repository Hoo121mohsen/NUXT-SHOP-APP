<template>
  <div class="mt-5">
    <div class="mb-4 flex items-center gap-3">
      <span class="h-px flex-1 bg-stone-200 dark:bg-stone-700"></span>
      <span class="text-xs text-stone-400">یا ادامه با</span>
      <span class="h-px flex-1 bg-stone-200 dark:bg-stone-700"></span>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <button
        type="button"
        class="flex items-center justify-center gap-2 rounded-lg border border-stone-300 py-2 text-sm text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
        @click="authStore.signInWithOAuth('google')"
      >
        <i class="fa-brands fa-google text-red-500"></i> حساب Google
      </button>
      <button
        type="button"
        class="flex items-center justify-center gap-2 rounded-lg border border-stone-300 py-2 text-sm text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
        @click="authStore.signInWithOAuth('apple')"
      >
        <i class="fa-brands fa-apple"></i> Apple ID
      </button>
    </div>
    <p class="mt-2 text-center text-[11px] text-stone-400">
      Google برای گوشی‌های اندروید و Apple ID برای گوشی‌های آیفون
    </p>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
const authStore = useAuthStore()
</script>
