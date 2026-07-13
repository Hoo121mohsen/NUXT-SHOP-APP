<template>
  <!--
    کارت محصول - نسخه عکس تمام‌سایز (Photo-first)
    بهینه‌شده با سیستم طراحی برند (رنگ‌های زمردی و نارنجی گرم، انحنای xl2)
  -->
  <div class="group relative aspect-[3/4] w-full overflow-hidden rounded-xl2 shadow-md ring-1 ring-stone-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:shadow-[0_8px_30px_rgba(255,255,255,0.07)] dark:ring-white/10">
    
    <!-- ستون رنگ‌بندی محصول - بالا سمت چپ -->
    <div
      v-if="colors.length"
      class="absolute left-2 top-2 z-20 flex flex-col overflow-hidden rounded-md shadow-lg ring-1 ring-white/40"
    >
      <span
        v-for="c in colors"
        :key="c.id"
        class="h-5 w-6 transition-transform duration-200 hover:scale-110"
        :style="{ backgroundColor: c.color_hex }"
        :title="c.color_name"
      />
    </div>

    <!-- بج تخفیف - بالا سمت راست (استفاده از رنگ جذاب accent) -->
    <span
      v-if="product.discount_percentage > 0"
      class="absolute right-2 top-2 z-20 rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-white shadow-md backdrop-blur-sm animate-pulse"
    >
      {{ product.discount_percentage }}٪ تخفیف
    </span>

    <component :is="linkTag" v-bind="linkProps" class="block h-full w-full">
      <!-- عکس محصول - کل کارت را پر می‌کند -->
      <img
        :src="coverImage"
        :alt="product.title"
        class="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        loading="lazy"
      />

      <!-- گرادیانت تیره برای خوانایی متن سفید روی هر عکسی (با تناژ خیلی ملایم سبز تیره برند در تاریکی) -->
      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />

      <!-- ردیف پایین: قیمت (راست) + قلب/اشتراک‌گذاری/موجودی (چپ) -->
      <div class="absolute inset-x-0 bottom-10 z-20 flex items-end justify-between px-3">
        <!-- راست: قیمت (استفاده از رنگ زنده accent برای بازدهی بیشتر فروش) -->
        <div class="flex flex-col gap-0.5">
          <div v-if="product.discount_percentage > 0" class="text-[11px] text-white/60 line-through decoration-white/40">
            {{ formatToman(product.sale_price) }} تومان
          </div>
          <span class="text-base font-bold text-accent drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {{ formatToman(finalPrice) }} <span class="text-[10px] font-normal text-white/90">تومان</span>
          </span>
        </div>

        <!-- چپ: قلب و اشتراک‌گذاری بالای وضعیت موجودی -->
        <div class="flex flex-col items-center gap-2">
          <!-- دکمه پسندیدن -->
          <button
            class="flex h-8 w-8 items-center justify-center rounded-full bg-stone-950/30 text-white backdrop-blur-sm drop-shadow-md transition duration-200 hover:bg-stone-950/50 hover:scale-110"
            @click.prevent="wishlistStore.toggle(product.id)"
          >
            <i :class="isWishlisted ? 'fa-solid fa-heart text-red-500 scale-110' : 'fa-regular fa-heart'"></i>
          </button>
          
          <!-- دکمه اشتراک گذاری -->
          <button
            class="flex h-8 w-8 items-center justify-center rounded-full bg-stone-950/30 text-white backdrop-blur-sm drop-shadow-md transition duration-200 hover:bg-stone-950/50 hover:scale-110"
            @click.prevent="handleShare"
          >
            <i class="fa-solid fa-share-nodes"></i>
          </button>

          <!-- وضعیت موجودی یا لینک خارجی (با استفاده از پالت سبز زمردی brand شما) -->
          <span
            v-if="product.is_affiliate"
            class="rounded-full bg-stone-950/50 px-2 py-0.5 text-[10px] font-medium text-sky-300 backdrop-blur-sm"
          >
            {{ product.affiliate_source || 'لینک خارجی' }} ↗
          </span>
          <span
            v-else
            class="rounded-full bg-stone-950/50 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm transition-colors"
            :class="inStock ? 'text-brand-300' : 'text-red-400'"
          >
            {{ inStock ? 'موجود' : 'ناموجود' }}
          </span>
        </div>
      </div>

      <!-- نام محصول - پایین‌ترین بخش کارت، وسط‌چین -->
      <h3 class="absolute inset-x-0 bottom-2.5 z-20 line-clamp-1 px-3 text-center text-sm font-medium text-stone-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] group-hover:text-white transition-colors">
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
