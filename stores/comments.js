import { defineStore } from 'pinia'

// استور کامنت‌های محصول
// کامنت واقعی کاربر: نیاز به تایید ادمین/مدیر فروش قبل از نمایش عمومی دارد
// کامنت ساختگی: توسط ادمین/مدیر فروش با نام و آواتار دلخواه ساخته می‌شود و در نمایش اولویت دارد (is_featured)
export const useCommentsStore = defineStore('comments', {
  state: () => ({
    comments: [],       // کامنت‌های تایید‌شده یک محصول (برای نمایش عمومی)
    allComments: [],     // همه کامنت‌ها (برای پنل مدیریت)
    loading: false
  }),

  actions: {
    // فقط کامنت‌های تاییدشده یک محصول - کامنت‌های ویژه (ساختگی/ادمین) ابتدا نمایش داده می‌شوند
    async fetchApprovedForProduct(productId) {
      const supabase = useSupabase()
      this.loading = true
      const { data } = await supabase
        .from('product_comments')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
      this.comments = data || []
      this.loading = false
    },

    // ثبت کامنت جدید توسط کاربر لاگین‌کرده - نیاز به تایید دارد
    async submitComment({ productId, userId, authorName, content }) {
      const supabase = useSupabase()
      const { error } = await supabase.from('product_comments').insert([{
        product_id: productId,
        user_id: userId,
        author_name: authorName,
        content,
        is_approved: false,
        is_featured: false
      }])
      if (error) throw error
    },

    // ساخت کامنت ساختگی توسط ادمین/مدیر فروش - خودکار تایید و ویژه (اولویت‌دار) است
    async createFakeComment({ productId, authorName, authorAvatar, content }) {
      const supabase = useSupabase()
      const { data, error } = await supabase
        .from('product_comments')
        .insert([{
          product_id: productId,
          user_id: null,
          author_name: authorName,
          author_avatar: authorAvatar,
          content,
          is_approved: true,
          is_featured: true
        }])
        .select()
        .single()
      if (error) throw error
      return data
    },

    // همه کامنت‌ها برای پنل مدیریت (تایید‌شده و در انتظار)
    async fetchAll() {
      const supabase = useSupabase()
      this.loading = true
      const { data } = await supabase
        .from('product_comments')
        .select('*, products(id, title, product_images(*))')
        .order('created_at', { ascending: false })
      this.allComments = data || []
      this.loading = false
    },

    async approveComment(id) {
      const supabase = useSupabase()
      await supabase.from('product_comments').update({ is_approved: true }).eq('id', id)
      const item = this.allComments.find((c) => c.id === id)
      if (item) item.is_approved = true
    },

    async deleteComment(id) {
      const supabase = useSupabase()
      await supabase.from('product_comments').delete().eq('id', id)
      this.allComments = this.allComments.filter((c) => c.id !== id)
    },

    // کامنت‌های خود کاربر (برای صفحه پروفایل)
    async fetchForUser(userId) {
      const supabase = useSupabase()
      const { data } = await supabase
        .from('product_comments')
        .select('*, products(id, title, product_images(*))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      return data || []
    }
  }
})
