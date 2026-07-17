import { defineStore } from 'pinia'

// استور دسته‌بندی محصولات - شامل آپلود عکس دسته و ذخیره در دیتابیس
export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [],
    loading: false,
    error: null
  }),
  actions: {
    async fetchCategories() {
      const supabase = useSupabase()
      this.loading = true
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false })
      this.loading = false
      if (error) {
        this.error = error.message
        return
      }
      this.categories = data
    },

    // آپلود عکس دسته‌بندی در باکت category-media
    async uploadCategoryImage(file) {
      const supabase = useSupabase()
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('category-media').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('category-media').getPublicUrl(path)
      return data.publicUrl
    },

    // ثبت دسته‌بندی جدید و بلافاصله افزودن به لیست محلی برای نمایش فوری
    async createCategory({ title, image_url, glow_color, default_tags }) {
      const supabase = useSupabase()
      const { data, error } = await supabase
        .from('categories')
        .insert([{ title, image_url, glow_color: glow_color || null, default_tags: default_tags || [] }])
        .select()
        .single()
      if (error) throw error
      this.categories.unshift(data)
      return data
    },

    // ویرایش دسته‌بندی موجود (عکس/رنگ حلقه/عنوان/تگ‌های پیش‌فرض) - بدون حذف رکورد؛ محصولات زیرمجموعه دست‌نخورده باقی می‌مانند
    async updateCategory(id, { title, image_url, glow_color, default_tags }) {
      const supabase = useSupabase()
      const { data, error } = await supabase
        .from('categories')
        .update({ title, image_url, glow_color: glow_color || null, default_tags: default_tags || [] })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      const idx = this.categories.findIndex((c) => c.id === id)
      if (idx !== -1) this.categories[idx] = data
      return data
    },

    async deleteCategory(id) {
      const supabase = useSupabase()
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
      this.categories = this.categories.filter((c) => c.id !== id)
    }
  }
})
