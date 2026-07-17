<template>
  <div class="mt-10 border-t border-stone-200 pt-8 dark:border-stone-700">
    <h2 class="mb-4 text-lg font-bold text-stone-800 dark:text-stone-100">نظرات کاربران</h2>

    <!-- فرم ثبت نظر جدید -->
    <div v-if="authStore.user" class="mb-6 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
      <textarea
        v-model="newComment"
        rows="3"
        placeholder="نظر خود را درباره این محصول بنویسید..."
        class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      />
      <div class="mt-2 flex items-center justify-between">
        <p v-if="successMsg" class="text-xs text-green-600">{{ successMsg }}</p>
        <BaseButton class="mr-auto" :loading="submitting" :disabled="!newComment.trim()" @click="handleSubmit">ثبت نظر</BaseButton>
      </div>
    </div>
    <NuxtLink v-else to="/login" class="mb-6 block rounded-xl border border-dashed border-stone-300 p-4 text-center text-sm text-stone-500 hover:border-brand-400 dark:border-stone-600">
      برای ثبت نظر، ابتدا وارد حساب کاربری خود شوید.
    </NuxtLink>

    <!-- لیست نظرات تاییدشده - نظرات ویژه (ادمین) ابتدا نمایش داده می‌شوند -->
    <SkeletonList v-if="commentsStore.loading" :rows="2" :with-image="false" />
    <p v-else-if="!commentsStore.comments.length" class="text-sm text-stone-400">هنوز نظری برای این محصول ثبت نشده است.</p>

    <div v-else class="space-y-3">
      <div
        v-for="c in commentsStore.comments"
        :key="c.id"
        class="rounded-xl border p-4"
        :class="c.is_featured ? 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10' : 'border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800'"
      >
        <div class="flex items-center gap-2">
          <img v-if="c.author_avatar" :src="c.author_avatar" class="h-8 w-8 rounded-full object-cover" />
          <i v-else class="fa-solid fa-circle-user text-2xl text-stone-400"></i>
          <div>
            <p class="text-sm font-medium text-stone-800 dark:text-stone-100">
              {{ c.author_name }}
              <span v-if="c.is_featured" class="mr-1 rounded-full bg-amber-200 px-1.5 py-0.5 text-[10px] text-amber-800">پیشنهاد ویژه</span>
            </p>
            <p class="text-[10px] text-stone-400">{{ toJalaliDate(c.created_at) }}</p>
          </div>
        </div>
        <p class="mt-2 text-sm text-stone-600 dark:text-stone-300">{{ c.content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useCommentsStore } from '~/stores/comments'
import BaseButton from '../common/BaseButton.vue'
import SkeletonList from '../common/SkeletonList.vue'
import { toJalaliDate } from '~/composables/useJalaliDate'

const props = defineProps({
  productId: { type: String, required: true }
})

const authStore = useAuthStore()
const commentsStore = useCommentsStore()

const newComment = ref('')
const submitting = ref(false)
const successMsg = ref('')

onMounted(async () => {
  await commentsStore.fetchApprovedForProduct(props.productId)
  await authStore.fetchUser()
})

async function handleSubmit() {
  if (!newComment.value.trim() || !authStore.user) return
  submitting.value = true
  successMsg.value = ''
  try {
    await commentsStore.submitComment({
      productId: props.productId,
      userId: authStore.user.id,
      authorName: authStore.profile?.display_name || authStore.user.email,
      content: newComment.value.trim()
    })
    newComment.value = ''
    successMsg.value = 'نظر شما ثبت شد و پس از تایید ادمین نمایش داده خواهد شد.'
  } finally {
    submitting.value = false
  }
}
</script>
