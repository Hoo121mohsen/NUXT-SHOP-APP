import { defineStore } from 'pinia'

// استور حسابداری - دفتر ساده بر پایه جدول accounting_entries
// سه نوع سند: asset_initial (دارایی اولیه) / liability_purchase (بدهی خرید) / revenue_sale (درآمد فروش)
export const useAccountingStore = defineStore('accounting', {
  state: () => ({
    entries: [],
    loading: false,
    totals: {
      assets: 0,
      liabilities: 0,
      revenue: 0
    }
  }),

  actions: {
    async fetchEntries(limit = 300) {
      const supabase = useSupabase()
      this.loading = true
      const { data } = await supabase
        .from('accounting_entries')
        .select('*, products(id, title, product_images(*)), vendors(id, name)')
        .order('created_at', { ascending: false })
        .limit(limit)
      this.entries = data || []
      this.loading = false
    },

    async fetchTotals() {
      const supabase = useSupabase()
      const { data } = await supabase.from('accounting_entries').select('entry_type, amount')

      const totals = { assets: 0, liabilities: 0, revenue: 0 }
      ;(data || []).forEach((row) => {
        if (row.entry_type === 'asset_initial') totals.assets += Number(row.amount)
        else if (row.entry_type === 'liability_purchase') totals.liabilities += Number(row.amount)
        else if (row.entry_type === 'revenue_sale') totals.revenue += Number(row.amount)
      })
      this.totals = totals
    },

    // ریز اقلام یک سند - برای نمایش داخل آکاردئون (فقط وقتی ردیف باز می‌شود صدا زده می‌شود)
    async fetchEntryDetails(entry) {
      const supabase = useSupabase()

      // سند بدهی خرید: به فاکتور خرید مرتبط با تمام ردیف‌های آن (چند محصول) وصل است
      if (entry.entry_type === 'liability_purchase' && entry.reference_type === 'purchase_invoice') {
        const { data } = await supabase
          .from('purchase_invoices')
          .select(`
            invoice_number,
            vendors(id, name),
            purchase_invoice_items(*, products(id, title, product_images(*)), product_colors(color_name, color_hex))
          `)
          .eq('id', entry.reference_id)
          .single()
        return { kind: 'purchase_invoice', invoice: data }
      }

      // سند درآمد فروش: به همان سفارش (برای شماره سفارش) وصل است - محصول/تعداد/قیمت روی خود سند موجود است
      if (entry.entry_type === 'revenue_sale' && entry.reference_type === 'order') {
        const { data } = await supabase
          .from('orders')
          .select('order_number, full_name, phone')
          .eq('id', entry.reference_id)
          .single()
        return { kind: 'revenue_sale', order: data }
      }

      // سند دارایی اولیه: همه اطلاعات لازم (تعداد/قیمت واحد/فروشنده) از قبل روی خود سند موجود است
      return { kind: 'asset_initial' }
    }
  }
})
