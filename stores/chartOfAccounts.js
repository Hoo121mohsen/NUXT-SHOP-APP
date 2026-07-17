import { defineStore } from 'pinia'

// استور دفتر حساب‌ها (Chart of Accounts) - کدینگ پایه حسابداری
export const useChartOfAccountsStore = defineStore('chartOfAccounts', {
  state: () => ({
    accounts: [],
    loading: false
  }),

  getters: {
    // دسترسی سریع به یک حساب با کد آن، مثلا byCode('1040') -> موجودی کالا
    byCode: (state) => (code) => state.accounts.find((a) => a.code === code)
  },

  actions: {
    async fetchAccounts() {
      const supabase = useSupabase()
      this.loading = true
      const { data } = await supabase.from('chart_of_accounts').select('*').order('code', { ascending: true })
      this.accounts = data || []
      this.loading = false
    },

    async createAccount({ code, name, type }) {
      const supabase = useSupabase()
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .insert([{ code, name, type, is_system: false }])
        .select()
        .single()
      if (error) throw error
      this.accounts.push(data)
      return data
    }
  }
})
