<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">
      ویرایش محصول
      <span v-if="isAffiliate" class="align-middle text-sm font-normal text-brand-600 dark:text-brand-400">(Affiliate)</span>
    </h1>

    <div v-if="loadingProduct" class="max-w-2xl space-y-4 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
      <SkeletonBox height="2.5rem" width="100%" />
      <SkeletonBox height="2.5rem" width="100%" />
      <SkeletonBox height="6rem" width="100%" />
      <SkeletonBox height="2.5rem" width="60%" />
      <div class="grid grid-cols-4 gap-2"><div v-for="i in 4" :key="i" class="skeleton aspect-square rounded-lg"></div></div>
    </div>

    <!-- ===================== فرم ویرایش محصول Affiliate ===================== -->
    <form
      v-else-if="isAffiliate"
      @submit.prevent="handleSubmitAffiliate"
      class="max-w-2xl space-y-5 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800"
    >
      <BaseInput v-model="affiliateForm.title" label="عنوان محصول" required />

      <label class="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700 dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-300">
        <input v-model="affiliateForm.is_published" type="checkbox" class="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500" />
        نمایش این محصول در سایت
      </label>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BaseInput v-model="affiliateForm.affiliate_source" label="نام سایت مبدأ" required />
        <div>
          <label class="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">دسته‌بندی</label>
          <select v-model="affiliateForm.category_id" class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100">
            <option value="">بدون دسته‌بندی</option>
            <option v-for="c in categoriesStore.categories" :key="c.id" :value="c.id">{{ c.title }}</option>
          </select>
        </div>
      </div>

      <BaseInput v-model="affiliateForm.affiliate_link" label="لینک اختصاصی افیلیت" type="url" required />
      <BaseInput v-model="affiliateForm.affiliate_product_url" label="آدرس اصلی محصول در سایت مبدأ (اختیاری)" type="url" />
      <BaseInput v-model="affiliateForm.affiliate_code" label="کد/شناسه افیلیت (اختیاری)" />

      <BaseTextarea v-model="affiliateForm.description" label="توضیحات محصول" :rows="4" />

      <div>
        <p class="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          💰 قیمت نمایشی به <strong>تومان</strong> وارد شود.
        </p>
        <div class="grid grid-cols-2 gap-4">
          <PriceInput v-model="affiliateForm.sale_price" label="قیمت نمایشی (تومان)" />
          <BaseInput v-model="affiliateForm.commission_percentage" label="درصد کمیسیون تقریبی" type="number" />
        </div>
        <VATBreakdown :sale-price="affiliateForm.sale_price" />
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BaseInput v-model="affiliateForm.weight" label="وزن محصول (اختیاری)" />
        <BaseInput v-model="affiliateForm.brand" label="برند محصول (اختیاری)" />
      </div>

      <div class="rounded-lg border border-stone-200 p-4 dark:border-stone-700">
        <p class="mb-3 text-sm font-medium text-stone-700 dark:text-stone-300">👍👎 تعداد لایک و دیس‌لایک</p>
        <div class="grid grid-cols-2 gap-4">
          <BaseInput v-model="affiliateForm.likes_count" label="تعداد لایک" type="number" />
          <BaseInput v-model="affiliateForm.dislikes_count" label="تعداد دیس‌لایک" type="number" />
        </div>
      </div>

      <div class="rounded-lg border border-stone-200 p-4 dark:border-stone-700">
        <label class="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
          <input v-model="affiliateForm.has_aparat_video" type="checkbox" class="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500" />
          افزودن لینک ویدیوی معرفی محصول از آپارات
        </label>
        <BaseInput
          v-if="affiliateForm.has_aparat_video"
          v-model="affiliateForm.aparat_video_link"
          label="لینک ویدیو آپارات"
          type="url"
          placeholder="https://www.aparat.com/v/xxxxxxx"
          class="mt-3"
        />
      </div>

      <MultiImageUploader
        v-model="affiliateForm.images"
        label="عکس‌های محصول"
        :max-files="7"
        :upload-fn="productsStore.uploadProductImage"
      />

      <SuggestedTags :suggestions="affiliateCategoryTags" v-model="affiliateForm.tags" />
      <TagsInput v-model="affiliateForm.tags" />

      <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>
      <p v-if="successMsg" class="text-sm text-green-600">{{ successMsg }}</p>
      <BaseButton type="submit" :loading="saving">ذخیره تغییرات</BaseButton>
    </form>

    <!-- ===================== فرم ویرایش محصول معمولی ===================== -->
    <form v-else @submit.prevent="handleSubmitNormal" class="max-w-2xl space-y-5 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800">
      <BaseInput v-model="normalForm.title" label="عنوان محصول" required />

      <label class="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700 dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-300">
        <input v-model="normalForm.is_published" type="checkbox" class="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500" />
        نمایش این محصول در سایت
      </label>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label class="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">دسته‌بندی</label>
          <select v-model="normalForm.category_id" class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100">
            <option value="">بدون دسته‌بندی</option>
            <option v-for="c in categoriesStore.categories" :key="c.id" :value="c.id">{{ c.title }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">فروشنده</label>
          <select v-model="normalForm.vendor_id" class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100">
            <option value="">بدون فروشنده</option>
            <option v-for="v in vendorsStore.vendors" :key="v.id" :value="v.id">{{ v.name }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">انبار</label>
          <select v-model="normalForm.warehouse_id" class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100">
            <option value="">بدون انبار</option>
            <option v-for="w in warehousesStore.warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
          </select>
        </div>
      </div>

      <BaseTextarea v-model="normalForm.description" label="توضیحات محصول" :rows="4" />

      <div>
        <p class="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          💰 مبالغ زیر به <strong>تومان</strong> وارد شوند (در فاکتورها به‌صورت خودکار به ریال تبدیل و نمایش داده می‌شود).
        </p>
        <div class="grid grid-cols-2 gap-4">
          <PriceInput v-model="normalForm.purchase_price" label="قیمت خرید (تومان)" />
          <PriceInput v-model="normalForm.sale_price" label="قیمت فروش (تومان)" />
        </div>
        <!-- محاسبه خودکار ارزش افزوده و سود خالص بر اساس تنظیمات بخش حسابداری -->
        <VATBreakdown :sale-price="normalForm.sale_price" />
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <BaseInput v-model="normalForm.weight" label="وزن محصول (مثلا 500 گرم یا 1.2 کیلوگرم)" />
        <BaseInput v-model="normalForm.brand" label="برند محصول" />
      </div>

      <BaseInput v-model="normalForm.dimensions" label="ابعاد" />

      <!-- تعداد لایک/دیس‌لایک؛ ادمین می‌تواند اعداد اولیه/فعلی را دستی تنظیم کند -->
      <div class="rounded-lg border border-stone-200 p-4 dark:border-stone-700">
        <p class="mb-3 text-sm font-medium text-stone-700 dark:text-stone-300">👍👎 تعداد لایک و دیس‌لایک</p>
        <div class="grid grid-cols-2 gap-4">
          <BaseInput v-model="normalForm.likes_count" label="تعداد لایک" type="number" />
          <BaseInput v-model="normalForm.dislikes_count" label="تعداد دیس‌لایک" type="number" />
        </div>
      </div>

      <!-- چک‌باکس فعال‌سازی لینک ویدیوی آپارات -->
      <div class="rounded-lg border border-stone-200 p-4 dark:border-stone-700">
        <label class="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300">
          <input v-model="normalForm.has_aparat_video" type="checkbox" class="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500" />
          افزودن لینک ویدیوی معرفی محصول از آپارات
        </label>
        <BaseInput
          v-if="normalForm.has_aparat_video"
          v-model="normalForm.aparat_video_link"
          label="لینک ویدیو آپارات"
          type="url"
          placeholder="https://www.aparat.com/v/xxxxxxx"
          class="mt-3"
        />
      </div>

      <!-- تعداد موجودی از جمع تعداد هر رنگ محاسبه می‌شود (یا تعداد کل در حالت فاقد تنوع رنگی) -->
      <ProductColorsInput
        v-model="normalForm.colors"
        v-model:has-color-variants="normalForm.has_color_variants"
        v-model:simple-quantity="normalForm.simple_quantity"
      />

      <MultiImageUploader
        v-model="normalForm.images"
        label="عکس‌های محصول"
        :max-files="7"
        :upload-fn="productsStore.uploadProductImage"
      />

      <SuggestedTags :suggestions="normalCategoryTags" v-model="normalForm.tags" />
      <TagsInput v-model="normalForm.tags" />

      <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>
      <p v-if="successMsg" class="text-sm text-green-600">{{ successMsg }}</p>
      <BaseButton type="submit" :loading="saving">ذخیره تغییرات</BaseButton>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useProductsStore } from '~/stores/products'
import { useCategoriesStore } from '~/stores/categories'
import { useVendorsStore } from '~/stores/vendors'
import { useWarehousesStore } from '~/stores/warehouses'
import BaseInput from '~/components/common/BaseInput.vue'
import BaseTextarea from '~/components/common/BaseTextarea.vue'
import BaseButton from '~/components/common/BaseButton.vue'
import PriceInput from '~/components/common/PriceInput.vue'
import ProductColorsInput from '~/components/common/ProductColorsInput.vue'
import VATBreakdown from '~/components/common/VATBreakdown.vue'
import MultiImageUploader from '~/components/common/MultiImageUploader.vue'
import TagsInput from '~/components/common/TagsInput.vue'
import SuggestedTags from '~/components/common/SuggestedTags.vue'
import SkeletonBox from '~/components/common/SkeletonBox.vue'
import { getSortedImages, getSortedColors } from '~/composables/useProductHelpers'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'ویرایش محصول' })

