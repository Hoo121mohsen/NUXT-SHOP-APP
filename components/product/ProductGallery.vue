<template>
  <div>
    <!-- تصویر اصلی بزرگ - قابل اسکرول با انگشت (لمسی) + فلش چپ/راست در صفحات بزرگ‌تر -->
    <div
      class="group relative mb-3 aspect-square cursor-zoom-in overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-700"
      @click="openZoom(activeIndex)"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <img :src="images[activeIndex]" class="h-full w-full object-cover" />

      <template v-if="images.length > 1">
        <!-- این دکمه فیزیکاً سمت راست تصویر است و به تصویر قبلی می‌رود (چون در آرایه/نوار بندانگشتی RTL، اولین عکس سمت راست قرار دارد) -->
        <button
          class="gallery-arrow absolute right-3 top-1/2 -translate-y-1/2 opacity-0 transition group-hover:opacity-100 sm:opacity-100"
          @click.stop="prev"
        >
          <svg viewBox="0 0 24 24" class="h-6 w-6"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
        <!-- این دکمه فیزیکاً سمت چپ تصویر است و به تصویر بعدی می‌رود -->
        <button
          class="gallery-arrow absolute left-3 top-1/2 -translate-y-1/2 opacity-0 transition group-hover:opacity-100 sm:opacity-100"
          @click.stop="next"
        >
          <svg viewBox="0 0 24 24" class="h-6 w-6"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
      </template>
    </div>

    <!-- ردیف افقی اسکرول‌شونده از عکس‌های محصول -->
    <div class="scrollbar-thin flex gap-2 overflow-x-auto">
      <button
        v-for="(img, idx) in images"
        :key="idx"
        @click="activeIndex = idx"
        class="h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2"
        :class="activeIndex === idx ? 'border-brand-600' : 'border-transparent'"
      >
        <img :src="img" class="h-full w-full object-cover" />
      </button>
    </div>

    <!-- مودال بزرگنمایی عکس - همان قابلیت اسکرول لمسی + فلش -->
    <Teleport to="body">
      <div
        v-if="zoomOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        @click="zoomOpen = false"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
      >
        <img
          :src="images[activeIndex]"
          class="max-h-[90vh] max-w-[90vw] scale-100 rounded-lg object-contain transition-transform duration-300"
          @click.stop
        />

        <template v-if="images.length > 1">
          <button class="gallery-arrow gallery-arrow-lg absolute right-4 top-1/2 -translate-y-1/2" @click.stop="prev">
            <svg viewBox="0 0 24 24" class="h-7 w-7"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </button>
          <button class="gallery-arrow gallery-arrow-lg absolute left-4 top-1/2 -translate-y-1/2" @click.stop="next">
            <svg viewBox="0 0 24 24" class="h-7 w-7"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </button>
        </template>

        <button class="absolute left-4 top-4 text-2xl text-white" @click.stop="zoomOpen = false">✕</button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  images: { type: Array, default: () => [] }
})

const activeIndex = ref(0)
const zoomOpen = ref(false)

function openZoom(idx) {
  activeIndex.value = idx
  zoomOpen.value = true
}

function next() {
  activeIndex.value = (activeIndex.value + 1) % props.images.length
}
function prev() {
  activeIndex.value = (activeIndex.value - 1 + props.images.length) % props.images.length
}

// پشتیبانی از اسکرول با انگشت (Swipe) روی صفحات لمسی
const touchStartX = ref(0)
function onTouchStart(e) {
  touchStartX.value = e.changedTouches[0].clientX
}
function onTouchEnd(e) {
  const deltaX = e.changedTouches[0].clientX - touchStartX.value
  const threshold = 40
  if (deltaX > threshold) prev()
  else if (deltaX < -threshold) next()
}
</script>

<style scoped>
/* دکمه‌های فلش گالری: بزرگ‌تر، افکت شیشه‌ای با سایه - از SVG استفاده می‌شود تا در صفحات RTL جهت آیکون معکوس نشود */
.gallery-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 9999px;
  color: #000;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(10px) saturate(160%);
  -webkit-backdrop-filter: blur(10px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}
.gallery-arrow:hover {
  background: rgba(255, 255, 255, 0.75);
}
.gallery-arrow-lg {
  width: 3.25rem;
  height: 3.25rem;
}
</style>
