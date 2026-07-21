<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <div v-if="pending" class="grid gap-8 md:grid-cols-2">
      <div class="space-y-3">
        <div class="skeleton aspect-square w-full rounded-xl"></div>
        <div class="flex gap-2">
          <div v-for="i in 4" :key="i" class="skeleton h-16 w-16 rounded-lg"></div>
        </div>
      </div>
      <div class="space-y-3">
        <SkeletonBox height="1.75rem" width="70%" />
        <SkeletonBox height="1.5rem" width="40%" />
        <SkeletonBox height="1rem" width="30%" />
        <SkeletonBox height="6rem" width="100%" />
        <SkeletonBox height="2.5rem" width="50%" />
      </div>
    </div>

    <div v-else-if="product" class="grid gap-8 md:grid-cols-2">
      <ProductGallery :images="images" />

      <div>
        <p v-if="product.categories" class="mb-1 text-xs text-brand-600 dark:text-brand-400">
          {{ product.categories.title }}
        </p>
        <h1 class="text-2xl font-bold text-stone-800 dark:text-stone-100">{{ product.title }}</h1>

        <!-- آمار بازدید روزانه - فقط برای ادمین (کاربر لاگین‌کرده) نمایش داده می‌شود -->
        <p v-if="authStore.user" class="mt-1 text-xs text-stone-400 dark:text-stone-500">
          👁 بازدید امروز این محصول: {{ todayViews }} نفر (فقط برای شما قابل مشاهده است)
        </p>

        <div class="mt-3 flex items-center gap-3">
          <span class="text-2xl font-bold text-accent">{{ formatToman(finalPrice) }} تومان</span>
          <span v-if="!product.is_affiliate && product.discount_percentage > 0" class="text-sm text-stone-400 line-through">
            {{ formatToman(product.sale_price) }}
          </span>
          <span v-if="!product.is_affiliate && product.discount_percentage > 0" class="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
            {{ product.discount_percentage }}٪ تخفیف
          </span>
        </div>

        <!-- محصول Affiliate: نشان سایت مبدأ به‌جای موجودی -->
        <span v-if="product.is_affiliate" class="mt-2 inline-block rounded-md bg-sky-50 px-2 py-1 text-sm font-medium text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
          این محصول از {{ product.affiliate_source }} تهیه می‌شود
        </span>
        <span v-else class="mt-2 inline-block text-sm" :class="inStock ? 'text-brand-600 dark:text-brand-400' : 'text-red-500'">
          {{ inStock ? `موجود (${product.stock_quantity} عدد)` : 'ناموجود' }}
        </span>

        <!-- زنگوله اطلاع‌رسانی موجود شدن مجدد (فقط برای محصولات ناموجود و کاربر لاگین‌کرده) -->
        <div v-if="!product.is_affiliate && !inStock" class="mt-2">
          <button
            v-if="authStore.user"
            type="button"
            class="flex items-center gap-1.5 text-sm text-amber-600 hover:underline dark:text-amber-400"
            :disabled="notifyRequested"
            @click="handleRequestNotify"
          >
            <i class="fa-solid fa-bell"></i>
            {{ notifyRequested ? 'به شما اطلاع داده خواهد شد' : 'اطلاع بده موجود شد' }}
          </button>
          <NuxtLink v-else to="/login" class="flex items-center gap-1.5 text-sm text-amber-600 hover:underline dark:text-amber-400">
            <i class="fa-solid fa-bell"></i> برای اطلاع از موجود شدن، وارد شوید
          </NuxtLink>
        </div>

        <!-- تعداد (فقط محصولات بدون رنگ‌بندی) -->
        <div v-if="!product.is_affiliate && !colors.length" class="mt-4 flex items-center gap-2">
          <label class="text-sm font-medium text-stone-700 dark:text-stone-300">تعداد:</label>
          <div class="flex items-center gap-2">
            <button type="button" class="h-7 w-7 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300" @click="selectedQty = Math.min(maxSelectableQty, selectedQty + 1)">+</button>
            <span class="w-6 text-center dark:text-stone-200">{{ selectedQty }}</span>
            <button type="button" class="h-7 w-7 rounded-full border border-stone-300 text-stone-600 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-300" @click="selectedQty = Math.max(1, selectedQty - 1)">-</button>
          </div>
        </div>

        <!-- ابعاد (فقط محصولات معمولی) -->
        <p v-if="!product.is_affiliate && product.dimensions" class="mt-4 text-sm text-stone-600 dark:text-stone-400">
          <span class="font-medium text-stone-800 dark:text-stone-200">ابعاد: </span>{{ product.dimensions }}
        </p>

        <!-- فروشنده (فقط محصولات معمولی) -->
        <p v-if="!product.is_affiliate && product.vendors" class="mt-1 text-sm text-stone-600 dark:text-stone-400">
          <span class="font-medium text-stone-800 dark:text-stone-200">فروشنده: </span>{{ product.vendors.name }}
        </p>

        <!-- وزن محصول -->
        <p v-if="product.weight" class="mt-1 text-sm text-stone-600 dark:text-stone-400">
          <span class="font-medium text-stone-800 dark:text-stone-200">وزن: </span>{{ product.weight }}
        </p>

        <!-- برند محصول -->
        <p v-if="product.brand" class="mt-1 text-sm text-stone-600 dark:text-stone-400">
          <span class="font-medium text-stone-800 dark:text-stone-200">برند: </span>{{ product.brand }}
        </p>

        <!-- لایک / دیس‌لایک با آیکون شست بالا و پایین -->
        <ProductLikeButtons
          :product-id="product.id"
          :initial-likes="product.likes_count || 0"
          :initial-dislikes="product.dislikes_count || 0"
        />

        <p class="mt-4 leading-7 text-stone-600 dark:text-stone-400">{{ product.description }}</p>

        <!-- تگ‌های سئو -->
        <div v-if="product.tags?.length" class="mt-4 flex flex-wrap gap-2">
          <span v-for="tag in product.tags" :key="tag" class="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600 dark:bg-stone-800 dark:text-stone-300">
            #{{ tag }}
          </span>
        </div>

        <!-- محصول Affiliate: دکمه هدایت به سایت مبدأ در تب جدید - محصول معمولی: افزودن به سبد خرید -->
        <div class="mt-6 flex items-center gap-3">
          <a
            v-if="product.is_affiliate"
            :href="product.affiliate_link"
            target="_blank"
            rel="nofollow sponsored noopener"
            class="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            مشاهده و خرید از {{ product.affiliate_source }} ↗
          </a>
          <BaseButton v-else :disabled="!colors.length && !inStock" @click="handlePrimaryAction">ثبت سفارش</BaseButton>
          <button class="text-2xl" @click="wishlistStore.toggle(product.id)">
            <span v-if="wishlistStore.isWishlisted(product.id)">❤️</span>
            <span v-else>🤍</span>
          </button>
        </div>
        <p v-if="addToCartError" class="mt-2 text-sm text-red-600">{{ addToCartError }}</p>
      </div>
    </div>

    <p v-else class="text-stone-500">محصول مورد نظر یافت نشد.</p>

    <!-- ویدیوی معرفی محصول از آپارات - فقط اگر لینک ثبت شده باشد نمایش داده می‌شود -->
    <ProductAparatVideo v-if="product" :aparat-link="product.aparat_video_link" />

    <ProductComments v-if="product" :product-id="product.id" />

    <RelatedProducts v-if="product" :exclude-id="product.id" />

    <!-- popup انتخاب چندگانه رنگ + تعداد (در موبایل از پایین صفحه بالا می‌آید) - با دکمه «ثبت سفارش» باز می‌شود -->
    <ResponsiveSheet v-model="colorSheetOpen" title="تعیین تعداد و تنوع سفارش">
      <ColorQuantityPicker :colors="colors" @confirm="handleColorRowsConfirmed" />
    </ResponsiveSheet>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useCartStore } from '~/stores/cart'
