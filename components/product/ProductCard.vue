<template>
  <!--
    کارت محصول - نسخه عکس تمام‌سایز (Photo-first): عکس کل کارت را پر می‌کند
    نسبت ابعاد ۳:۴ (مستطیل عمودی هارمونیک) و همه اطلاعات به‌صورت لایه روی عکس قرار می‌گیرند
    چون متن سفید روی گرادیانت تیره است، در هر دو حالت روشن/تیره سایت یکسان و خوانا می‌ماند
  -->
  <div class="group relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-md ring-1 ring-stone-200/70 transition hover:shadow-xl dark:shadow-[0_8px_30px_rgba(255,255,255,0.07)] dark:ring-white/10">
    <!-- ستون رنگ‌بندی محصول - بالا سمت چپ -->
    <div
      v-if="colors.length"
      class="absolute left-2 top-2 z-20 flex flex-col overflow-hidden rounded-lg shadow-lg ring-1 ring-white/70"
    >
      <span
        v-for="c in colors"
        :key="c.id"
        class="h-5 w-6"
        :style="{ backgroundColor: c.color_hex }"
        :title="c.color_name"
      />
    </div>

    <!-- بج تخفیف - بالا سمت راست -->
    <span
      v-if="product.discount_percentage > 0"
      class="absolute right-2 top-2 z-20 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white shadow"
    >
      {{ product.discount_percentage }}٪ تخفیف
    </span>

    <component :is="linkTag" v-bind="linkProps" class="block h-full w-full">
      <!-- عکس محصول - کل کارت را پر می‌کند -->
      <img
        :src="coverImage"
        :alt="product.title"
        class="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />

      <!-- گرادیانت تیره برای خوانایی متن سفید روی هر عکسی -->
      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

      <!-- ردیف پایین: قیمت (راست) + قلب/اشتراک‌گذاری/موجودی (چپ) -->
      <div class="absolute inset-x-0 bottom-9 z-20 flex items-end justify-between px-3">
        <!-- راست: قیمت (قیمت قبل از تخفیف بالای قیمت جدید) -->
        <div>
          <div v-if="product.discount_percentage > 0" class="text-[11px] text-white/70 line-through">
            {{ formatToman(product.sale_price) }} تومان
          </div>
          <span class="text-base font-bold text-white drop-shadow-md">{{ formatToman(finalPrice) }} تومان</span>
        </div>

        <!-- چپ: قلب و اشتراک‌گذاری بالای وضعیت موجودی -->
        <div class="flex flex-col items-center gap-2">
          <button
            class="flex h-7 w-7 items-center justify-center text-white drop-shadow-md transition hover:scale-110"
            @click.prevent="wishlistStore.toggle(product.id)"
          >
            <i :class="isWishlisted ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart'"></i>
          </button>
          <button
            class="flex h-7 w-7 items-center justify-center text-white drop-shadow-md transition hover:scale-110"
            @click.prevent="handleShare"
          >
            <i class="fa-solid fa-share-nodes"></i>
          </button>

          <span
            v-if="product.is_affiliate"
            class="rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-medium text-sky-300 backdrop-blur-sm"
          >
            {{ product.affiliate_source || 'لینک خارجی' }} ↗
          </span>
          <span
            v-else
            class="rounded-full bg-black/40 px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm"
            :class="inStock ? 'text-emerald-300' : 'text-red-300'"
          >
            {{ inStock ? 'موجود' : 'ناموجود' }}
          </span>
        </div>
      </div>

      <!-- نام محصول - پایین‌ترین بخش کارت، وسط‌چین -->
      <h3 class="absolute inset-x-0 bottom-2 z-20 line-clamp-1 px-3 text-center text-sm font-semibold text-white drop-shadow-md">
        {{ product.title }}
      </h3>
    </component>
  </div>
</template>

<script setup>
import { computed, resolveComponent } from 'vue'
import { useWishlistStore } from '~/stores/wishlist'
import { getCoverImage, getSortedColors, getFinalPrice, isInStock, formatToman } from '~/composables/useProductHelpers'

const props = defineProps({
  product: { type: Object, required: true }
})

const wishlistStore = useWishlistStore()

const coverImage = computed(() => getCoverImage(props.product))
const colors = computed(() => getSortedColors(props.product))
const finalPrice = computed(() => getFinalPrice(props.product))
const inStock = computed(() => isInStock(props.product))
const isWishlisted = computed(() => wishlistStore.isWishlisted(props.product.id))

// محصول affiliate: با کلیک، در تب جدید به لینک اختصاصی سایت مبدأ می‌رود (نه صفحه داخلی محصول)
const NuxtLinkComp = resolveComponent('NuxtLink')
const linkTag = computed(() => (props.product.is_affiliate ? 'a' : NuxtLinkComp))
const linkProps = computed(() =>
  props.product.is_affiliate
    ? { href: props.product.affiliate_link, target: '_blank', rel: 'nofollow sponsored noopener' }
    : { to: `/products/${props.product.id}` }
)

// اشتراک‌گذاری محصول - از Web Share API مرورگر استفاده می‌شود و در صورت نبودن، لینک کپی می‌شود
async function handleShare() {
  if (!import.meta.client) return
  const url = `${window.location.origin}/products/${props.product.id}`
  if (navigator.share) {
    try {
      await navigator.share({ title: props.product.title, url })
    } catch (e) {
      // کاربر اشتراک‌گذاری را لغو کرده - نیازی به کاری نیست
    }
  } else {
    await navigator.clipboard.writeText(url)
    alert('لینک محصول کپی شد.')
  }
}
</script>
