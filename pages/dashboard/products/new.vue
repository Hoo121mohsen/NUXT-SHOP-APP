<template>
  <div>
    <h1 class="mb-6 text-2xl font-bold text-stone-800 dark:text-stone-100">افزودن محصول جدید</h1>

    <!-- بعد از ثبت موفق، فرم مخفی می‌شود و کارت محصول + شناسه آن نمایش داده می‌شود -->
    <div v-if="createdProduct" class="max-w-md">
      <div class="mb-4 rounded-lg border border-brand-200 bg-brand-50 p-4 text-sm text-brand-700 dark:border-brand-900 dark:bg-brand-900/20 dark:text-brand-300">
        ✅ محصول با موفقیت ثبت شد. شناسه محصول:
        <span class="font-mono font-bold">{{ createdProduct.id }}</span>
      </div>
      <ProductCard :product="createdProduct" />
      <div class="mt-4 flex gap-3">
        <BaseButton variant="secondary" @click="resetForCreateAnother">افزودن محصول دیگر</BaseButton>
        <BaseButton variant="ghost" @click="router.push('/dashboard/products')">بازگشت به لیست محصولات</BaseButton>
      </div>
    </div>

    <template v-else>
      <!-- دو سربرگ: تعریف محصول عادی / Affiliate (همکاری در فروش) -->
      <div class="mb-6 flex gap-2 border-b border-stone-200 dark:border-stone-700">
        <button
          type="button"
          class="border-b-2 px-4 py-2 text-sm font-medium transition"
          :class="activeTab === 'normal'
            ? 'border-brand-600 text-brand-700 dark:text-brand-400'
            : 'border-transparent text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'"
          @click="activeTab = 'normal'"
        >
          تعریف محصول
        </button>
        <button
          type="button"
          class="border-b-2 px-4 py-2 text-sm font-medium transition"
          :class="activeTab === 'affiliate'
            ? 'border-brand-600 text-brand-700 dark:text-brand-400'
            : 'border-transparent text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'"
          @click="activeTab = 'affiliate'"
        >
          🔗 Affiliate (همکاری در فروش)
        </button>
      </div>

      <!-- ===================== سربرگ ۱: تعریف محصول معمولی ===================== -->
      <form
        v-if="activeTab === 'normal'"
        @submit.prevent="handleSubmitNormal"
        class="max-w-2xl space-y-5 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800"
      >
        <BaseInput v-model="normalForm.title" label="عنوان محصول" required />

        <label class="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700 dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-300">
          <input v-model="normalForm.is_published" type="checkbox" class="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500" />
          نمایش این محصول در سایت (پیش‌فرض غیرفعال؛ فقط ادمین می‌تواند آن را فعال کند)
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

        <BaseInput v-model="normalForm.dimensions" label="ابعاد (مثلا 20x30x10 سانتی‌متر)" />

        <!-- تعداد لایک/دیس‌لایک اولیه که ادمین می‌تواند برای محصول تعیین کند -->
        <div class="rounded-lg border border-stone-200 p-4 dark:border-stone-700">
          <p class="mb-3 text-sm font-medium text-stone-700 dark:text-stone-300">👍👎 تعداد لایک و دیس‌لایک اولیه (اختیاری)</p>
          <div class="grid grid-cols-2 gap-4">
            <BaseInput v-model="normalForm.likes_count" label="تعداد لایک اولیه" type="number" />
            <BaseInput v-model="normalForm.dislikes_count" label="تعداد دیس‌لایک اولیه" type="number" />
          </div>
          <p class="mt-2 text-xs text-stone-400 dark:text-stone-500">
            این اعداد به‌عنوان مقدار شروع ثبت می‌شوند؛ با هر رای کاربران، اعداد بلافاصله به‌روز خواهند شد.
          </p>
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

        <!-- تعداد موجودی دیگر جدا وارد نمی‌شود؛ حاصل جمع تعداد هر رنگ در بخش زیر است (یا تعداد کل در حالت فاقد تنوع) -->
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
        <BaseButton type="submit" :loading="saving">ثبت محصول</BaseButton>
      </form>

      <!-- ===================== سربرگ ۲: محصول Affiliate ===================== -->
      <form
        v-else
        @submit.prevent="handleSubmitAffiliate"
        class="max-w-2xl space-y-5 rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-700 dark:bg-stone-800"
      >
        <p class="rounded-lg bg-brand-50 p-3 text-xs leading-6 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300">
          این محصول توی سایت خودت فروخته نمی‌شه؛ فقط معرفی می‌شه و با کلیک روی «مشاهده و خرید»، کاربر با لینک اختصاصی (affiliate) تو به سایت مبدأ (مثلا دیجی‌کالا) منتقل می‌شه. نیازی به موجودی/فروشنده/انبار نیست.
        </p>

        <BaseInput v-model="affiliateForm.title" label="عنوان محصول" required />

        <label class="flex items-center gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700 dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-300">
          <input v-model="affiliateForm.is_published" type="checkbox" class="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500" />
          نمایش این محصول در سایت (پیش‌فرض غیرفعال؛ فقط ادمین می‌تواند آن را فعال کند)
        </label>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BaseInput v-model="affiliateForm.affiliate_source" label="نام سایت مبدأ (مثلا دیجی‌کالا)" required />
          <div>
            <label class="mb-1 block text-sm font-medium text-stone-700 dark:text-stone-300">دسته‌بندی</label>
            <select v-model="affiliateForm.category_id" class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100">
              <option value="">بدون دسته‌بندی</option>
              <option v-for="c in categoriesStore.categories" :key="c.id" :value="c.id">{{ c.title }}</option>
            </select>
          </div>
        </div>

        <BaseInput v-model="affiliateForm.affiliate_link" label="لینک اختصاصی افیلیت (که کاربر روی آن کلیک می‌کند)" type="url" required />
        <BaseInput v-model="affiliateForm.affiliate_product_url" label="آدرس اصلی محصول در سایت مبدأ (اختیاری، فقط مرجع)" type="url" />
        <BaseInput v-model="affiliateForm.affiliate_code" label="کد/شناسه افیلیت شما نزد آن سایت (اختیاری)" />

        <BaseTextarea v-model="affiliateForm.description" label="توضیحات محصول" :rows="4" />

        <div>
          <p class="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            💰 قیمت نمایشی به <strong>تومان</strong> وارد شود.
          </p>
          <div class="grid grid-cols-2 gap-4">
            <PriceInput v-model="affiliateForm.sale_price" label="قیمت نمایشی (تومان)" />
            <BaseInput v-model="affiliateForm.commission_percentage" label="درصد کمیسیون تقریبی (اختیاری)" type="number" />
          </div>
          <VATBreakdown :sale-price="affiliateForm.sale_price" />
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BaseInput v-model="affiliateForm.weight" label="وزن محصول (اختیاری)" />
          <BaseInput v-model="affiliateForm.brand" label="برند محصول (اختیاری)" />
        </div>

        <div class="rounded-lg border border-stone-200 p-4 dark:border-stone-700">
          <p class="mb-3 text-sm font-medium text-stone-700 dark:text-stone-300">👍👎 تعداد لایک و دیس‌لایک اولیه (اختیاری)</p>
          <div class="grid grid-cols-2 gap-4">
            <BaseInput v-model="affiliateForm.likes_count" label="تعداد لایک اولیه" type="number" />
            <BaseInput v-model="affiliateForm.dislikes_count" label="تعداد دیس‌لایک اولیه" type="number" />
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
          label="عکس محصول (حداقل ۱ عکس - همان کاور کارت)"
          :max-files="7"
          :upload-fn="productsStore.uploadProductImage"
        />

        <SuggestedTags :suggestions="affiliateCategoryTags" v-model="affiliateForm.tags" />
        <TagsInput v-model="affiliateForm.tags" />

        <p v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</p>
        <BaseButton type="submit" :loading="saving">ثبت محصول Affiliate</BaseButton>
      </form>
    </template>
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
import ProductCard from '~/components/product/ProductCard.vue'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'افزودن محصول جدید' })

