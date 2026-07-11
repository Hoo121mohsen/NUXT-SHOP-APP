import { defineStore } from 'pinia'

// استور آمار بازدید - جدول page_views
// ثبت بازدید برای همه (حتی مهمان) مجاز است، اما خواندن گزارش فقط برای ادمین (کاربر لاگین‌کرده)
export const useAnalyticsStore = defineStore('analytics', {
  state: () => ({
    overallVisits: 0,
    topProducts: [],
    loading: false
  }),

  actions: {
    // ثبت یک بازدید - در صورت بروز خطا بی‌صدا نادیده گرفته می‌شود (نباید تجربه کاربر را مختل کند)
    async logPageView(path, productId = null) {
      try {
        const supabase = useSupabase()
        await supabase.from('page_views').insert([{ path, product_id: productId }])
      } catch (e) {
        // نادیده گرفته می‌شود
      }
    },

    // تعداد کل بازدیدهای سایت (فقط برای ادمین قابل خواندن است - طبق RLS)
    async fetchOverallVisits() {
      const supabase = useSupabase()
      const { count } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
      this.overallVisits = count || 0
    },

    // تعداد بازدید امروز یک محصول خاص
    async fetchTodayProductViews(productId) {
      const supabase = useSupabase()
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const { count } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId)
        .gte('created_at', startOfDay.toISOString())

      return count || 0
    },

    // پرمخاطب‌ترین محصولات بر اساس تعداد بازدید (برای نمای کلی داشبورد)
    async fetchTopProducts(limit = 5) {
      const supabase = useSupabase()
      this.loading = true

      const { data: views } = await supabase
        .from('page_views')
        .select('product_id')
        .not('product_id', 'is', null)

      const counts = {}
      ;(views || []).forEach((row) => {
        counts[row.product_id] = (counts[row.product_id] || 0) + 1
      })

      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit)

      if (!sorted.length) {
        this.topProducts = []
        this.loading = false
        return
      }

      const ids = sorted.map(([id]) => id)
      const { data: products } = await supabase
        .from('products')
        .select('id, title, product_images(*)')
        .in('id', ids)

      this.topProducts = sorted
        .map(([id, count]) => ({
          ...products?.find((p) => p.id === id),
          viewCount: count
        }))
        .filter((p) => p.id)

      this.loading = false
    }
  }
})