import { useWishlistStore } from '~/stores/wishlist'
import { useProductsStore } from '~/stores/products'
import { useAuthStore } from '~/stores/auth'
import { useAnalyticsStore } from '~/stores/analytics'
import { useNotificationsStore } from '~/stores/notifications'
import ProductGallery from '~/components/product/ProductGallery.vue'
import RelatedProducts from '~/components/product/RelatedProducts.vue'
import ProductComments from '~/components/product/ProductComments.vue'
import ProductLikeButtons from '~/components/product/ProductLikeButtons.vue'
import ProductAparatVideo from '~/components/product/ProductAparatVideo.vue'
import ResponsiveSheet from '~/components/common/ResponsiveSheet.vue'
import ColorQuantityPicker from '~/components/product/ColorQuantityPicker.vue'
import BaseButton from '~/components/common/BaseButton.vue'
import SkeletonBox from '~/components/common/SkeletonBox.vue'
import { getSortedImages, getSortedColors, getFinalPrice, isInStock, formatToman } from '~/composables/useProductHelpers'

const route = useRoute()
const cartStore = useCartStore()
const wishlistStore = useWishlistStore()
const productsStore = useProductsStore()
const authStore = useAuthStore()
const analyticsStore = useAnalyticsStore()
const notificationsStore = useNotificationsStore()

