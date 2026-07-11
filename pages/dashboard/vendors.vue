<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">مدیریت فروشنده‌ها</h1>

    <form
      @submit.prevent="handleSubmit"
      class="mb-8 max-w-lg space-y-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800"
    >
      <h2 class="text-lg font-semibold text-stone-800 dark:text-stone-100">افزودن فروشنده جدید</h2>
      <BaseInput v-model="form.name" label="نام فروشنده" required />
      <BaseInput v-model="form.phone" label="شماره تماس" />
      <BaseInput v-model="form.email" label="ایمیل" type="email" />
      <BaseInput v-model="form.address" label="آدرس" />
      <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>
      <BaseButton type="submit" :loading="saving">ذخیره فروشنده</BaseButton>
    </form>

    <h2 class="mb-4 text-lg font-semibold text-stone-800 dark:text-stone-100">فروشنده‌های ثبت‌شده</h2>
    <SkeletonTable v-if="vendorsStore.loading" :rows="4" :columns="3" :with-image="false" />
    <p v-else-if="!vendorsStore.vendors.length" class="text-stone-500">هنوز فروشنده‌ای ثبت نشده است.</p>

    <div v-else class="overflow-x-auto rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <table class="w-full text-right text-sm">
        <thead class="border-b border-stone-200 bg-stone-50 text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
          <tr>
            <th class="px-4 py-3">نام</th>
            <th class="px-4 py-3">تلفن</th>
            <th class="px-4 py-3">ایمیل</th>
            <th class="px-4 py-3">آدرس</th>
            <th class="px-4 py-3">عملیات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in vendorsStore.vendors" :key="v.id" class="border-b border-stone-100 last:border-0 dark:border-stone-700">
            <td class="px-4 py-3 text-stone-800 dark:text-stone-100">{{ v.name }}</td>
            <td class="px-4 py-3 text-stone-600 dark:text-stone-400">{{ v.phone || '—' }}</td>
            <td class="px-4 py-3 text-stone-600 dark:text-stone-400">{{ v.email || '—' }}</td>
            <td class="px-4 py-3 text-stone-600 dark:text-stone-400">{{ v.address || '—' }}</td>
            <td class="px-4 py-3">
              <button class="text-red-600 hover:underline" @click="vendorsStore.deleteVendor(v.id)">حذف</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useVendorsStore } from '~/stores/vendors'
import BaseInput from '~/components/common/BaseInput.vue'
import BaseButton from '~/components/common/BaseButton.vue'
import SkeletonTable from '~/components/common/SkeletonTable.vue'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'مدیریت فروشنده‌ها' })

const vendorsStore = useVendorsStore()
const form = reactive({ name: '', phone: '', email: '', address: '' })
const saving = ref(false)
const errorMsg = ref('')

onMounted(() => {
  vendorsStore.fetchVendors()
})

async function handleSubmit() {
  errorMsg.value = ''
  saving.value = true
  try {
    await vendorsStore.createVendor({ ...form })
    Object.assign(form, { name: '', phone: '', email: '', address: '' })
  } catch (e) {
    errorMsg.value = 'خطا در ذخیره‌سازی: ' + e.message
  } finally {
    saving.value = false
  }
}
</script>
