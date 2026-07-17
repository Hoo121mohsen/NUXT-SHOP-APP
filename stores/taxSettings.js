import { defineStore } from 'pinia'

// استور تنظیمات مالیاتی (نرخ ارزش افزوده + اطلاعات حقوقی فروشگاه برای درج در فاکتور رسمی)
export const useTaxSettingsStore = defineStore('taxSettings', {
  state: () => ({
    settings: {
      vat_rate: 9,
      company_name: '',
      economic_code: '',
      national_id: '',
      address: '',
      phone: ''
    },
    loaded: false
  }),

  actions: {
    async fetchSettings() {
      const supabase = useSupabase()
      const { data } = await supabase.from('tax_settings').select('*').eq('id', 1).single()
      if (data) this.settings = data
      this.loaded = true
      return this.settings
    },

    async updateSettings(payload) {
      const supabase = useSupabase()
      const { data, error } = await supabase
        .from('tax_settings')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', 1)
        .select()
        .single()
      if (error) throw error
      this.settings = data
      return data
    }
  }
})
