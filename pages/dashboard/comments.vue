<template>
  <div class="mx-auto max-w-4xl px-4 py-8">
    <h1 class="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">مدیریت نظرات محصولات</h1>

    <!-- فرم ساخت نظر ساختگی -->
    <div class="mb-8 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
      <h2 class="mb-3 text-lg font-semibold text-stone-800 dark:text-stone-100">+ ساخت نظر ویژه (ساختگی)</h2>
      <div class="space-y-3">
        <ProductAutocomplete :products="productsStore.products" :model-value="fakeForm.productId" @select="(p) => (fakeForm.productId = p.id)" />
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <BaseInput v-model="fakeForm.authorName" label="نام نمایشی" required />
          <SingleImageUploader v-model="fakeForm.authorAvatar" label="آواتار (اختیاری)" :upload-fn="authStore.uploadAvatar" />
        </div>
        <BaseTextarea v-model="fakeForm.content" label="متن نظر" :rows="3" required />
        <p v-if="fakeError" class="text-sm text-red-600">{{ fakeError }}</p>
        <BaseButton :loading="fakeSaving" @click="handleCreateFake">ثبت نظر ویژه</BaseButton>
      </div>
    </div>

    <!-- فیلتر -->
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <select v-model="statusFilter" class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100">
        <option value="pending">در انتظار تایید</option>
        <option value="approved">تاییدشده</option>
        <option value="all">همه</option>
      </select>
    </div>

    <SkeletonList v-if="commentsStore.loading" :rows="4" :with-image="false" />
    <div v-else class="space-y-3">
      <div v-for="c in filtered" :key="c.id" class="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
        <div class="mb-2 flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm">
            <img v-if="getCoverImage(c.products || {})" :src="getCoverImage(c.products || {})" class="h-8 w-8 rounded-lg object-cover" />
            <span class="font-medium text-stone-800 dark:text-stone-100">{{ c.products?.title || '—' }}</span>
          </div>
          <div class="flex gap-2">
            <button v-if="!c.is_approved" class="text-xs text-brand-600 hover:underline" @click="commentsStore.approveComment(c.id)">تایید</button>
            <button class="text-xs text-red-600 hover:underline" @click="commentsStore.deleteComment(c.id)">حذف</button>
          </div>
        </div>
        <p class="text-sm text-stone-700 dark:text-stone-300">
          <span class="font-medium">{{ c.author_name }}</span> {{ c.is_featured ? '(ویژه)' : '' }}: {{ c.content }}
        </p>
        <p class="mt-1 text-xs text-stone-400">{{ toJalaliDate(c.created_at) }}</p>
      </div>
      <p v-if="!filtered.length" class="p-6 text-center text-stone-500">نظری یافت نشد.</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useCommentsStore } from '~/stores/comments'
import { useProductsStore } from '~/stores/products'
import { useAuthStore } from '~/stores/auth'
import ProductAutocomplete from '~/components/common/ProductAutocomplete.vue'
import SingleImageUploader from '~/components/common/SingleImageUploader.vue'
import BaseInput from '~/components/common/BaseInput.vue'
import BaseTextarea from '~/components/common/BaseTextarea.vue'
import BaseButton from '~/components/common/BaseButton.vue'
import SkeletonList from '~/components/common/SkeletonList.vue'
import { getCoverImage } from '~/composables/useProductHelpers'
import { toJalaliDate } from '~/composables/useJalaliDate'

useSeoMeta({ title: 'مدیریت نظرات' })

const commentsStore = useCommentsStore()
const productsStore = useProductsStore()
const authStore = useAuthStore()

const statusFilter = ref('pending')

const fakeForm = reactive({ productId: '', authorName: '', authorAvatar: '', content: '' })
const fakeSaving = ref(false)
const fakeError = ref('')

onMounted(async () => {
  await productsStore.fetchProducts()
  await commentsStore.fetchAll()
})

const filtered = computed(() => {
  if (statusFilter.value === 'pending') return commentsStore.allComments.filter((c) => !c.is_approved)
  if (statusFilter.value === 'approved') return commentsStore.allComments.filter((c) => c.is_approved)
  return commentsStore.allComments
})

async function handleCreateFake() {
  fakeError.value = ''
  if (!fakeForm.productId || !fakeForm.authorName || !fakeForm.content) {
    fakeError.value = 'محصول، نام و متن نظر را وارد کنید.'
    return
  }
  fakeSaving.value = true
  try {
    await commentsStore.createFakeComment({
      productId: fakeForm.productId,
      authorName: fakeForm.authorName,
      authorAvatar: fakeForm.authorAvatar,
      content: fakeForm.content
    })
    Object.assign(fakeForm, { productId: '', authorName: '', authorAvatar: '', content: '' })
    await commentsStore.fetchAll()
  } catch (e) {
    fakeError.value = 'خطا: ' + e.message
  } finally {
    fakeSaving.value = false
  }
}
</script>
