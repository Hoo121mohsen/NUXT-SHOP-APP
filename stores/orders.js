import { defineStore } from 'pinia'

// وضعیت‌های مجاز سفارش (سطح مشتری) به ترتیب منطقی گردش کار (بعد از تایید دریافت وجه)
export const ORDER_STATUSES = [
  { value: 'pending', label: 'در انتظار تایید پرداخت', color: 'bg-stone-100 text-stone-600' },
  { value: 'confirmed', label: 'تایید سفارش', color: 'bg-brand-50 text-brand-700' },
  { value: 'ready_to_ship', label: 'آماده ارسال', color: 'bg-sky-50 text-sky-700' },
  { value: 'handed_to_carrier', label: 'تحویل به پست / باربری', color: 'bg-indigo-50 text-indigo-700' },
  { value: 'delivered', label: 'تحویل داده شد', color: 'bg-emerald-50 text-emerald-700' },
  { value: 'reviewing', label: 'بررسی مجدد', color: 'bg-amber-50 text-amber-700' },
  { value: 'returned', label: 'مرجوع شد', color: 'bg-red-50 text-red-600' }
]

// وضعیت مجزای هر سفارش به تفکیک فروشنده/تامین‌کننده (order_vendor_statuses)
export const VENDOR_STATUSES = [
  { value: 'pending', label: 'در انتظار آماده‌سازی', color: 'bg-stone-100 text-stone-600' },
  { value: 'ready_to_ship', label: 'آماده ارسال', color: 'bg-emerald-50 text-emerald-700' }
]

export function orderStatusLabel(value) {
  return ORDER_STATUSES.find((s) => s.value === value)?.label || value
}
export function orderStatusColor(value) {
  return ORDER_STATUSES.find((s) => s.value === value)?.color || 'bg-stone-100 text-stone-600'
}
export function vendorStatusLabel(value) {
  return VENDOR_STATUSES.find((s) => s.value === value)?.label || value
}
export function vendorStatusColor(value) {
  return VENDOR_STATUSES.find((s) => s.value === value)?.color || 'bg-stone-100 text-stone-600'
}

// استور سفارش‌ها
export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: [],
    loading: false
  }),

  actions: {
    // کد یکتای خوانا برای پیگیری سفارش توسط مشتری، مثلا ORD-4F82K9
    generateOrderNumber() {
      const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
      return `ORD-${rand}`
    },

    async fetchOrders() {
      const supabase = useSupabase()
      this.loading = true
      const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      this.orders = data || []
      this.loading = false
    },

    // سفارش‌ها همراه با ردیف‌های نرمال‌شده (به تفکیک فروشنده) و وضعیت هر فروشنده - برای نمای آکاردئونی ادمین/مدیر فروش
    async fetchOrdersWithItems() {
      const supabase = useSupabase()
      this.loading = true
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, vendors(id, name)), order_vendor_statuses(*, vendors(id, name))')
        .order('created_at', { ascending: false })
      this.orders = data || []
      this.loading = false
    },

    // سفارش‌هایی که حداقل یک ردیف مربوط به فروشنده(های) این تامین‌کننده دارند
    async fetchOrdersForSupplier(vendorIds) {
      if (!vendorIds?.length) return []
      const supabase = useSupabase()
      const { data: relevantItems } = await supabase
        .from('order_items')
        .select('order_id')
        .in('vendor_id', vendorIds)

      const orderIds = [...new Set((relevantItems || []).map((i) => i.order_id))]
      if (!orderIds.length) return []

      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, vendors(id, name)), order_vendor_statuses(*, vendors(id, name))')
        .in('id', orderIds)
        .order('created_at', { ascending: false })
      return data || []
    },

    async fetchUserOrders(userId) {
      const supabase = useSupabase()
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      return data || []
    },

    // پیگیری عمومی سفارش با کد یکتا + شماره تماس (برای اطمینان بیشتر از هویت پیگیری‌کننده)
    async trackOrder(orderNumber, phone) {
      const supabase = useSupabase()
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber.trim().toUpperCase())
        .eq('phone', phone.trim())
        .single()
      return data || null
    },

    async updateStatus(id, status) {
      const supabase = useSupabase()
      await supabase.from('orders').update({ status }).eq('id', id)
    },

    // درج ردیف‌های نرمال‌شده سفارش (با رنگ و فروشنده) بلافاصله بعد از ثبت سفارش در checkout
    // cartItems: [{ id (product_id), color_id, color_name, title, price, quantity }]
    async createOrderItems(orderId, cartItems) {
      const supabase = useSupabase()

      // خواندن vendor_id هر محصول برای تفکیک فروشنده
      const productIds = [...new Set(cartItems.map((i) => i.id))]
      const { data: products } = await supabase.from('products').select('id, vendor_id').in('id', productIds)
      const vendorMap = Object.fromEntries((products || []).map((p) => [p.id, p.vendor_id]))

      const rows = cartItems.map((item) => ({
        order_id: orderId,
        product_id: item.id,
        color_id: item.color_id || null,
        vendor_id: vendorMap[item.id] || null,
        title: item.title,
        color_name: item.color_name || null,
        quantity: item.quantity,
        unit_price: item.price,
        line_total: item.price * item.quantity
      }))

      const { error } = await supabase.from('order_items').insert(rows)
      if (error) throw error

      // ایجاد یک ردیف وضعیت مستقل به‌ازای هر فروشنده متمایز درگیر در این سفارش
      const vendorIds = [...new Set(rows.map((r) => r.vendor_id).filter(Boolean))]
      if (vendorIds.length) {
        const statusRows = vendorIds.map((vendor_id) => ({ order_id: orderId, vendor_id, status: 'pending' }))
        await supabase.from('order_vendor_statuses').insert(statusRows)
      }
    },

    // تغییر وضعیت سفارش به تفکیک یک فروشنده خاص (توسط تامین‌کننده یا ادمین)
    async updateVendorStatus(orderId, vendorId, status) {
      const supabase = useSupabase()
      const { error } = await supabase
        .from('order_vendor_statuses')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('order_id', orderId)
        .eq('vendor_id', vendorId)
      if (error) throw error
    },

    // اشتراک لحظه‌ای (Realtime) برای بازتاب فوری تغییر وضعیت فروشنده در پنل ادمین/مدیر فروش
    subscribeToVendorStatusChanges(onChange) {
      const supabase = useSupabase()
      const channel = supabase
        .channel('order_vendor_statuses_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'order_vendor_statuses' }, onChange)
        .subscribe()
      return () => supabase.removeChannel(channel)
    }
  }
})
