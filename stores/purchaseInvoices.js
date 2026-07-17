import { defineStore } from 'pinia'
import { useJournalStore } from './journal'

// استور فاکتورهای خرید (purchase_invoices)
// ثبت هر فاکتور خرید باعث می‌شود:
//   ۱) موجودی همان تنوع رنگ خریداری‌شده (product_colors.quantity) و موجودی کل محصول افزایش یابد
//   ۲) یک رکورد گردش کالا (inventory_movements) با دلیل «purchase» و color_id مربوطه ثبت شود
//   ۳) سند حسابداری دوبل واقعی: بدهکار موجودی کالا + مالیات خرید / بستانکار حساب پرداختنی فروشنده
//   ۴) در صورت درخواست ادمین، قیمت فروش محصول به‌روزرسانی شود
export const usePurchaseInvoicesStore = defineStore('purchaseInvoices', {
  state: () => ({
    invoices: [],
    loading: false
  }),

  actions: {
    async fetchInvoices() {
      const supabase = useSupabase()
      this.loading = true
      const { data } = await supabase
        .from('purchase_invoices')
        .select('*, vendors(id, name), warehouses(id, name)')
        .order('created_at', { ascending: false })
      this.loading = false
      this.invoices = data || []
    },

    async fetchInvoiceById(id) {
      const supabase = useSupabase()
      const { data } = await supabase
        .from('purchase_invoices')
        .select(`
          *,
          vendors(id, name, phone, address),
          warehouses(id, name),
          purchase_invoice_items(*,
            products(id, title, product_images(*)),
            product_colors(id, color_name, color_hex)
          )
        `)
        .eq('id', id)
        .single()
      return data
    },

    // ثبت فاکتور خرید کامل: هدر فاکتور + ردیف‌ها (هر ردیف می‌تواند شامل تنوع رنگ مشخص باشد)
    // items: [{ product_id, color_id (اختیاری), quantity, unit_price, new_sale_price (اختیاری) }]
    // unit_price ها مبلغ خالص (قبل از مالیات) هستند؛ vatRate روی جمع کل اعمال می‌شود
    async createPurchaseInvoice({ invoice_number, vendor_id, warehouse_id, notes, items, vatRate = 0 }) {
      const supabase = useSupabase()
      const journalStore = useJournalStore()

      const subtotal = items.reduce((sum, i) => sum + Number(i.quantity) * Number(i.unit_price), 0)
      const vatAmount = Math.round((subtotal * Number(vatRate)) / 100)
      const totalAmount = subtotal + vatAmount

      const { data: invoice, error } = await supabase
        .from('purchase_invoices')
        .insert([{
          invoice_number,
          vendor_id: vendor_id || null,
          warehouse_id: warehouse_id || null,
          notes,
          subtotal,
          vat_rate: vatRate,
          vat_amount: vatAmount,
          total_amount: totalAmount
        }])
        .select()
        .single()
      if (error) throw error

      // درج ردیف‌های فاکتور (همراه با شناسه تنوع رنگ در صورت انتخاب)
      const itemRows = items.map((i) => ({
        purchase_invoice_id: invoice.id,
        product_id: i.product_id,
        color_id: i.color_id || null,
        quantity: Number(i.quantity),
        unit_price: Number(i.unit_price),
        line_total: Number(i.quantity) * Number(i.unit_price)
      }))
      const { error: itemsError } = await supabase.from('purchase_invoice_items').insert(itemRows)
      if (itemsError) throw itemsError

      // برای هر ردیف: افزایش موجودی همان تنوع رنگ + موجودی کل محصول + ثبت گردش کالا + به‌روزرسانی قیمت فروش (اختیاری)
      for (const item of items) {
        const { data: product } = await supabase
          .from('products')
          .select('stock_quantity, title')
          .eq('id', item.product_id)
          .single()

        const wasOutOfStock = Number(product?.stock_quantity || 0) <= 0
        const newQty = Number(product?.stock_quantity || 0) + Number(item.quantity)
        const productUpdate = { stock_quantity: newQty }
        if (item.new_sale_price !== undefined && item.new_sale_price !== null && item.new_sale_price !== '') {
          productUpdate.sale_price = Number(item.new_sale_price)
        }
        await supabase.from('products').update(productUpdate).eq('id', item.product_id)

        // اگر این محصول قبلاً ناموجود بود و حالا موجودی گرفت، به مشترکین «اطلاع بده موجود شد» پیام بده
        if (wasOutOfStock && newQty > 0) {
          const { useNotificationsStore } = await import('./notifications')
          const notificationsStore = useNotificationsStore()
          await notificationsStore.notifyBackInStock(item.product_id, product?.title || '')
        }

        // موجودی همان تنوع رنگ (هویت با نام رنگ - هگز صرفا نمایشی) افزایش می‌یابد
        if (item.color_id) {
          const { data: colorRow } = await supabase
            .from('product_colors')
            .select('quantity')
            .eq('id', item.color_id)
            .single()
          const newColorQty = Number(colorRow?.quantity || 0) + Number(item.quantity)
          await supabase.from('product_colors').update({ quantity: newColorQty }).eq('id', item.color_id)
        }

        await supabase.from('inventory_movements').insert([{
          product_id: item.product_id,
          color_id: item.color_id || null,
          warehouse_id: warehouse_id || null,
          change_qty: Number(item.quantity),
          reason: 'purchase',
          reference_type: 'purchase_invoice',
          reference_id: invoice.id
        }])
      }

      // سند ساده (برای صفحه خلاصه حسابداری قدیمی)
      await supabase.from('accounting_entries').insert([{
        entry_type: 'liability_purchase',
        amount: totalAmount,
        description: `بدهی بابت فاکتور خرید شماره ${invoice_number}`,
        vendor_id: vendor_id || null,
        reference_type: 'purchase_invoice',
        reference_id: invoice.id
      }])

      // سند حسابداری دوبل واقعی: بدهکار موجودی کالا + مالیات خرید / بستانکار حساب پرداختنی فروشنده
      const lines = [{ account_code: '1040', debit: subtotal, credit: 0, description: 'خرید کالا' }]
      if (vatAmount > 0) {
        lines.push({ account_code: '1050', debit: vatAmount, credit: 0, description: 'مالیات بر ارزش افزوده خرید' })
      }
      lines.push({ account_code: '2010', debit: 0, credit: totalAmount, description: 'بدهی به فروشنده' })

      await journalStore.postEntry({
        description: `فاکتور خرید شماره ${invoice_number}`,
        source_type: 'purchase',
        source_id: invoice.id,
        lines
      })

      return invoice
    }
  }
})
