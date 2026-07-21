import { defineStore } from 'pinia'

// استور احراز هویت کاربر (ورود، ثبت‌نام، خروج) + پروفایل/نقش (RBAC)
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null, // { id, email, role }
    loading: false,
    error: null
  }),

  getters: {
    role: (state) => state.profile?.role || 'customer',
    isAdmin: (state) => state.profile?.role === 'admin',
    isSalesManager: (state) => state.profile?.role === 'sales_manager',
    isSupplier: (state) => state.profile?.role === 'supplier'
  },

  actions: {
    async fetchUser() {
      const supabase = useSupabase()
      const { data } = await supabase.auth.getSession()
      this.user = data.session?.user || null
      if (this.user) {
        await this.fetchProfile()
      } else {
        this.profile = null
      }
      return this.user
    },

    // خواندن پروفایل/نقش کاربر جاری از جدول profiles
    async fetchProfile() {
      if (!this.user) return null
      const supabase = useSupabase()
      const { data } = await supabase.from('profiles').select('*').eq('id', this.user.id).single()
      this.profile = data || null
      return this.profile
    },

    async login(email, password) {
      const supabase = useSupabase()
      this.loading = true
      this.error = null
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      this.loading = false
      if (error) {
        this.error = error.message
        return false
      }
      this.user = data.user
      await this.fetchProfile()
      return true
    },

    async register(email, password) {
      const supabase = useSupabase()
      this.loading = true
      this.error = null
      const { data, error } = await supabase.auth.signUp({ email, password })
      this.loading = false
      if (error) {
        this.error = error.message
        return false
      }
      this.user = data.user
      await this.fetchProfile()
      return true
    },

    async logout() {
      const supabase = useSupabase()
      await supabase.auth.signOut()
      this.user = null
      this.profile = null
    },

    // ورود/ثبت‌نام سریع با گوگل یا اپل - نیازمند فعال‌سازی این Provider ها در پنل Supabase (Authentication -> Providers)
    async signInWithOAuth(provider) {
      const supabase = useSupabase()
      const { error } = await supabase.auth.signInWithOAuth({
        provider, // 'google' | 'apple'
        options: { redirectTo: window.location.origin }
      })
      if (error) this.error = error.message
    },

    // به‌روزرسانی نام نمایشی/آواتار پروفایل کاربر جاری
    async updateProfile({ display_name, avatar_url }) {
      if (!this.user) return
      const supabase = useSupabase()
      const { data, error } = await supabase
        .from('profiles')
        .update({ display_name, avatar_url })
        .eq('id', this.user.id)
        .select()
        .single()
      if (error) throw error
      this.profile = data
      return data
    },

    // آپلود عکس آواتار در باکت user-media
    async uploadAvatar(file) {
      const supabase = useSupabase()
      const ext = file.name.split('.').pop()
      const path = `avatars/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('user-media').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('user-media').getPublicUrl(path)
      return data.publicUrl
    }
  }
})
