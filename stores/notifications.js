import { defineStore } from 'pinia'

// استور اعلان‌های کاربر (زنگوله بالای سایت + صفحه پروفایل)
export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    items: [],
    loading: false
  }),

  getters: {
    unreadCount: (state) => state.items.filter((n) => !n.is_read).length
  },

  actions: {
    async fetchForUser(userId) {
      const supabase = useSupabase()
      this.loading = true
      const { data } = await supabase
        .from('notifications')
        .select('*, products(id, title, product_images(*))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)
      this.items = data || []
      this.loading = false
    },

    async markAsRead(id) {
      const supabase = useSupabase()
      await supabase.from('notifications').update({ is_read: true }).eq('id', id)
      const item = this.items.find((n) => n.id === id)
      if (item) item.is_read = true
    },

    async markAllAsRead(userId) {
      const supabase = useSupabase()
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
      this.items.forEach((n) => (n.is_read = true))
    },

    // درخواست «اطلاع بده موجود شد» برای یک محصول (زنگوله در صفحه محصول)
    async requestStockNotification(userId, productId) {
      const supabase = useSupabase()
      const { error } = await supabase
        .from('stock_notify_requests')
        .insert([{ user_id: userId, product_id: productId }])
      // اگر قبلاً درخواست داده (خطای unique)، مشکلی نیست
      if (error && !error.message.includes('duplicate')) throw error
    },

    async hasRequestedStockNotification(userId, productId) {
      const supabase = useSupabase()
      const { data } = await supabase
        .from('stock_notify_requests')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle()
      return !!data
    },

    // وقتی موجودی محصولی افزایش می‌یابد (مثلا با فاکتور خرید)، به همه مشترکینِ هنوز اطلاع‌نیافته پیام می‌دهیم
    async notifyBackInStock(productId, productTitle) {
      const supabase = useSupabase()
      const { data: requests } = await supabase
        .from('stock_notify_requests')
        .select('id, user_id')
        .eq('product_id', productId)
        .eq('notified', false)

      if (!requests?.length) return

      const notifRows = requests.map((r) => ({
        user_id: r.user_id,
        type: 'back_in_stock',
        title: 'محصول مجدداً موجود شد',
        body: `محصول «${productTitle}» که منتظرش بودید، دوباره در سایت موجود است.`,
        product_id: productId
      }))
      await supabase.from('notifications').insert(notifRows)
      await supabase.from('stock_notify_requests').update({ notified: true }).eq('product_id', productId).eq('notified', false)
    }
  }
})