// useAsyncData باعث می‌شود اطلاعات محصول در سمت سرور رندر شود (مهم برای سئو)
const { data: product, pending } = await useAsyncData(`product-${route.params.id}`, () =>
  productsStore.fetchProductById(route.params.id)
)

const images = computed(() => (product.value ? getSortedImages(product.value) : []))
const rawColors = computed(() => (product.value ? getSortedColors(product.value) : []))
const finalPrice = computed(() => (product.value ? getFinalPrice(product.value) : 0))
const inStock = computed(() => (product.value ? isInStock(product.value) : false))

const selectedQty = ref(1)
const addToCartError = ref('')
const colorSheetOpen = ref(false)
const availableStock = ref(null) // { available, colorAvailability } - موجودی واقعی در دسترسِ این کاربر

// موجودی هر رنگ = موجودی در دسترس (رزروشده توسط سایر کاربران کسر شده) منهای مقداری که خودِ این کاربر از قبل در سبدش دارد
const colors = computed(() =>
  rawColors.value.map((c) => {
    const availableForAll = availableStock.value?.colorAvailability?.[c.id] ?? c.quantity
    const alreadyInMyCart = cartStore.items
      .filter((i) => i.id === product.value?.id && i.color_id === c.id)
      .reduce((sum, i) => sum + i.quantity, 0)
    return { ...c, quantity: Math.max(0, availableForAll - alreadyInMyCart) }
  })
)

const maxSelectableQty = computed(() => {
  if (!product.value) return 1
  const availableForAll = availableStock.value?.available ?? product.value.stock_quantity
  const alreadyInMyCart = cartStore.items
    .filter((i) => i.id === product.value.id && !i.color_id)
    .reduce((sum, i) => sum + i.quantity, 0)
  return Math.max(1, availableForAll - alreadyInMyCart)
})

const todayViews = ref(0)
const notifyRequested = ref(false)

// ثبت بازدید این صفحه (همراه با شناسه محصول - برای گزارش «پربازدیدترین محصولات»)
// و در صورتی که کاربر ادمین (لاگین‌کرده) باشد، آمار بازدید امروز را می‌خوانیم
if (import.meta.client && product.value) {
  analyticsStore.logPageView(route.fullPath, product.value.id)
  authStore.fetchUser().then(async (user) => {
    if (user) {
      todayViews.value = await analyticsStore.fetchTodayProductViews(product.value.id)
      notifyRequested.value = await notificationsStore.hasRequestedStockNotification(user.id, product.value.id)
    }
    // موجودی واقعی در دسترس (با احتساب رزرو سفارش‌های در انتظار پرداخت سایر کاربران) را همیشه محاسبه می‌کنیم
    availableStock.value = await productsStore.fetchAvailableStock(product.value.id, user?.id || null)
  })
}

useSeoMeta({
  title: () => product.value?.title || 'محصول',
  description: () => product.value?.description?.slice(0, 150) || ''
})

// دکمه «ثبت سفارش»: اگر محصول رنگ‌بندی دارد، popup انتخاب تنوع را باز می‌کند؛
// اگر رنگ‌بندی ندارد، مستقیماً با تعداد انتخاب‌شده به سبد خرید اضافه می‌کند
function handlePrimaryAction() {
  addToCartError.value = ''
  if (colors.value.length) {
    colorSheetOpen.value = true
  } else {
    cartStore.addItem({ ...product.value, coverImage: images.value[0] }, selectedQty.value, null)
  }
}

// دکمه «افزودن به سبد خرید» داخل popup: تمام ردیف‌های رنگ+تعداد انتخاب‌شده را به سبد اضافه و popup را می‌بندد
function handleColorRowsConfirmed(rows) {
  for (const row of rows) {
    cartStore.addItem(
      { ...product.value, coverImage: images.value[0] },
      row.quantity,
      { id: row.colorId, name: row.name, hex: row.hex }
    )
  }
  colorSheetOpen.value = false
}

async function handleRequestNotify() {
  if (!authStore.user) return
  await notificationsStore.requestStockNotification(authStore.user.id, product.value.id)
  notifyRequested.value = true
}
</script>
