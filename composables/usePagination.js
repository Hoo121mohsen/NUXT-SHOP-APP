import { ref, computed, watch } from 'vue'

// کامپوزبل مشترک صفحه‌بندی (pagination)
// ورودی: computed/ref آرایه‌ای که باید صفحه‌بندی شود + تعداد آیتم در هر صفحه
export function usePagination(itemsRef, pageSize = 12) {
  const currentPage = ref(1)

  const totalPages = computed(() => Math.max(1, Math.ceil(itemsRef.value.length / pageSize)))

  const paginated = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return itemsRef.value.slice(start, start + pageSize)
  })

  // اگر با تغییر فیلتر/جستجو تعداد صفحات کم شد، به صفحه اول برگرد
  watch(itemsRef, () => {
    if (currentPage.value > totalPages.value) currentPage.value = 1
  })

  function goTo(page) {
    currentPage.value = Math.min(Math.max(1, page), totalPages.value)
  }
  function next() {
    goTo(currentPage.value + 1)
  }
  function prev() {
    goTo(currentPage.value - 1)
  }

  return { currentPage, totalPages, paginated, goTo, next, prev }
}
