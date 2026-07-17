<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:flex-row">
    <ProfileSidebar />

    <div class="flex-1">
      <h1 class="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">پروفایل من</h1>

      <form @submit.prevent="handleSubmit" class="max-w-md space-y-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
        <SingleImageUploader v-model="avatarUrl" label="عکس پروفایل" :upload-fn="authStore.uploadAvatar" />
        <BaseInput v-model="displayName" label="نام نمایشی" />
        <BaseInput :model-value="authStore.user?.email" label="ایمیل" disabled />

        <p v-if="successMsg" class="text-sm text-green-600">{{ successMsg }}</p>
        <BaseButton type="submit" :loading="saving">ذخیره تغییرات</BaseButton>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import ProfileSidebar from '~/components/profile/ProfileSidebar.vue'
import SingleImageUploader from '~/components/common/SingleImageUploader.vue'
import BaseInput from '~/components/common/BaseInput.vue'
import BaseButton from '~/components/common/BaseButton.vue'

useSeoMeta({ title: 'پروفایل من' })

const authStore = useAuthStore()
const avatarUrl = ref('')
const displayName = ref('')
const saving = ref(false)
const successMsg = ref('')

onMounted(async () => {
  await authStore.fetchUser()
  avatarUrl.value = authStore.profile?.avatar_url || ''
  displayName.value = authStore.profile?.display_name || ''
})

async function handleSubmit() {
  successMsg.value = ''
  saving.value = true
  try {
    await authStore.updateProfile({ display_name: displayName.value, avatar_url: avatarUrl.value })
    successMsg.value = 'تغییرات ذخیره شد.'
  } finally {
    saving.value = false
  }
}
</script>
