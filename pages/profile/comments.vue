<template>
  <div class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:flex-row">
    <ProfileSidebar />

    <div class="flex-1">
      <h1 class="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">نظرات من</h1>

      <SkeletonList v-if="loading" :rows="4" :with-image="false" />
      <p v-else-if="!comments.length" class="text-stone-500">هنوز نظری ثبت نکرده‌اید.</p>

      <div v-else class="space-y-3">
        <div v-for="c in comments" :key="c.id" class="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
          <div class="mb-2 flex items-center justify-between">
            <NuxtLink :to="`/products/${c.products?.id}`" class="flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline">
              <img v-if="getCoverImage(c.products || {})" :src="getCoverImage(c.products || {})" class="h-8 w-8 rounded-lg object-cover" />
              {{ c.products?.title || 'محصول حذف‌شده' }}
            </NuxtLink>
            <span class="rounded-full px-2 py-0.5 text-[11px] font-medium" :class="c.is_approved ? 'bg-brand-50 text-brand-700' : 'bg-amber-50 text-amber-700'">
              {{ c.is_approved ? 'تاییدشده' : 'در انتظار تایید' }}
            </span>
          </div>
          <p class="text-sm text-stone-700 dark:text-stone-300">{{ c.content }}</p>
          <p class="mt-2 text-xs text-stone-400">{{ toJalaliDate(c.created_at) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useCommentsStore } from '~/stores/comments'
import ProfileSidebar from '~/components/profile/ProfileSidebar.vue'
import SkeletonList from '~/components/common/SkeletonList.vue'
import { getCoverImage } from '~/composables/useProductHelpers'
import { toJalaliDate } from '~/composables/useJalaliDate'

useSeoMeta({ title: 'نظرات من' })

const authStore = useAuthStore()
const commentsStore = useCommentsStore()
const comments = ref([])
const loading = ref(true)

onMounted(async () => {
  await authStore.fetchUser()
  if (authStore.user) {
    comments.value = await commentsStore.fetchForUser(authStore.user.id)
  }
  loading.value = false
})
</script>
