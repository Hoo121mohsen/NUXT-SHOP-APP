<template>
  <div class="flex min-h-[70vh] items-center justify-center px-4">
    <div class="glass-strong w-full max-w-sm rounded-xl p-6 shadow-xl">
      <h1 class="mb-6 text-center text-xl font-bold text-stone-800 dark:text-stone-100">ورود به حساب کاربری</h1>
      <LoginForm />
      <p class="mt-4 text-center text-sm text-stone-500 dark:text-stone-400">
        حساب ندارید؟ <NuxtLink to="/register" class="text-brand-600 hover:underline">ثبت‌نام کنید</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import LoginForm from '~/components/auth/LoginForm.vue'
useSeoMeta({ title: 'ورود' })
</script>
