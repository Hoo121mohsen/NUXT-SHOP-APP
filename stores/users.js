import { defineStore } from 'pinia'

// استور مدیریت کاربران - فقط برای پنل ادمین (لیست، جستجو بر اساس ایمیل، تغییر نقش)
export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    loading: false
  }),

  actions: {
    async fetchUsers() {
      const supabase = useSupabase()
      this.loading = true
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      this.users = data || []
      this.loading = false
    },

    async updateRole(userId, role) {
      const supabase = useSupabase()
      const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
      if (error) throw error
      const user = this.users.find((u) => u.id === userId)
      if (user) user.role = role
    }
  }
})