const route = useRoute()
const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()

// تگ‌های پیش‌فرض دسته‌بندی انتخاب‌شده در هر فرم (برای نمایش به‌عنوان پیشنهاد سریع)
const normalCategoryTags = computed(
  () => categoriesStore.categories.find((c) => c.id === normalForm.category_id)?.default_tags || []
)
const affiliateCategoryTags = computed(
  () => categoriesStore.categories.find((c) => c.id === affiliateForm.category_id)?.default_tags || []
)
const vendorsStore = useVendorsStore()
const warehousesStore = useWarehousesStore()

const isAffiliate = ref(false)

const normalForm = reactive({
  title: '', category_id: '', vendor_id: '', warehouse_id: '', is_published: false,
  description: '', purchase_price: '', sale_price: '',
  dimensions: '', colors: [], images: [], tags: [],
  weight: '', brand: '',
  likes_count: 0, dislikes_count: 0,
  has_aparat_video: false, aparat_video_link: '',
  has_color_variants: true, simple_quantity: 0
})

const affiliateForm = reactive({
  title: '', category_id: '', is_published: false, affiliate_source: '', affiliate_link: '',
  affiliate_product_url: '', affiliate_code: '', description: '',
  sale_price: '', commission_percentage: '', images: [], tags: [],
  weight: '', brand: '',
  likes_count: 0, dislikes_count: 0,
  has_aparat_video: false, aparat_video_link: ''
})

