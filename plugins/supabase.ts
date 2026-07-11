import { createClient } from '@supabase/supabase-js'

// این پلاگین یک نمونه (instance) از کلاینت Supabase می‌سازد
// و آن را در کل اپلیکیشن (کامپوننت‌ها و استورها) با useNuxtApp().$supabase در دسترس می‌گذارد
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const supabase = createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey
  )

  return {
    provide: {
      supabase
    }
  }
})