const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()
const vendorsStore = useVendorsStore()
const warehousesStore = useWarehousesStore()
const router = useRouter()

const activeTab = ref('normal') // normal | affiliate

// تگ‌های پیش‌فرض دسته‌بندی انتخاب‌شده در هر فرم (برای نمایش به‌عنوان پیشنهاد سریع)
const normalCategoryTags = computed(
  () => categoriesStore.categories.find((c) => c.id === normalForm.category_id)?.default_tags || []
)
const affiliateCategoryTags = computed(
  () => categoriesStore.categories.find((c) => c.id === affiliateForm.category_id)?.default_tags || []
)

function emptyNormalForm() {
  return {
    title: '', category_id: '', vendor_id: '', warehouse_id: '', is_published: false,
    description: '', purchase_price: '', sale_price: '',
    dimensions: '', colors: [], images: [], tags: [],
    weight: '', brand: '',
    likes_count: 0, dislikes_count: 0,
    has_aparat_video: false, aparat_video_link: '',
    has_color_variants: true, simple_quantity: 0
  }
}
function emptyAffiliateForm() {
  return {
    title: '', category_id: '', is_published: false, affiliate_source: '', affiliate_link: '',
    affiliate_product_url: '', affiliate_code: '', description: '',
    sale_price: '', commission_percentage: '', images: [], tags: [],
    weight: '', brand: '',
    likes_count: 0, dislikes_count: 0,
    has_aparat_video: false, aparat_video_link: ''
  }
}

