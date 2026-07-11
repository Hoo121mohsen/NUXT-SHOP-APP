import { defineStore } from 'pinia'

// استور گردش کالا - گزارش کامل ورود/خروج موجودی
// می‌تواند بر اساس یک محصول خاص، یا بر اساس نام خریدار (برای دیدن گردش همه کالاهایی که یک مشتری خریده) فیلتر شود
export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    movements: [],
    loading: false
  }),

  actions: {
    // برچسب خوانا برای مرجع هر ردیف گردش کالا (شماره فاکتور خرید یا کد سفارش)
    async buildReferenceLabels(movements) {
      const supabase = useSupabase()

      const invoiceIds = [...new Set(
        movements.filter((m) => m.reference_type === 'purchase_invoice').map((m) => m.reference_id)
      )]
      const orderIds = [...new Set(
        movements.filter((m) => m.reference_type === 'order').map((m) => m.reference_id)
      )]

      let invoiceMap = {}
      if (invoiceIds.length) {
        const { data } = await supabase.from('purchase_invoices').select('id, invoice_number').in('id', invoiceIds)
        invoiceMap = Object.fromEntries((data || []).map((inv) => [inv.id, inv.invoice_number]))
      }

      let orderMap = {}
      if (orderIds.length) {
        const { data } = await supabase.from('orders').select('id, order_number, full_name').in('id', orderIds)
        orderMap = Object.fromEntries((data || []).map((o) => [o.id, o]))
      }

      return movements.map((m) => ({
        ...m,
        referenceLabel:
          m.reference_type === 'purchase_invoice'
            ? `فاکتور خرید #${invoiceMap[m.reference_id] || ''}`
            : m.reference_type === 'order'
              ? `سفارش ${orderMap[m.reference_id]?.order_number || ''} — ${orderMap[m.reference_id]?.full_name || ''}`
              : m.reference_type === 'product'
                ? 'موجودی اولیه تعریف محصول'
                : 'اصلاحیه دستی'
      }))
    },

    // گردش کامل یک محصول مشخص
    async fetchMovementsForProduct(productId) {
      const supabase = useSupabase()
      this.loading = true

      const { data } = await supabase
        .from('inventory_movements')
        .select('*, warehouses(id, name), product_colors(id, color_name, color_hex)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

      this.movements = await this.buildReferenceLabels(data || [])
      this.loading = false
    },

    // گردش کالاهایی که یک خریدار مشخص (بر اساس نام) خریده - در همه محصولات، یا محدود به یک محصول خاص
    async fetchMovementsForBuyer(buyerName, productId = null) {
      const supabase = useSupabase()
      this.loading = true

      const { data: orders } = await supabase
        .from('orders')
        .select('id, order_number, full_name')
        .ilike('full_name', `%${buyerName}%`)

      const orderIds = (orders || []).map((o) => o.id)
      if (!orderIds.length) {
        this.movements = []
        this.loading = false
        return
      }

      let query = supabase
        .from('inventory_movements')
        .select('*, warehouses(id, name), product_colors(id, color_name, color_hex), products(id, title, product_images(*))')
        .eq('reason', 'sale')
        .in('reference_id', orderIds)
        .order('created_at', { ascending: false })

      if (productId) query = query.eq('product_id', productId)

      const { data } = await query
      this.movements = await this.buildReferenceLabels(data || [])
      this.loading = false
    }
  }
})
