<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">مدیریت دسته‌بندی‌ها</h1>

    <!-- فرم افزودن/ویرایش دسته‌بندی -->
    <form
      @submit.prevent="handleSubmit"
      class="mb-8 max-w-lg space-y-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800"
    >
      <h2 class="text-lg font-semibold text-stone-800 dark:text-stone-100">
        {{ editingId ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید' }}
      </h2>

      <SingleImageUploader v-model="form.image_url" label="عکس دسته‌بندی (برای نور مخفی، PNG با زمینه شفاف پیشنهاد می‌شود)" :upload-fn="categoriesStore.uploadCategoryImage" />
      <BaseInput v-model="form.title" label="عنوان دسته‌بندی" required />
      <GlowColorPicker v-model="form.glow_color" />

      <!-- پیش‌نمایش زنده -->
      <div v-if="form.image_url" class="flex items-center gap-3 rounded-lg bg-stone-50 p-3 dark:bg-stone-900/40">
        <span class="text-xs text-stone-400">پیش‌نمایش:</span>
        <CategoryCircle :category="{ title: form.title || 'دسته‌بندی', image_url: form.image_url, glow_color: form.glow_color }" />
      </div>

      <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>
      <div class="flex gap-2">
        <BaseButton type="submit" :loading="saving">{{ editingId ? 'ذخیره تغییرات' : 'ذخیره دسته‌بندی' }}</BaseButton>
        <BaseButton v-if="editingId" type="button" variant="secondary" @click="resetForm">انصراف از ویرایش</BaseButton>
      </div>
    </form>

    <!-- نمایش دسته‌بندی‌های ثبت شده - دسته تازه ذخیره‌شده بلافاصله همینجا نمایش داده می‌شود -->
    <h2 class="mb-4 text-lg font-semibold text-stone-800 dark:text-stone-100">دسته‌بندی‌های ثبت‌شده</h2>
    <div v-if="categoriesStore.loading" class="flex flex-wrap gap-6">
      <div v-for="i in 4" :key="i" class="flex w-24 flex-col items-center gap-2">
        <div class="skeleton h-20 w-20 rounded-full"></div>
        <div class="skeleton h-3 w-16 rounded"></div>
      </div>
    </div>
    <p v-else-if="!categoriesStore.categories.length" class="text-stone-500">هنوز دسته‌بندی‌ای ثبت نشده است.</p>

    <div v-else class="flex flex-wrap gap-6">
      <div v-for="c in categoriesStore.categories" :key="c.id" class="flex w-24 flex-col items-center gap-2 text-center">
        <CategoryCircle :category="c" />
        <div class="flex gap-2">
          <button class="text-[10px] text-brand-600 hover:underline" @click="startEdit(c)">ویرایش</button>
          <button class="text-[10px] text-red-500 hover:underline" @click="handleDelete(c.id)">حذف</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useCategoriesStore } from '~/stores/categories'
import SingleImageUploader from '~/components/common/SingleImageUploader.vue'
import BaseInput from '~/components/common/BaseInput.vue'
import BaseButton from '~/components/common/BaseButton.vue'
import GlowColorPicker from '~/components/common/GlowColorPicker.vue'
import CategoryCircle from '~/components/category/CategoryCircle.vue'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'مدیریت دسته‌بندی‌ها' })

const categoriesStore = useCategoriesStore()

function emptyForm() {
  return { title: '', image_url: '', glow_color: '' }
}
const form = reactive(emptyForm())
const editingId = ref(null)
const saving = ref(false)
const errorMsg = ref('')

onMounted(() => {
  categoriesStore.fetchCategories()
})

// شروع ویرایش یک دسته‌بندی موجود - بدون حذف رکورد؛ محصولات زیرمجموعه دست‌نخورده باقی می‌مانند
function startEdit(category) {
  editingId.value = category.id
  form.title = category.title
  form.image_url = category.image_url || ''
  form.glow_color = category.glow_color || ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function resetForm() {
  editingId.value = null
  Object.assign(form, emptyForm())
  errorMsg.value = ''
}

async function handleSubmit() {
  errorMsg.value = ''
  if (!form.image_url) {
    errorMsg.value = 'لطفا یک عکس برای دسته‌بندی انتخاب کنید.'
    return
  }
  saving.value = true
  try {
    if (editingId.value) {
      await categoriesStore.updateCategory(editingId.value, {
        title: form.title,
        image_url: form.image_url,
        glow_color: form.glow_color
      })
    } else {
      // بعد از ذخیره در دیتابیس، استور خودش آیتم جدید را به لیست اضافه می‌کند
      // و همین‌جا (بدون رفرش صفحه) نمایش داده می‌شود
      await categoriesStore.createCategory({
        title: form.title,
        image_url: form.image_url,
        glow_color: form.glow_color
      })
    }
    resetForm()
  } catch (e) {
    errorMsg.value = 'خطا در ذخیره‌سازی: ' + e.message
  } finally {
    saving.value = false
  }
}

async function handleDelete(id) {
  if (editingId.value === id) resetForm()
  await categoriesStore.deleteCategory(id)
}
</script>
