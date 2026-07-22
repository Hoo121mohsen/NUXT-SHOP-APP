<template>
  <div class="mx-auto max-w-7xl px-3 pb-28 pt-4 sm:px-5 sm:pt-7 lg:pb-12 font-sans text-slate-100" dir="rtl">
    
    <!-- ============================ Loading Skeleton ============================ -->
    <div v-if="pending" class="grid gap-6 lg:grid-cols-2 lg:gap-12">
      <div class="space-y-3">
        <div class="skeleton aspect-square w-full rounded-[1.75rem] bg-surface-300/60 border border-glass-border"></div>
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
      <div class="grid gap-6 lg:grid-cols-12 lg:gap-8">
        
        <!-- ---------- Gallery (7 cols on desktop) ---------- -->
        <div class="lg:col-span-7">
          <div class="relative rounded-[1.75rem] border border-glass-border bg-surface-400/40 p-2 backdrop-blur-xl shadow-glass-panel">
            <ProductGallery :images="images" />
          </div>
        </div>

        <!-- ---------- Purchase Panel (5 cols on desktop, sticky) ---------- -->
        <div class="lg:col-span-5 lg:sticky lg:top-24 lg:self-start space-y-4">
          <div class="rounded-[1.75rem] border border-glass-border bg-surface-400/80 p-5 shadow-glass-panel backdrop-blur-2xl sm:p-6 relative overflow-hidden">
            
            <!-- نورپردازی پس‌زمینه کارت (Ambient Glow) -->
            <div class="absolute -top-20 -right-20 w-40 h-40 bg-brand-600/15 rounded-full blur-3xl pointer-events-none"></div>
            <div class="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

            <!-- Header Row: Category Chip + Action Icons (Heart & Share) -->
            <div class="flex items-center justify-between gap-2 mb-4">
              <NuxtLink
                v-if="product.categories"
                :to="`/?category=${product.categories.id}`"
                class="inline-flex items-center gap-1.5 rounded-full border border-brand-700/50 bg-brand-900/40 px-3.5 py-1.5 text-xs font-bold text-brand-300 transition duration-300 hover:bg-brand-800/60 hover:shadow-[0_0_12px_rgba(120,170,85,0.3)]"
              >
                <i class="fa-solid fa-folder-tree text-[10px]"></i>
                {{ product.categories.title }}
              </NuxtLink>

              <!-- آیکون‌های اختصاصی بالا: قلب و اشتراک‌گذاری -->
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="flex h-10 w-10 items-center justify-center rounded-xl border border-glass-border bg-surface-300/60 text-base transition-all duration-300 hover:border-red-500/50 hover:bg-red-500/10 active:scale-95 shadow-sm"
                  :class="isWishlisted ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'text-slate-400 hover:text-red-400'"
                  :title="isWishlisted ? 'حذف از علاقه‌مندی' : 'افزودن به علاقه‌مندی'"
                  @click="wishlistStore.toggle(product.id)"
                >
                  <i :class="isWishlisted ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
                </button>

                <button
                  v-if="!product.is_affiliate"
                  type="button"
                  class="flex h-10 w-10 items-center justify-center rounded-xl border border-glass-border bg-surface-300/60 text-base text-slate-400 transition-all duration-300 hover:border-brand-500/50 hover:bg-brand-500/10 hover:text-brand-300 active:scale-95 shadow-sm"
                  title="اشتراک‌گذاری"
                  @click="handleShare"
                >
                  <i class="fa-solid fa-share-nodes"></i>
                </button>
              </div>
            </div>

            <!-- Title -->
            <h1 class="text-xl font-black leading-snug text-slate-100 sm:text-2xl tracking-tight">
              {{ product.title }}
            </h1>

            <!-- Admin-only: today's views -->
            <p
              v-if="authStore.user"
              class="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-glass-border bg-surface-200/80 px-3 py-1.5 text-[11px] text-slate-400 backdrop-blur-md"
            >
              <i class="fa-solid fa-eye text-brand-400"></i>
              بازدید امروز این محصول: <span class="font-bold text-slate-200">{{ todayViews }} نفر</span> <span class="text-slate-500">(مخصوص مدیریت)</span>
            </p>

            <div class="my-5 h-px w-full bg-gradient-to-r from-transparent via-glass-border to-transparent"></div>

            <!-- Availability -->
            <div class="flex flex-wrap items-center gap-3">
              <span
                v-if="product.is_affiliate"
                class="inline-flex items-center gap-1.5 rounded-xl border border-sky-500/30 bg-sky-950/40 px-3.5 py-1.5 text-xs font-semibold text-sky-300 backdrop-blur-md"
              >
                <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                تأمین از {{ product.affiliate_source }}
              </span>
              <span
                v-else
                class="inline-flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs font-bold backdrop-blur-md"
                :class="inStock 
                  ? 'border-brand-700/60 bg-brand-900/40 text-brand-300' 
                  : 'border-red-500/30 bg-red-950/40 text-red-400'"
              >
                <span class="relative flex h-2 w-2">
                  <span
                    v-if="inStock"
                    class="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"
                  ></span>
                  <span
                    class="relative inline-flex h-2 w-2 rounded-full"
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
                class="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/40 px-4 py-2.5 text-xs font-bold text-amber-300 transition-all hover:bg-amber-900/50 disabled:opacity-60"
                :disabled="notifyRequested"
                @click="handleRequestNotify"
              >
                <i class="fa-solid fa-bell"></i>
                {{ notifyRequested ? 'به‌محض موجود شدن اطلاع داده می‌شود' : 'اطلاع‌رسانی موجود شدن' }}
              </button>
              <NuxtLink
                v-else
                to="/login"
                class="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/40 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-900/50"
              >
                <i class="fa-solid fa-bell"></i>
                برای اطلاع از موجود شدن، وارد شوید
              </NuxtLink>
            </div>

            <!-- Quantity selector (products without color variants) -->
            <div v-if="!product.is_affiliate && !colors.length" class="mt-5 flex items-center justify-between rounded-2xl border border-glass-border bg-surface-300/40 p-2.5">
              <span class="text-xs font-bold text-slate-300">تعداد سفارش:</span>
              <div class="flex items-center rounded-xl border border-glass-border bg-surface-200/90 p-1 shadow-inner">
                <button
                  type="button"
                  class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-all hover:bg-surface-50 hover:text-white active:scale-95"
                  @click="selectedQty = Math.min(maxSelectableQty, selectedQty + 1)"
                >
                  <i class="fa-solid fa-plus text-[10px]"></i>
                </button>
                <span class="w-8 text-center text-sm font-black text-slate-100">{{ selectedQty }}</span>
                <button
                  type="button"
                  class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-all hover:bg-surface-50 hover:text-white active:scale-95"
                  @click="selectedQty = Math.max(1, selectedQty - 1)"
                >
                  <i class="fa-solid fa-minus text-[10px]"></i>
                </button>
              </div>
            </div>

            <!-- Color variants preview -->
            <div v-if="colors.length" class="mt-5 rounded-2xl border border-glass-border bg-surface-300/40 p-3">
              <div class="mb-2.5 flex items-center justify-between">
                <span class="text-xs font-bold text-slate-300">تنوع رنگ‌بندی:</span>
                <span class="text-[10px] text-slate-400 font-mono">{{ colors.length }} تنوع</span>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <span
                  v-for="c in colors"
                  :key="c.id"
                  class="flex items-center gap-1.5"
                >
                  <span
                    class="h-7 w-7 rounded-full border-2 border-glass-border shadow-md ring-2 ring-surface-300 transition-all hover:scale-110"
                    :style="{ backgroundColor: c.color_hex }"
                    :title="c.color_name"
                  ></span>
                </span>
              </div>
            </div>

            <!-- ================= BOX: قیمت + دکمه خرید در یک کادر یکپارچه ================= -->
            <div class="mt-6 rounded-2xl border border-glass-border bg-surface-300/80 p-4 shadow-inner">
              <!-- Price block inside box -->
              <div class="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <span class="text-xs text-slate-400 block mb-0.5">مبلغ قابل پرداخت:</span>
                  <span class="text-2xl font-black text-accent drop-shadow-[0_2px_8px_rgba(232,115,74,0.3)]">
                    {{ formatToman(finalPrice) }}
                    <span class="text-xs font-semibold text-slate-300">تومان</span>
                  </span>
                </div>
                
                <div class="text-left" v-if="!product.is_affiliate && product.discount_percentage > 0">
                  <span class="text-xs text-slate-500 line-through block">
                    {{ formatToman(product.sale_price) }}
                  </span>
                  <span class="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                    <i class="fa-solid fa-bolt animate-pulse"></i>
                    {{ product.discount_percentage }}٪ تخفیف
                  </span>
                </div>
              </div>

              <!-- Button inside box -->
              <a
                v-if="product.is_affiliate"
                :href="product.affiliate_link"
                target="_blank"
                rel="nofollow sponsored noopener"
                class="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 text-sm font-bold text-white shadow-lg shadow-sky-600/30 transition-all duration-300 hover:bg-sky-500 active:scale-[0.98]"
              >
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                خرید از {{ product.affiliate_source }}
              </a>
              <BaseButton
                v-else
                class="h-12 w-full text-sm font-black text-white rounded-xl bg-gradient-to-r from-brand-800 via-brand-700 to-brand-800 shadow-[0_0_20px_rgba(120,170,85,0.4)] transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
                :disabled="!colors.length && !inStock"
                @click="handlePrimaryAction"
              >
                <i class="fa-solid fa-bag-shopping ml-1.5"></i>
                ثبت سفارش محصول
              </BaseButton>
            </div>

            <p v-if="addToCartError" class="mt-3 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-950/30 p-2.5 text-xs font-semibold text-red-400">
              <i class="fa-solid fa-circle-exclamation text-sm"></i>
              {{ addToCartError }}
            </p>

            <!-- Trust badges -->
            <div
              v-if="!product.is_affiliate"
              class="mt-5 grid grid-cols-3 gap-2 border-t border-glass-border pt-4"
            >
              <div class="flex flex-col items-center gap-1 text-center group">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-700/50 bg-brand-900/30 text-brand-300 transition-transform duration-300 group-hover:scale-110">
                  <i class="fa-solid fa-truck-fast text-xs"></i>
                </div>
                <span class="text-[10px] font-medium text-slate-400">ارسال سریع</span>
              </div>
              <div class="flex flex-col items-center gap-1 text-center group">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-700/50 bg-brand-900/30 text-brand-300 transition-transform duration-300 group-hover:scale-110">
                  <i class="fa-solid fa-shield-halved text-xs"></i>
                </div>
                <span class="text-[10px] font-medium text-slate-400">پرداخت امن</span>
              </div>
              <div class="flex flex-col items-center gap-1 text-center group">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-700/50 bg-brand-900/30 text-brand-300 transition-transform duration-300 group-hover:scale-110">
                  <i class="fa-solid fa-rotate-left text-xs"></i>
                </div>
                <span class="text-[10px] font-medium text-slate-400">ضمانت بازگشت</span>
              </div>
            </div>
          </div>

          <!-- Quick specs cards under the buy-box -->
          <div
            v-if="product.brand || product.vendors || product.weight || product.dimensions"
            class="grid grid-cols-2 gap-2.5"
          >
            <div v-if="product.brand" class="flex items-center gap-2 rounded-xl border border-glass-border bg-surface-400/60 p-3 backdrop-blur-xl">
              <i class="fa-solid fa-copyright text-brand-400 text-xs"></i>
              <span class="text-[11px] text-slate-400">برند:</span>
              <span class="mr-auto truncate text-xs font-bold text-slate-200">{{ product.brand }}</span>
            </div>
            <div v-if="product.vendors" class="flex items-center gap-2 rounded-xl border border-glass-border bg-surface-400/60 p-3 backdrop-blur-xl">
              <i class="fa-solid fa-store text-brand-400 text-xs"></i>
              <span class="text-[11px] text-slate-400">فروشنده:</span>
              <span class="mr-auto truncate text-xs font-bold text-slate-200">{{ product.vendors.name }}</span>
            </div>
            <div v-if="product.weight" class="flex items-center gap-2 rounded-xl border border-glass-border bg-surface-400/60 p-3 backdrop-blur-xl">
              <i class="fa-solid fa-weight-hanging text-brand-400 text-xs"></i>
              <span class="text-[11px] text-slate-400">وزن:</span>
              <span class="mr-auto truncate text-xs font-bold text-slate-200">{{ product.weight }}</span>
            </div>
            <div v-if="product.dimensions" class="flex items-center gap-2 rounded-xl border border-glass-border bg-surface-400/60 p-3 backdrop-blur-xl">
              <i class="fa-solid fa-ruler-combined text-brand-400 text-xs"></i>
              <span class="text-[11px] text-slate-400">ابعاد:</span>
              <span class="mr-auto truncate text-xs font-bold text-slate-200">{{ product.dimensions }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ============ DESCRIPTION (Card Section) ============ -->
      <section v-if="product.description" class="mt-8">
        <div class="rounded-[1.75rem] border border-glass-border bg-surface-400/70 p-6 backdrop-blur-2xl shadow-glass-panel sm:p-8 relative overflow-hidden">
          <h2 class="mb-5 flex items-center gap-2.5 text-lg font-black text-slate-100 border-r-4 border-brand-700 pr-3">
            <i class="fa-solid fa-align-right text-brand-400"></i>
            معرفی و مشخصات محصول
          </h2>
          <p class="whitespace-pre-line text-sm sm:text-base leading-8 text-slate-300">
            {{ product.description }}
          </p>

          <!-- Tags -->
          <div v-if="product.tags?.length" class="mt-6 flex flex-wrap gap-2">
            <span
              v-for="tag in product.tags"
              :key="tag"
              class="inline-flex items-center rounded-xl border border-glass-border bg-surface-200/80 px-3 py-1 text-xs text-slate-300 transition-all duration-300 hover:border-brand-500/40 hover:bg-brand-900/30 hover:text-brand-300"
            >
              #{{ tag }}
            </span>
          </div>

          <!-- Like / Dislike -->
          <div class="mt-6 border-t border-glass-border pt-5">
            <ProductLikeButtons
              :product-id="product.id"
              :initial-likes="product.likes_count || 0"
              :initial-dislikes="product.dislikes_count || 0"
            />
          </div>
        </div>
      </section>

      <!-- ============ APARAT VIDEO (Card Section) ============ -->
      <div v-if="product.aparat_video_link" class="mt-6 rounded-[1.75rem] border border-glass-border bg-surface-400/70 p-6 backdrop-blur-2xl shadow-glass-panel">
        <h3 class="mb-4 flex items-center gap-2 text-base font-bold text-slate-100 border-r-4 border-brand-700 pr-3">
          <i class="fa-solid fa-video text-brand-400"></i>
          ویدیو نقد و بررسی
        </h3>
        <ProductAparatVideo :aparat-link="product.aparat_video_link" />
      </div>

      <!-- ============ COMMENTS (Card Section) ============ -->
      <div class="mt-6 rounded-[1.75rem] border border-glass-border bg-surface-400/70 p-6 backdrop-blur-2xl shadow-glass-panel">
        <h3 class="mb-4 flex items-center gap-2 text-base font-bold text-slate-100 border-r-4 border-brand-700 pr-3">
          <i class="fa-solid fa-comments text-brand-400"></i>
          نظرات و دیدگاه‌های کاربران
        </h3>
        <ProductComments :product-id="product.id" />
      </div>

      <!-- ============ RELATED PRODUCTS ============ -->
      <div class="mt-10">
        <RelatedProducts :exclude-id="product.id" />
      </div>

      <!-- Color + quantity picker sheet (opened by «ثبت سفارش» for color products) -->
      <ResponsiveSheet v-model="colorSheetOpen" title="تعیین تعداد و تنوع سفارش">
        <ColorQuantityPicker :colors="colors" @confirm="handleColorRowsConfirmed" />
      </ResponsiveSheet>

      <!-- ============================ Sticky Mobile Action Bar ============================ -->
      <div
        class="fixed inset-x-0 bottom-0 z-40 border-t border-glass-border bg-surface-500/90 backdrop-blur-2xl lg:hidden shadow-[0_-8px_25px_rgba(0,0,0,0.5)]"
        style="padding-bottom: env(safe-area-inset-bottom)"
      >
        <div class="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <!-- Price (hidden for affiliate) -->
          <div v-if="!product.is_affiliate" class="shrink-0">
            <p class="text-[10px] font-medium text-slate-400">قیمت نهایی</p>
            <p class="text-base font-black text-accent">{{ formatToman(finalPrice) }} <span class="text-[10px] font-normal text-slate-300">تومان</span></p>
          </div>

          <a
            v-if="product.is_affiliate"
            :href="product.affiliate_link"
            target="_blank"
            rel="nofollow sponsored noopener"
            class="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-xs font-bold text-white shadow-lg shadow-sky-600/30 active:scale-95"
          >
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
            خرید از {{ product.affiliate_source }}
          </a>
          <BaseButton
            v-else
            class="h-11 flex-1 text-xs font-black text-white rounded-xl bg-gradient-to-r from-brand-800 to-brand-700 shadow-[0_0_15px_rgba(120,170,85,0.4)] active:scale-95"
            :disabled="!colors.length && !inStock"
            @click="handlePrimaryAction"
          >
            <i class="fa-solid fa-bag-shopping ml-1"></i>
            ثبت سفارش
          </BaseButton>

          <button
            type="button"
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-glass-border bg-glass-white text-base active:scale-95"
            :class="isWishlisted ? 'text-red-500' : 'text-slate-400'"
            @click="wishlistStore.toggle(product.id)"
          >
            <i :class="isWishlisted ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- ============================ Not Found ============================ -->
    <div v-else class="flex flex-col items-center justify-center py-24 text-center">
      <div class="flex h-20 w-20 items-center justify-center rounded-3xl border border-glass-border bg-surface-300/50 text-3xl text-slate-500 shadow-glass-panel backdrop-blur-xl">
        <i class="fa-solid fa-box-open"></i>
      </div>
      <p class="mt-5 text-lg font-bold text-slate-200">محصول مورد نظر یافت نشد</p>
      <NuxtLink
        to="/"
        class="mt-4 inline-flex items-center gap-2 rounded-2xl border border-brand-700/60 bg-brand-800 px-5 py-2.5 text-xs font-bold text-slate-100 shadow-[0_0_15px_rgba(120,170,85,0.3)] transition-all duration-300 hover:bg-brand-700 hover:scale-105 active:scale-95"
      >
        <i class="fa-solid fa-house"></i>
        بازگشت به فروشگاه
      </NuxtLink>
    </div>
  </div>
</template>
