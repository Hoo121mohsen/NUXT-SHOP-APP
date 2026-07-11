<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-stone-800 dark:text-stone-100">مدیریت محصولات</h1>
      <BaseButton @click="router.push('/dashboard/products/new')">+ محصول جدید</BaseButton>
    </div>

    <!-- نوار جستجو و فیلترها -->
    <div class="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
      <input
        v-model="search"
        type="text"
        placeholder="جستجو بر اساس نام یا شناسه محصول..."
        class="w-64 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      />

      <select
        v-model="stockFilter"
        class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      >
        <option value="all">همه موجودی‌ها</option>
        <option value="out">فقط ناموجود (موجودی صفر)</option>
        <option value="low">موجودی کمتر از ...</option>
        <option value="high">موجودی بیشتر از ...</option>
      </select>

      <input
        v-if="stockFilter === 'low'"
        v-model="lowStockThreshold"
        type="number"
        min="1"
        class="w-24 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      />
      <input
        v-if="stockFilter === 'high'"
        v-model="highStockThreshold"
        type="number"
        min="0"
        class="w-24 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      />

      <select
        v-model="vendorId"
        class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      >
        <option value="all">همه فروشنده‌ها</option>
        <option v-for="v in vendorsStore.vendors" :key="v.id" :value="v.id">{{ v.name }}</option>
      </select>

      <select
        v-model="warehouseId"
        class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      >
        <option value="all">همه انبارها</option>
        <option v-for="w in warehousesStore.warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
      </select>

      <select
        v-model="publishedFilter"
        class="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
      >
        <option value="all">همه وضعیت‌های نمایش</option>
        <option value="published">فقط نمایش داده‌شده در سایت</option>
        <option value="unpublished">فقط نمایش داده‌نشده</option>
      </select>

      <span class="text-xs text-stone-400">{{ filtered.length }} محصول</span>
    </div>

    <SkeletonTable v-if="productsStore.loading" :rows="8" :columns="5" />

    <div v-else class="overflow-x-auto rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
      <table class="w-full text-right text-sm">
        <thead class="border-b border-stone-200 bg-stone-50 text-stone-500 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-400">
          <tr>
            <th class="px-4 py-3"></th>
            <th class="px-4 py-3">نمایش</th>
            <th class="px-4 py-3">شناسه</th>
            <th class="px-4 py-3">تصویر</th>
            <th class="px-4 py-3">عنوان</th>
            <th class="px-4 py-3">دسته‌بندی</th>
            <th class="px-4 py-3">فروشنده</th>
            <th class="px-4 py-3">انبار</th>
            <th class="px-4 py-3">قیمت فروش</th>
            <th class="px-4 py-3">موجودی</th>
            <th class="px-4 py-3">تخفیف</th>
            <th class="px-4 py-3">عملیات</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="p in paginated" :key="p.id">
            <!-- ردیف خلاصه - کلیک روی آن آکاردئون جزئیات را باز/بسته می‌کند -->
            <tr
              class="cursor-pointer border-b border-stone-100 last:border-0 hover:bg-stone-50 dark:border-stone-700 dark:hover:bg-stone-900/40"
              @click="toggle(p.id)"
            >
              <td class="px-4 py-3 text-stone-400">
                <span :class="openIds.has(p.id) ? 'rotate-90' : ''" class="inline-block transition-transform">◂</span>
              </td>
              <td class="px-4 py-3" @click.stop="handleTogglePublished(p)">
                <button :title="p.is_published ? 'در سایت نمایش داده می‌شود - برای پنهان کردن کلیک کنید' : 'در سایت نمایش داده نمی‌شود - برای انتشار کلیک کنید'">
                  <span v-if="p.is_published" class="text-lg text-brand-600">👁️</span>
                  <span v-else class="text-lg text-stone-400">🚫</span>
                </button>
              </td>
              <td class="px-4 py-3 text-xs text-stone-400">{{ p.id.slice(0, 8) }}</td>
              <td class="px-4 py-3">
                <img :src="getCoverImage(p)" class="h-12 w-12 rounded-lg object-cover" />
              </td>
              <td class="px-4 py-3 text-stone-800 dark:text-stone-100">
                {{ p.title }}
                <span v-if="p.is_affiliate" class="mr-1 rounded bg-brand-50 px-1.5 py-0.5 text-[10px] text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">Affiliate</span>
              </td>
              <td class="px-4 py-3 text-stone-600 dark:text-stone-400">{{ p.categories?.title || '—' }}</td>
              <td class="px-4 py-3 text-stone-600 dark:text-stone-400">{{ p.vendors?.name || '—' }}</td>
              <td class="px-4 py-3 text-stone-600 dark:text-stone-400">{{ p.warehouses?.name || '—' }}</td>
              <td class="px-4 py-3 text-stone-600 dark:text-stone-400">{{ formatToman(p.sale_price) }}</td>
              <td class="px-4 py-3" :class="p.stock_quantity > 0 ? 'text-brand-600' : 'text-red-500'">
                {{ p.stock_quantity > 0 ? p.stock_quantity : 'ناموجود' }}
              </td>
              <td class="px-4 py-3">
                <span v-if="p.discount_percentage > 0" class="rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
                  {{ p.discount_percentage }}٪
                </span>
                <span v-else class="text-stone-300">—</span>
              </td>
              <td class="px-4 py-3" @click.stop>
                <div class="flex gap-3">
                  <button class="text-brand-600 hover:underline" @click="router.push(`/dashboard/products/${p.id}/edit`)">ویرایش</button>
                  <button class="text-red-600 hover:underline" @click="confirmDelete(p.id)">حذف</button>
                </div>
              </td>
            </tr>

            <!-- ردیف آکاردئون: جزئیات کامل محصول (عکس‌ها، رنگ‌بندی، انبار، فروشنده، توضیحات و ...) -->
            <tr v-if="openIds.has(p.id)">
              <td colspan="12" class="border-b border-stone-100 bg-stone-50 p-5 dark:border-stone-700 dark:bg-stone-900/40">
                <div class="grid gap-6 md:grid-cols-3">
                  <!-- عکس‌های محصول -->
                  <div>
                    <p class="mb-2 text-xs font-medium text-stone-500 dark:text-stone-400">عکس‌های محصول</p>
                    <div class="flex flex-wrap gap-2">
                      <img
                        v-for="(img, idx) in getSortedImages(p)"
                        :key="idx"
                        :src="img"
                        class="h-16 w-16 rounded-lg border border-stone-200 object-cover dark:border-stone-700"
                      />
                      <p v-if="!getSortedImages(p).length" class="text-xs text-stone-400">عکسی ثبت نشده</p>
                    </div>
                  </div>

                  <!-- رنگ‌بندی و موجودی هر رنگ -->
                  <div>
                    <p class="mb-2 text-xs font-medium text-stone-500 dark:text-stone-400">رنگ‌بندی و موجودی هر رنگ</p>
                    <div v-if="getSortedColors(p).length" class="flex flex-col gap-1.5">
                      <div v-for="c in getSortedColors(p)" :key="c.id" class="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300">
                        <span class="h-4 w-4 rounded-full border-2" :style="{ backgroundColor: c.color_hex, borderColor: c.color_hex }" />
                        {{ c.color_name }}
                        <span class="text-stone-400">— موجودی: {{ c.quantity }}</span>
                      </div>
                    </div>
                    <p v-else class="text-xs text-stone-400">رنگ‌بندی ثبت نشده</p>
                  </div>

                  <!-- اطلاعات کلی -->
                  <div class="space-y-1 text-xs text-stone-600 dark:text-stone-400">
                    <p><span class="font-medium text-stone-800 dark:text-stone-200">دسته‌بندی:</span> {{ p.categories?.title || '—' }}</p>
                    <p><span class="font-medium text-stone-800 dark:text-stone-200">فروشنده:</span> {{ p.vendors?.name || '—' }}</p>
                    <p><span class="font-medium text-stone-800 dark:text-stone-200">انبار:</span> {{ p.warehouses?.name || '—' }}</p>
                    <p><span class="font-medium text-stone-800 dark:text-stone-200">ابعاد:</span> {{ p.dimensions || '—' }}</p>
                    <p><span class="font-medium text-stone-800 dark:text-stone-200">قیمت خرید:</span> {{ formatToman(p.purchase_price) }} تومان</p>
                    <p><span class="font-medium text-stone-800 dark:text-stone-200">قیمت فروش:</span> {{ formatToman(p.sale_price) }} تومان</p>
                    <p v-if="p.is_affiliate"><span class="font-medium text-stone-800 dark:text-stone-200">منبع Affiliate:</span> {{ p.affiliate_source }}</p>
                    <p v-if="p.is_affiliate" class="truncate"><span class="font-medium text-stone-800 dark:text-stone-200">لینک:</span> {{ p.affiliate_link }}</p>
                  </div>
                </div>

                <div v-if="p.description" class="mt-4 border-t border-stone-200 pt-3 text-xs text-stone-600 dark:border-stone-700 dark:text-stone-400">
                  <span class="font-medium text-stone-800 dark:text-stone-200">توضیحات: </span>{{ p.description }}
                </div>

                <div v-if="p.tags?.length" class="mt-3 flex flex-wrap gap-2">
                  <span v-for="tag in p.tags" :key="tag" class="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] text-stone-600 dark:bg-stone-700 dark:text-stone-300">
                    #{{ tag }}
                  </span>
                </div>

                <div class="mt-4 flex gap-3">
                  <NuxtLink :to="`/products/${p.id}`" target="_blank" class="text-xs text-brand-600 hover:underline">مشاهده در سایت ↗</NuxtLink>
                  <NuxtLink :to="`/dashboard/products/${p.id}/edit`" class="text-xs text-brand-600 hover:underline">ویرایش کامل ←</NuxtLink>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
      <p v-if="!filtered.length" class="p-6 text-center text-stone-500">محصولی با این فیلتر یافت نشد.</p>
    </div>

    <Pagination :current-page="currentPage" :total-pages="totalPages" @prev="prev" @next="next" @go-to="goTo" />

    <BaseModal v-model="showConfirm" title="حذف محصول">
      <p class="text-sm text-stone-600 dark:text-stone-300">آیا از حذف این محصول مطمئن هستید؟</p>
      <div class="mt-4 flex justify-end gap-2">
        <BaseButton variant="secondary" @click="showConfirm = false">انصراف</BaseButton>
        <BaseButton variant="danger" @click="handleDelete">حذف</BaseButton>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '~/stores/products'