const loadingProduct = ref(true)
const saving = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

onMounted(async () => {
  await categoriesStore.fetchCategories()
  await vendorsStore.fetchVendors()
  await warehousesStore.fetchWarehouses()

  const product = await productsStore.fetchProductById(route.params.id)
  if (product) {
    isAffiliate.value = !!product.is_affiliate

    if (isAffiliate.value) {
      affiliateForm.title = product.title
      affiliateForm.category_id = product.category_id || ''
      affiliateForm.is_published = !!product.is_published
      affiliateForm.affiliate_source = product.affiliate_source || ''
      affiliateForm.affiliate_link = product.affiliate_link || ''
      affiliateForm.affiliate_product_url = product.affiliate_product_url || ''
      affiliateForm.affiliate_code = product.affiliate_code || ''
      affiliateForm.description = product.description || ''
      affiliateForm.sale_price = product.sale_price
      affiliateForm.commission_percentage = product.commission_percentage || ''
      affiliateForm.images = getSortedImages(product)
      affiliateForm.tags = product.tags || []
      affiliateForm.weight = product.weight || ''
      affiliateForm.brand = product.brand || ''
      affiliateForm.likes_count = product.likes_count || 0
      affiliateForm.dislikes_count = product.dislikes_count || 0
      affiliateForm.has_aparat_video = !!product.aparat_video_link
      affiliateForm.aparat_video_link = product.aparat_video_link || ''
    } else {
      normalForm.title = product.title
      normalForm.category_id = product.category_id || ''
      normalForm.vendor_id = product.vendor_id || ''
      normalForm.warehouse_id = product.warehouse_id || ''
      normalForm.is_published = !!product.is_published
      normalForm.description = product.description || ''
      normalForm.purchase_price = product.purchase_price
      normalForm.sale_price = product.sale_price
      normalForm.dimensions = product.dimensions || ''
      normalForm.images = getSortedImages(product)
      normalForm.colors = getSortedColors(product).map((c) => ({ name: c.color_name, hex: c.color_hex, quantity: c.quantity || 0 }))
      normalForm.tags = product.tags || []
      normalForm.weight = product.weight || ''
      normalForm.brand = product.brand || ''
      normalForm.likes_count = product.likes_count || 0
      normalForm.dislikes_count = product.dislikes_count || 0
      normalForm.has_aparat_video = !!product.aparat_video_link
      normalForm.aparat_video_link = product.aparat_video_link || ''
      normalForm.has_color_variants = product.has_color_variants !== false
      normalForm.simple_quantity = product.has_color_variants === false ? (product.stock_quantity || 0) : 0
    }
  }
  loadingProduct.value = false
})

