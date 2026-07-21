import { defineStore } from 'pinia'

// استور تنظیمات سایت (فعلاً شامل تنظیمات پنل پیامک - قابل توسعه برای تنظیمات آینده)
export const useSiteSettingsStore = defineStore('siteSettings', {
  state: () => ({
    smsEnabled: false,       // فقط برای صفحات عمومی ورود/ثبت‌نام (بدون افشای کلید API)
    smsSettings: {
      is_enabled: false,
      provider: 'kavenegar',
      api_key: '',
      sender_line: '',
      api_endpoint: ''
    },
    loaded: false
  }),

  actions: {
    // برای صفحات عمومی (ورود/ثبت‌نام) - فقط وضعیت فعال/غیرفعال را از ویوی عمومی می‌خواند
    async fetchPublicSmsStatus() {
      const supabase = useSupabase()
      const { data } = await supabase.from('sms_settings_public').select('is_enabled').single()
      this.smsEnabled = !!data?.is_enabled
      this.loaded = true
      return this.smsEnabled
    },

    // برای پنل ادمین - تنظیمات کامل شامل کلید API
    async fetchFullSmsSettings() {
      const supabase = useSupabase()
      const { data } = await supabase.from('sms_settings').select('*').eq('id', 1).single()
      if (data) this.smsSettings = data
      return this.smsSettings
    },

    async updateSmsSettings(payload) {
      const supabase = useSupabase()
      const { data, error } = await supabase
        .from('sms_settings')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', 1)
        .select()
        .single()
      if (error) throw error
      this.smsSettings = data
      this.smsEnabled = data.is_enabled
      return data
    }
  }
})
