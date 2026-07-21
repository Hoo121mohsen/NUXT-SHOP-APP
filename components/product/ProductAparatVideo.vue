<template>
  <!--
    نمایش ویدیوی معرفی محصول از آپارات - فقط وقتی لینک وجود داشته باشد رندر می‌شود
    این کامپوننت باید بالاتر از بخش کامنت‌ها در صفحه جزئیات محصول قرار بگیرد
  -->
  <div v-if="embedUrl" class="mt-8">
    <h3 class="mb-3 text-lg font-bold text-stone-800 dark:text-stone-100">🎬 ویدیوی معرفی محصول</h3>
    <div class="aspect-video w-full overflow-hidden rounded-xl border border-stone-200 dark:border-stone-700">
      <iframe
        :src="embedUrl"
        class="h-full w-full"
        allowfullscreen
        loading="lazy"
      ></iframe>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  aparatLink: { type: String, default: '' }
})

// تبدیل لینک صفحه ویدیوی آپارات (مثلا aparat.com/v/xxxxx) به لینک embed (aparat.com/video/video/embed/videohash/xxxxx)
// اگر کاربر خودش لینک embed را وارد کرده باشد، همان استفاده می‌شود
const embedUrl = computed(() => {
  const link = (props.aparatLink || '').trim()
  if (!link) return ''

  if (link.includes('/embed')) return link

  const match = link.match(/aparat\.com\/v\/([a-zA-Z0-9]+)/)
  if (match && match[1]) {
    return `https://www.aparat.com/video/video/embed/videohash/${match[1]}/vt/frame`
  }

  // اگر با فرمت دیگری وارد شده، همان لینک اصلی را برمی‌گردانیم (fallback)
  return link
})
</script>