const normalForm = reactive(emptyNormalForm())
const affiliateForm = reactive(emptyAffiliateForm())
const saving = ref(false)
const errorMsg = ref('')
const createdProduct = ref(null)

onMounted(() => {
  categoriesStore.fetchCategories()
  vendorsStore.fetchVendors()
  warehousesStore.fetchWarehouses()
})

async function handleSubmitNormal() {
  errorMsg.value = ''
  if (!normalForm.images.length) {
    errorMsg.value = 'حداقل یک عکس برای محصول انتخاب کنید.'
    return
  }
  saving.value = true
  try {
    createdProduct.value = await productsStore.createProduct({
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
      // در حالت فاقد تنوع رنگی، آرایه رنگ‌ها خالی می‌رود و تعداد از فیلد ساده گرفته می‌شود
      colors: normalForm.has_color_variants ? normalForm.colors : [],
      stock_quantity: normalForm.has_color_variants ? undefined : Number(normalForm.simple_quantity) || 0,
      images: normalForm.images,
      tags: normalForm.tags,
      is_affiliate: false
    })
  } catch (e) {
    errorMsg.value = 'خطا در ثبت محصول: ' + e.message
  } finally {
    saving.value = false
  }
}

async function handleSubmitAffiliate() {
  errorMsg.value = ''
  if (!affiliateForm.images.length) {
    errorMsg.value = 'حداقل یک عکس برای محصول انتخاب کنید.'
    return
  }
  saving.value = true
  try {
    createdProduct.value = await productsStore.createProduct({
      title: affiliateForm.title,
      category_id: affiliateForm.category_id || null,
      is_published: affiliateForm.is_published,
      description: affiliateForm.description,
      sale_price: Number(affiliateForm.sale_price),
      purchase_price: 0,
      stock_quantity: 0,
      dimensions: '',
      weight: affiliateForm.weight || null,
      brand: affiliateForm.brand || null,
      likes_count: Number(affiliateForm.likes_count) || 0,
      dislikes_count: Number(affiliateForm.dislikes_count) || 0,
      aparat_video_link: affiliateForm.has_aparat_video ? (affiliateForm.aparat_video_link || null) : null,
      has_color_variants: false,
      colors: [],
      images: affiliateForm.images,
      tags: affiliateForm.tags,
      is_affiliate: true,
      affiliate_source: affiliateForm.affiliate_source,
      affiliate_link: affiliateForm.affiliate_link,
      affiliate_product_url: affiliateForm.affiliate_product_url || null,
      affiliate_code: affiliateForm.affiliate_code || null,
      commission_percentage: affiliateForm.commission_percentage ? Number(affiliateForm.commission_percentage) : 0
    })
  } catch (e) {
    errorMsg.value = 'خطا در ثبت محصول: ' + e.message
  } finally {
    saving.value = false
  }
}

function resetForCreateAnother() {
  Object.assign(normalForm, emptyNormalForm())
  Object.assign(affiliateForm, emptyAffiliateForm())
  createdProduct.value = null
}
</script>
