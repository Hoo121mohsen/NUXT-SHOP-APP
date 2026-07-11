<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">مدیریت انبارها</h1>

    <form
      @submit.prevent="handleSubmit"
      class="mb-8 max-w-lg space-y-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800"
    >
      <h2 class="text-lg font-semibold text-stone-800 dark:text-stone-100">افزودن انبار جدید</h2>
      <BaseInput v-model="form.name" label="نام انبار" required />
      <BaseInput v-model="form.location" label="آدرس/توضیح مکان" />
      <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>
      <BaseButton type="submit" :loading="saving">ذخیره انبار</BaseButton>
    </form>

    <h2 class="mb-4 text-lg font-semibold text-stone-800 dark:text-stone-100">انبارهای ثبت‌شده</h2>
    <SkeletonTable v-if="warehousesStore.loading" :rows="4" :columns="2" :with-image="false" />
    <p v-else-if="!warehousesStore.warehouses.length" class="text-stone-500">هنوز انباری ثبت نشده است.</p>

    <div v-else class="overflow-x-auto rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <table class="w-full text-right text-sm">
        <thead class="border-b border-stone-200 bg-stone-50 text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
          <tr>
            <th class="px-4 py-3">نام انبار</th>
            <th class="px-4 py-3">آدرس/توضیح</th>
            <th class="px-4 py-3">عملیات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="w in warehousesStore.warehouses" :key="w.id" class="border-b border-stone-100 last:border-0 dark:border-stone-700">
            <td class="px-4 py-3 text-stone-800 dark:text-stone-100">{{ w.name }}</td>
            <td class="px-4 py-3 text-stone-600 dark:text-stone-400">{{ w.location || '—' }}</td>
            <td class="px-4 py-3">
              <button class="text-red-600 hover:underline" @click="warehousesStore.deleteWarehouse(w.id)">حذف</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useWarehousesStore } from '~/stores/warehouses'
import BaseInput from '~/components/common/BaseInput.vue'
import BaseButton from '~/components/common/BaseButton.vue'
import SkeletonTable from '~/components/common/SkeletonTable.vue'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'مدیریت انبارها' })

const warehousesStore = useWarehousesStore()
const form = reactive({ name: '', location: '' })
const saving = ref(false)
const errorMsg = ref('')

onMounted(() => {
  warehousesStore.fetchWarehouses()
})

async function handleSubmit() {
  errorMsg.value = ''
  saving.value = true
  try {
    await warehousesStore.createWarehouse({ ...form })
    Object.assign(form, { name: '', location: '' })
  } catch (e) {
    errorMsg.value = 'خطا در ذخیره‌سازی: ' + e.message
  } finally {
    saving.value = false
  }
}
</script>