import { useVendorsStore } from '~/stores/vendors'
import { useWarehousesStore } from '~/stores/warehouses'
import BaseButton from '~/components/common/BaseButton.vue'
import BaseModal from '~/components/common/BaseModal.vue'
import SkeletonTable from '~/components/common/SkeletonTable.vue'
import Pagination from '~/components/common/Pagination.vue'
import { getCoverImage, getSortedImages, getSortedColors, formatToman } from '~/composables/useProductHelpers'
import { useProductFilters } from '~/composables/useProductFilters'
import { usePagination } from '~/composables/usePagination'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'مدیریت محصولات' })

const productsStore = useProductsStore()
const vendorsStore = useVendorsStore()
const warehousesStore = useWarehousesStore()
const router = useRouter()
const showConfirm = ref(false)
const toDeleteId = ref(null)

// جستجو بر اساس نام/شناسه + فیلتر موجودی (کمتر/بیشتر از عدد دلخواه) + فروشنده + انبار + وضعیت نمایش
const productsRef = computed(() => productsStore.products)
const {
  search,
  stockFilter,
  lowStockThreshold,
  highStockThreshold,
  vendorId,
  warehouseId,
  publishedFilter,
  filtered
} = useProductFilters(productsRef)

// صفحه‌بندی روی نتیجه فیلترشده - ۱۰ ردیف در هر صفحه
const { currentPage, totalPages, paginated, goTo, next, prev } = usePagination(filtered, 10)

onMounted(() => {
  productsStore.fetchProducts()
  vendorsStore.fetchVendors()
  warehousesStore.fetchWarehouses()
})

// باز/بسته کردن آکاردئون جزئیات هر محصول
const openIds = ref(new Set())
function toggle(id) {
  if (openIds.value.has(id)) openIds.value.delete(id)
  else openIds.value.add(id)
  openIds.value = new Set(openIds.value)
}

function confirmDelete(id) {
  toDeleteId.value = id
  showConfirm.value = true
}

async function handleDelete() {
  await productsStore.deleteProduct(toDeleteId.value)
  await productsStore.fetchProducts()
  showConfirm.value = false
}

// کلیک روی آیکون چشم: تغییر فوری وضعیت نمایش محصول در سایت (فقط ادمین از همین‌جا کنترل می‌کند)
async function handleTogglePublished(product) {
  const newValue = !product.is_published
  product.is_published = newValue // به‌روزرسانی خوش‌بینانه در UI
  try {
    await productsStore.togglePublished(product.id, newValue)
  } catch (e) {
    product.is_published = !newValue // در صورت خطا برگردان
  }
}
</script>
