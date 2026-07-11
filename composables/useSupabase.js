// کامپوزبل کمکی - در استورها و صفحات به جای useNuxtApp().$supabase از این استفاده می‌کنیم
export function useSupabase() {
  const { $supabase } = useNuxtApp()
  return $supabase
}
