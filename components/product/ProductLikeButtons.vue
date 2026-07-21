<template>
  <!--
    نمایش لایک/دیس‌لایک با آیکون شست بالا/پایین در صفحه جزئیات محصول
    عدد لایک/دیس‌لایک از خودِ محصول (likes_count/dislikes_count) نمایش داده می‌شود که با
    trigger دیتابیس به‌محض ثبت رای جدید در جدول product_likes به‌روز می‌شود
  -->
  <div class="mt-4 flex items-center gap-4">
    <button
      type="button"
      class="flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition"
      :class="userVote === 'like'
        ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/30 dark:text-brand-300'
        : 'border-stone-300 text-stone-600 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800'"
      :disabled="voting"
      @click="vote('like')"
    >
      <i class="fa-solid fa-thumbs-up"></i>
      <span>{{ (likesCount).toLocaleString('fa-IR') }}</span>
    </button>

    <button
      type="button"
      class="flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition"
      :class="userVote === 'dislike'
        ? 'border-red-500 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-900/30 dark:text-red-300'
        : 'border-stone-300 text-stone-600 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800'"
      :disabled="voting"
      @click="vote('dislike')"
    >
      <i class="fa-solid fa-thumbs-down"></i>
      <span>{{ (dislikesCount).toLocaleString('fa-IR') }}</span>
    </button>

    <NuxtLink v-if="!authStore.user" to="/login" class="text-xs text-stone-400 hover:underline dark:text-stone-500">
      برای رای دادن وارد شوید
    </NuxtLink>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useProductsStore } from '~/stores/products'

const props = defineProps({
  productId: { type: String, required: true },
  initialLikes: { type: Number, default: 0 },
  initialDislikes: { type: Number, default: 0 }
})

const authStore = useAuthStore()
const productsStore = useProductsStore()

const likesCount = ref(props.initialLikes)
const dislikesCount = ref(props.initialDislikes)
const userVote = ref(null) // 'like' | 'dislike' | null
const voting = ref(false)

async function loadUserVote() {
  if (!authStore.user) return
  const existing = await productsStore.fetchUserVote(props.productId, authStore.user.id)
  userVote.value = existing?.like_type || null
}

async function vote(type) {
  if (!authStore.user) return
  if (voting.value) return
  voting.value = true

  const previousVote = userVote.value

  try {
    if (previousVote === type) {
      // کلیک دوباره روی همان دکمه = حذف رای
      await productsStore.removeVote(props.productId, authStore.user.id)
      userVote.value = null
      if (type === 'like') likesCount.value = Math.max(0, likesCount.value - 1)
      else dislikesCount.value = Math.max(0, dislikesCount.value - 1)
    } else {
      await productsStore.castVote(props.productId, authStore.user.id, type)
      // به‌روزرسانی آنی اعداد در همان لحظه، بدون نیاز به رفرش صفحه
      if (previousVote === 'like') likesCount.value = Math.max(0, likesCount.value - 1)
      if (previousVote === 'dislike') dislikesCount.value = Math.max(0, dislikesCount.value - 1)
      if (type === 'like') likesCount.value += 1
      else dislikesCount.value += 1
      userVote.value = type
    }
  } catch (e) {
    console.error('خطا در ثبت رای:', e)
  } finally {
    voting.value = false
  }
}

onMounted(loadUserVote)
</script>
