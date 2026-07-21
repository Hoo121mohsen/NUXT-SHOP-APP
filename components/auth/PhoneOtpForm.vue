<template>
  <div class="space-y-4">
    <template v-if="step === 'phone'">
      <BaseInput v-model="phone" label="شماره موبایل" type="tel" placeholder="09xxxxxxxxx" required />
      <p v-if="phoneAuthStore.error" class="text-sm text-red-600">{{ phoneAuthStore.error }}</p>
      <BaseButton class="w-full" :loading="phoneAuthStore.loading" @click="handleSendCode">
        دریافت کد تایید پیامکی
      </BaseButton>
    </template>

    <template v-else>
      <p class="text-sm text-stone-600 dark:text-stone-400">
        کد ۶ رقمی ارسال‌شده به شماره <span dir="ltr" class="font-mono">{{ phone }}</span> را وارد کنید.
      </p>
      <BaseInput v-model="code" label="کد تایید" type="text" placeholder="------" required />
      <p v-if="phoneAuthStore.error" class="text-sm text-red-600">{{ phoneAuthStore.error }}</p>
      <BaseButton class="w-full" :loading="phoneAuthStore.loading" @click="handleVerify">تایید و ورود</BaseButton>
      <button type="button" class="w-full text-center text-xs text-stone-500 hover:underline" @click="step = 'phone'">
        اصلاح شماره موبایل
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePhoneAuthStore } from '~/stores/phoneAuth'
import { useAuthStore } from '~/stores/auth'
import BaseInput from '../common/BaseInput.vue'
import BaseButton from '../common/BaseButton.vue'

const props = defineProps({
  purpose: { type: String, default: 'login' } // login | register
})
const emit = defineEmits(['success'])

const phoneAuthStore = usePhoneAuthStore()
const authStore = useAuthStore()

const step = ref('phone')
const phone = ref('')
const code = ref('')

async function handleSendCode() {
  if (!phone.value.trim()) return
  const ok = await phoneAuthStore.sendOtp(phone.value.trim(), props.purpose)
  if (ok) step.value = 'code'
}

async function handleVerify() {
  if (!code.value.trim()) return
  const ok = await phoneAuthStore.verifyOtp(phone.value.trim(), code.value.trim())
  if (ok) {
    await authStore.fetchUser()
    emit('success')
  }
}
</script>
