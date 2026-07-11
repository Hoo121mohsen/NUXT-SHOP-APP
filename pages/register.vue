<template>
  <div class="flex min-h-[70vh] items-center justify-center px-4">
    <div class="glass-strong w-full max-w-sm rounded-xl p-6 shadow-xl">
      <h1 class="mb-6 text-center text-xl font-bold text-stone-800 dark:text-stone-100">ساخت حساب کاربری جدید</h1>
      <RegisterForm />
      <p class="mt-4 text-center text-sm text-stone-500 dark:text-stone-400">
        قبلا ثبت‌نام کرده‌اید؟ <NuxtLink to="/login" class="text-brand-600 hover:underline">وارد شوید</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import RegisterForm from '~/components/auth/RegisterForm.vue'
useSeoMeta({ title: 'ثبت‌نام' })
</script>