async function handleSubmitNormal() {
  errorMsg.value = ''
  successMsg.value = ''
  saving.value = true
  try {
    await productsStore.updateProduct(route.params.id, {
      title: normalForm.title,
      category_id: normalForm.category_id || null,
      vendor_id: normalForm.vendor_id || null,
      warehouse_id: normalForm.warehouse_id || null,
      is_published: normalForm.is_published,
      description: normalForm.description,
      purchase_price: Number(normalForm.purchase_price),
      sale_price: Number(normalForm.sale_price),
      dimensions: normalForm.dimensions,
      weight: normalForm.weight || null,
      brand: normalForm.brand || null,
      likes_count: Number(normalForm.likes_count) || 0,
      dislikes_count: Number(normalForm.dislikes_count) || 0,
      aparat_video_link: normalForm.has_aparat_video ? (normalForm.aparat_video_link || null) : null,
      has_color_variants: normalForm.has_color_variants,
      colors: normalForm.has_color_variants ? normalForm.colors : [],
      stock_quantity: normalForm.has_color_variants ? undefined : (Number(normalForm.simple_quantity) || 0),
      images: normalForm.images,
      tags: normalForm.tags
    })
    successMsg.value = 'تغییرات با موفقیت ذخیره شد.'
  } catch (e) {
    errorMsg.value = 'خطا در ذخیره‌سازی: ' + e.message
  } finally {
    saving.value = false
  }
}

async function handleSubmitAffiliate() {
  errorMsg.value = ''
  successMsg.value = ''
  saving.value = true
  try {
    await productsStore.updateProduct(route.params.id, {
      title: affiliateForm.title,
      category_id: affiliateForm.category_id || null,
      is_published: affiliateForm.is_published,
      description: affiliateForm.description,
      sale_price: Number(affiliateForm.sale_price),
      images: affiliateForm.images,
      tags: affiliateForm.tags,
      weight: affiliateForm.weight || null,
      brand: affiliateForm.brand || null,
      likes_count: Number(affiliateForm.likes_count) || 0,
      dislikes_count: Number(affiliateForm.dislikes_count) || 0,
      aparat_video_link: affiliateForm.has_aparat_video ? (affiliateForm.aparat_video_link || null) : null,
      affiliate_source: affiliateForm.affiliate_source,
      affiliate_link: affiliateForm.affiliate_link,
      affiliate_product_url: affiliateForm.affiliate_product_url || null,
      affiliate_code: affiliateForm.affiliate_code || null,
      commission_percentage: affiliateForm.commission_percentage ? Number(affiliateForm.commission_percentage) : 0
    })
    successMsg.value = 'تغییرات با موفقیت ذخیره شد.'
  } catch (e) {
    errorMsg.value = 'خطا در ذخیره‌سازی: ' + e.message
  } finally {
    saving.value = false
  }
}
</script>
