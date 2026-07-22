<template>
  <div class="mx-auto max-w-7xl px-3 pb-28 pt-4 sm:px-5 sm:pt-7 lg:pb-8 font-sans text-slate-100" dir="rtl">
    
    <!-- ============================ Loading Skeleton ============================ -->
    <div v-if="pending" class="grid gap-6 lg:grid-cols-2 lg:gap-12">
      <div class="space-y-3">
        <div class="skeleton aspect-square w-full rounded-3xl bg-surface-300/60 border border-glass-border"></div>
        <div class="flex gap-2">
          <div v-for="i in 5" :key="i" class="skeleton h-16 w-16 rounded-xl bg-surface-300/60 border border-glass-border"></div>
        </div>
      </div>
      <div class="space-y-4 pt-2">
        <SkeletonBox height="0.9rem" width="35%" />
        <SkeletonBox height="2.25rem" width="88%" />
        <SkeletonBox height="2rem" width="45%" />
        <div class="skeleton h-px w-full bg-glass-border"></div>
        <SkeletonBox height="2.75rem" width="100%" />
        <SkeletonBox height="3.25rem" width="100%" />
        <SkeletonBox height="2.5rem" width="100%" />
      </div>
    </div>

    <!-- ============================ Product Found ============================ -->
    <div v-else-if="product">
      <!-- ============ HERO: Gallery + Purchase Panel ============ -->
      <div class="grid gap-6 lg:grid-cols-2 lg:gap-12">
        
        <!-- ---------- Gallery (column 1) ---------- -->
        <div class="relative rounded-3xl border border-glass-border bg-surface-400/40 p-2 backdrop-blur-xl shadow-glass-panel">
          <ProductGallery :images="images" />
        </div>

        <!-- ---------- Purchase Panel (column 2, sticky on desktop) ---------- -->
        <div class="lg:sticky lg:top-24 lg:self-start">
          <div class="rounded-3xl border border-glass-border bg-surface-400/80 p-5 shadow-glass-panel backdrop-blur-2xl sm:p-7 relative overflow-hidden">
            
            <!-- نورپردازی پس‌زمینه کارت خرید (Ambient Glow) -->
            <div class="absolute -top-20 -right-20 w-40 h-40 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute -bottom-20 -left-20 w-40 h-40 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <!-- Category chip -->
            <NuxtLink
              v-if="product.categories"
              :to="`/?category=${product.categories.id}`"
              class="inline-flex items-center gap-1.5 rounded-full border border-brand-700/50 bg-brand-900/40 px-3.5 py-1 text-xs font-semibold text-brand-300 transition duration-300 hover:bg-brand-800/60 hover:shadow-[0_0_12px_rgba(120,170,85,0.3)]"
            >
              <i class="fa-solid fa-folder-tree text-[10px]"></i>
              {{ product.categories.title }}
            </NuxtLink>

            <!-- Title -->
            <h1 class="mt-3.5 text-2xl font-black leading-snug text-slate-100 sm:text-3xl tracking-tight">
              {{ product.title }}
            </h1>

            <!-- Admin-only: today's views -->
            <p
              v-if="authStore.user"
              class="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-glass-border bg-surface-200/80 px-3 py-1.5 text-[11px] text-slate-400 backdrop-blur-md"
            >
              <i class="fa-solid fa-eye text-brand-400"></i>
              بازدید امروز این محصول: <span class="font-bold text-slate-200">{{ todayViews }} نفر</span> <span class="text-slate-500">(فقط برای شما)</span>
            </p>

            <!-- Price block -->
            <div class="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span class="text-3xl font-black text-accent drop-shadow-[0_2px_8px_rgba(232,115,74,0.3)]">
                {{ formatToman(finalPrice) }}
                <span class="text-base font-semibold text-slate-300">تومان</span>
              </span>
              <span
                v-if="!product.is_affiliate && product.discount_percentage > 0"
                class="text-lg text-slate-500 line-through"
              >
                {{ formatToman(product.sale_price) }}
              </span>
              <span
                v-if="!product.is_affiliate && product.discount_percentage > 0"
                class="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/15 px-3 py-1 text-xs font-bold text-accent shadow-sm"
              >
                <i class="fa-solid fa-bolt text-[10px] animate-pulse"></i>
                {{ product.discount_percentage }}٪ تخفیف ویژه
              </span>
            </div>

            <div class="my-6 h-px w-full bg-gradient-to-r from-transparent via-glass-border to-transparent"></div>

            <!-- Availability -->
            <div class="flex flex-wrap items-center gap-3">
              <span
                v-if="product.is_affiliate"
                class="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-950/40 px-3.5 py-2 text-sm font-semibold text-sky-300 backdrop-blur-md"
              >
                <i class="fa-solid fa-arrow-up-right-from-square text-xs"></i>
                این محصول از {{ product.affiliate_source }} تهیه می‌شود
              </span>
              <span
                v-else
                class="inline-flex items-center gap-2.5 rounded-xl border px-3.5 py-1.5 text-sm font-semibold backdrop-blur-md"
                :class="inStock 
                  ? 'border-brand-700/60 bg-brand-900/40 text-brand-300' 
                  : 'border-red-500/30 bg-red-950/40 text-red-400'"
              >
                <span class="relative flex h-2.5 w-2.5">
                  <span
                    v-if="inStock"
                    class="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"
                  ></span>
                  <span
                    class="relative inline-flex h-2.5 w-2.5 rounded-full"
                    :class="inStock ? 'bg-brand-500' : 'bg-red-500'"
                  ></span>
                </span>
                {{ inStock ? `موجود در انبار (${product.stock_quantity} عدد)` : 'ناموجود' }}
              </span>
            </div>

            <!-- Notify-when-available (out of stock only) -->
            <div v-if="!product.is_affiliate && !inStock" class="mt-4">
              <button
                v-if="authStore.user"
                type="button"
                class="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/40 px-4 py-2 text-sm font-medium text-amber-300 transition-all hover:bg-amber-900/50 disabled:cursor-default disabled:opacity-60"
                :disabled="notifyRequested"
                @click="handleRequestNotify"
              >
                <i class="fa-solid fa-bell"></i>
                {{ notifyRequested ? 'به‌محض موجود شدن به شما اطلاع داده می‌شود' : 'اطلاع‌رسانی موجود شدن' }}
              </button>
              <NuxtLink
                v-else
                to="/login"
                class="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/40 px-4 py-2 text-sm font-medium text-amber-300 transition-all hover:bg-amber-900/50"
              >
                <i class="fa-solid fa-bell"></i>
                برای اطلاع از موجود شدن، وارد شوید
              </NuxtLink>
            </div>

            <!-- Quantity selector (products without color variants) -->
            <div v-if="!product.is_affiliate && !colors.length" class="mt-6 flex items-center gap-4">
              <span class="text-sm font-semibold text-slate-300">تعداد:</span>
              <div class="flex items-center rounded-2xl border border-glass-border bg-surface-200/90 p-1 shadow-inner">
                <button
                  type="button"
                  class="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition-all hover:bg-surface-50 hover:text-white active:scale-95"
                  @click="selectedQty = Math.min(maxSelectableQty, selectedQty + 1)"
                >
                  <i class="fa-solid fa-plus text-xs"></i>
                </button>
                <span class="w-10 text-center text-base font-black text-slate-100">{{ selectedQty }}</span>
                <button
                  type="button"
                  class="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition-all hover:bg-surface-50 hover:text-white active:scale-95"
                  @click="selectedQty = Math.max(1, selectedQty - 1)"
                >
                  <i class="fa-solid fa-minus text-xs"></i>
                </button>
              </div>
            </div>

            <!-- Color variants preview -->
            <div v-if="colors.length" class="mt-6">
              <div class="mb-3 flex items-center justify-between">
                <span class="text-sm font-semibold text-slate-300">رنگ‌بندی:</span>
                <span class="text-xs text-slate-500 font-mono">{{ colors.length }} گزینه</span>
              </div>
              <div class="flex flex-wrap items-center gap-3">
                <span
                  v-for="c in colors"
                  :key="c.id"
                  class="flex items-center gap-1.5"
                >
                  <span
                    class="h-8 w-8 rounded-full border-2 border-glass-border shadow-md ring-2 ring-surface-300 transition-all hover:scale-110"
                    :style="{ backgroundColor: c.color_hex }"
                    :title="c.color_name"
                  ></span>
                </span>
              </div>
              <p class="mt-2.5 text-xs text-slate-400">تنوع و تعداد را هنگام ثبت سفارش انتخاب می‌کنید.</p>
            </div>

            <div class="my-6 h-px w-full bg-gradient-to-r from-transparent via-glass-border to-transparent"></div>

            <!-- Primary actions -->
            <div class="flex items-center gap-3">
              <a
                v-if="product.is_affiliate"
                :href="product.affiliate_link"
                target="_blank"
                rel="nofollow sponsored noopener"
                class="inline-flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 text-base font-bold text-white shadow-lg shadow-sky-600/30 transition-all duration-300 hover:bg-sky-500 hover:shadow-sky-500/50 active:scale-[0.98]"
              >
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                مشاهده و خرید از {{ product.affiliate_source }}
              </a>
              <BaseButton
                v-else
                class="h-13 flex-1 text-base font-black text-white rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 shadow-neon-purple transition-all duration-300 hover:opacity-95 hover:scale-[1.01] active:scale-[0.98]"
                :disabled="!colors.length && !inStock"
                @click="handlePrimaryAction"
              >
                <i class="fa-solid fa-bag-shopping ml-1.5"></i>
                ثبت سفارش
              </BaseButton>

              <!-- Wishlist -->
              <button
                type="button"
                class="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-glass-border bg-glass-white text-xl transition-all duration-300 hover:border-red-500/50 hover:bg-red-500/10 active:scale-95 shadow-glass-panel"
                :class="isWishlisted ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-slate-400 hover:text-red-400'"
                :title="isWishlisted ? 'حذف از علاقه‌مندی' : 'افزودن به علاقه‌مندی'"
                @click="wishlistStore.toggle(product.id)"
              >
                <i :class="isWishlisted ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
              </button>

              <!-- Share -->
              <button
                v-if="!product.is_affiliate"
                type="button"
                class="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-glass-border bg-glass-white text-xl text-slate-400 transition-all duration-300 hover:border-brand-500/50 hover:bg-brand-500/10 hover:text-brand-300 active:scale-95 shadow-glass-panel"
                title="اشتراک‌گذاری"
                @click="handleShare"
              >
                <i class="fa-solid fa-share-nodes"></i>
              </button>
            </div>

            <p v-if="addToCartError" class="mt-3.5 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/30 p-2.5 text-xs font-semibold text-red-400">
              <i class="fa-solid fa-circle-exclamation text-sm"></i>
              {{ addToCartError }}
            </p>

            <!-- Trust badges -->
            <div
              v-if="!product.is_affiliate"
              class="mt-7 grid grid-cols-3 gap-3 border-t border-glass-border pt-6"
            >
              <div class="flex flex-col items-center gap-2 text-center group">
                <div class="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-700/50 bg-brand-900/30 text-brand-300 transition-transform duration-300 group-hover:scale-110">
                  <i class="fa-solid fa-truck-fast text-sm"></i>
                </div>
                <span class="text-[11px] font-medium text-slate-400">ارسال سریع</span>
              </div>
              <div class="flex flex-col items-center gap-2 text-center group">
                <div class="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-700/50 bg-brand-900/30 text-brand-300 transition-transform duration-300 group-hover:scale-110">
                  <i class="fa-solid fa-shield-halved text-sm"></i>
                </div>
                <span class="text-[11px] font-medium text-slate-400">پرداخت امن</span>
              </div>
              <div class="flex flex-col items-center gap-2 text-center group">
                <div class="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-700/50 bg-brand-900/30 text-brand-300 transition-transform duration-300 group-hover:scale-110">
                  <i class="fa-solid fa-rotate-left text-sm"></i>
                </div>
                <span class="text-[11px] font-medium text-slate-400">ضمانت بازگشت</span>
              </div>
            </div>
          </div>

          <!-- Quick highlights under the buy-box (brand / vendor / weight / dimensions) -->
          <div
            v-if="product.brand || product.vendors || product.weight || product.dimensions"
            class="mt-4 grid grid-cols-2 gap-3"
          >
            <div v-if="product.brand" class="flex items-center gap-2.5 rounded-2xl border border-glass-border bg-surface-400/60 p-3.5 backdrop-blur-xl">
              <i class="fa-solid fa-copyright text-brand-400 text-sm"></i>
              <span class="text-xs text-slate-400">برند</span>
              <span class="mr-auto truncate text-xs font-bold text-slate-200">{{ product.brand }}</span>
            </div>
            <div v-if="product.vendors" class="flex items-center gap-2.5 rounded-2xl border border-glass-border bg-surface-400/60 p-3.5 backdrop-blur-xl">
              <i class="fa-solid fa-store text-brand-400 text-sm"></i>
              <span class="text-xs text-slate-400">فروشنده</span>
              <span class="mr-auto truncate text-xs font-bold text-slate-200">{{ product.vendors.name }}</span>
            </div>
            <div v-if="product.weight" class="flex items-center gap-2.5 rounded-2xl border border-glass-border bg-surface-400/60 p-3.5 backdrop-blur-xl">
              <i class="fa-solid fa-weight-hanging text-brand-400 text-sm"></i>
              <span class="text-xs text-slate-400">وزن</span>
              <span class="mr-auto truncate text-xs font-bold text-slate-200">{{ product.weight }}</span>
            </div>
            <div v-if="product.dimensions" class="flex items-center gap-2.5 rounded-2xl border border-glass-border bg-surface-400/60 p-3.5 backdrop-blur-xl">
              <i class="fa-solid fa-ruler-combined text-brand-400 text-sm"></i>
              <span class="text-xs text-slate-400">ابعاد</span>
              <span class="mr-auto truncate text-xs font-bold text-slate-200">{{ product.dimensions }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ DESCRIPTION + FEEDBACK ============ -->
      <section v-if="product.description" class="mt-12">
        <div class="rounded-3xl border border-glass-border bg-surface-400/70 p-6 backdrop-blur-2xl shadow-glass-panel sm:p-8 relative overflow-hidden">
          <h2 class="mb-5 flex items-center gap-2.5 text-xl font-black text-slate-100 border-r-4 border-brand-700 pr-3">
            <i class="fa-solid fa-align-right text-brand-400"></i>
            معرفی و جزییات محصول
          </h2>
          <p class="whitespace-pre-line text-sm sm:text-base leading-8 text-slate-300">
            {{ product.description }}
          </p>

          <!-- Tags -->
          <div v-if="product.tags?.length" class="mt-7 flex flex-wrap gap-2.5">
            <span
              v-for="tag in product.tags"
              :key="tag"
              class="inline-flex items-center rounded-xl border border-glass-border bg-surface-200/80 px-3.5 py-1.5 text-xs text-slate-300 transition-all duration-300 hover:border-brand-500/40 hover:bg-brand-900/30 hover:text-brand-300"
            >
              #{{ tag }}
            </span>
          </div>

          <!-- Like / Dislike -->
          <div class="mt-8 border-t border-glass-border pt-6">
            <ProductLikeButtons
              :product-id="product.id"
              :initial-likes="product.likes_count || 0"
              :initial-dislikes="product.dislikes_count || 0"
            />
          </div>
        </div>
      </section>

      <!-- ============ APARAT VIDEO ============ -->
      <div class="mt-8">
        <ProductAparatVideo v-if="product" :aparat-link="product.aparat_video_link" />
      </div>

      <!-- ============ COMMENTS ============ -->
      <div class="mt-8">
        <ProductComments v-if="product" :product-id="product.id" />
      </div>

      <!-- ============ RELATED PRODUCTS ============ -->
      <div class="mt-8">
        <RelatedProducts v-if="product" :exclude-id="product.id" />
      </div>

      <!-- Color + quantity picker sheet (opened by «ثبت سفارش» for color products) -->
      <ResponsiveSheet v-model="colorSheetOpen" title="تعیین تعداد و تنوع سفارش">
        <ColorQuantityPicker :colors="colors" @confirm="handleColorRowsConfirmed" />
      </ResponsiveSheet>

      <!-- ============================ Sticky mobile action bar ============================ -->
      <div
        class="fixed inset-x-0 bottom-0 z-40 border-t border-glass-border bg-surface-500/90 backdrop-blur-2xl lg:hidden shadow-[0_-8px_25px_rgba(0,0,0,0.5)]"
        style="padding-bottom: env(safe-area-inset-bottom)"
      >
        <div class="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3.5">
          <!-- Price (hidden for affiliate) -->
          <div v-if="!product.is_affiliate" class="shrink-0">
            <p class="text-[10px] font-medium text-slate-400">قیمت نهایی</p>
            <p class="text-base font-black text-accent">{{ formatToman(finalPrice) }} <span class="text-xs font-normal text-slate-300">تومان</span></p>
          </div>

          <a
            v-if="product.is_affiliate"
            :href="product.affiliate_link"
            target="_blank"
            rel="nofollow sponsored noopener"
            class="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-bold text-white shadow-lg shadow-sky-600/30 active:scale-95"
          >
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
            خرید از {{ product.affiliate_source }}
          </a>
          <BaseButton
            v-else
            class="h-12 flex-1 text-sm font-black text-white rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-neon-purple active:scale-95"
            :disabled="!colors.length && !inStock"
            @click="handlePrimaryAction"
          >
            <i class="fa-solid fa-bag-shopping ml-1"></i>
            ثبت سفارش
          </BaseButton>

          <button
            type="button"
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-glass-border bg-glass-white text-lg active:scale-95"
            :class="isWishlisted ? 'text-red-500' : 'text-slate-400'"
            @click="wishlistStore.toggle(product.id)"
          >
            <i :class="isWishlisted ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- ============================ Not Found ============================ -->
    <div v-else class="flex flex-col items-center justify-center py-28 text-center">
      <div class="flex h-24 w-24 items-center justify-center rounded-3xl border border-glass-border bg-surface-300/50 text-4xl text-slate-500 shadow-glass-panel backdrop-blur-xl">
        <i class="fa-solid fa-box-open"></i>
      </div>
      <p class="mt-6 text-xl font-bold text-slate-200">محصول مورد نظر یافت نشد</p>
      <NuxtLink
        to="/"
        class="mt-5 inline-flex items-center gap-2 rounded-2xl border border-brand-700/60 bg-brand-800 px-6 py-3 text-sm font-bold text-slate-100 shadow-[0_0_20px_rgba(120,170,85,0.3)] transition-all duration-300 hover:bg-brand-700 hover:scale-105 active:scale-95"
      >
        <i class="fa-solid fa-house"></i>
        بازگشت به فروشگاه
      </NuxtLink>
    </div>
  </div>
</template>
