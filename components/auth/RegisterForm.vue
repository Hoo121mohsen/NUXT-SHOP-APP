<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <BaseInput v-model="email" label="ایمیل" type="email" required />
    <BaseInput v-model="password" label="رمز عبور" type="password" required />
    <p v-if="authStore.error" class="text-sm text-red-600">{{ authStore.error }}</p>
    <BaseButton type="submit" class="w-full" :loading="authStore.loading">ثبت‌نام</BaseButton>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import BaseInput from '../common/BaseInput.vue'
import BaseButton from '../common/BaseButton.vue'

const email = ref('')
const password = ref('')
const authStore = useAuthStore()
const router = useRouter()

async function handleSubmit() {
  const ok = await authStore.register(email.value, password.value)
  if (ok) router.push('/')
}
</script>
