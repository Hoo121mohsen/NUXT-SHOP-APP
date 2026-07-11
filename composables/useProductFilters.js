import { ref, computed } from 'vue'

// کامپوزبل مشترک برای فیلتر لیست محصولات در صفحات داشبورد
// (مدیریت محصولات و مدیریت تخفیف‌ها)
// ورودی: یک computed/ref که آرایه محصولات را برمی‌گرداند
export function useProductFilters(productsRef) {
  const search = ref('')
  const stockFilter = ref('all') // all | out | low | high
  const lowStockThreshold = ref(5)
  const highStockThreshold = ref(20)
  const vendorId = ref('all')
  const warehouseId = ref('all')
  const publishedFilter = ref('all') // all | published | unpublished

  const filtered = computed(() => {
    const term = search.value.trim().toLowerCase()

    return productsRef.value.filter((p) => {
      const matchesSearch =
        !term ||
        p.title?.toLowerCase().includes(term) ||
        p.id?.toLowerCase().includes(term)

      let matchesStock = true
      const qty = Number(p.stock_quantity || 0)
      if (stockFilter.value === 'out') {
        matchesStock = qty === 0
      } else if (stockFilter.value === 'low') {
        matchesStock = qty > 0 && qty < Number(lowStockThreshold.value || 0)
      } else if (stockFilter.value === 'high') {
        matchesStock = qty > Number(highStockThreshold.value || 0)
      }

      const matchesVendor = vendorId.value === 'all' || p.vendor_id === vendorId.value
      const matchesWarehouse = warehouseId.value === 'all' || p.warehouse_id === warehouseId.value

      let matchesPublished = true
      if (publishedFilter.value === 'published') matchesPublished = !!p.is_published
      else if (publishedFilter.value === 'unpublished') matchesPublished = !p.is_published

      return matchesSearch && matchesStock && matchesVendor && matchesWarehouse && matchesPublished
    })
  })

  return {
    search,
    stockFilter,
    lowStockThreshold,
    highStockThreshold,
    vendorId,
    warehouseId,
    publishedFilter,
    filtered
  }
}
