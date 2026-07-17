import { useAuthStore } from '~/stores/auth'

// این میدلور به صورت گلوبال (global) روی همه صفحات اجرا می‌شود
// و مسیرهای نیازمند ورود + دسترسی نقش‌محور (RBAC) داشبوردهای مختلف را کنترل می‌کند
export default defineNuxtRouteMiddleware(async (to) => {
  const needsAuth = ['/dashboard', '/checkout', '/sales-dashboard', '/supplier-dashboard', '/profile'].some((p) =>
    to.path.startsWith(p)
  )
  if (!needsAuth) return

  const authStore = useAuthStore()
  await authStore.fetchUser()

  if (!authStore.user) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  const role = authStore.role

  // امنیت: فقط ادمین به داشبورد اصلی دسترسی دارد؛ بقیه نقش‌ها به داشبورد اختصاصی خودشان هدایت می‌شوند
  // استثنا: بخش تیکت‌ها و نظرات محصول باید برای مدیر فروش هم در دسترس باشد
  if (to.path.startsWith('/dashboard/tickets') || to.path.startsWith('/dashboard/comments')) {
    if (role === 'admin' || role === 'sales_manager') return
    return navigateTo('/')
  }

  if (to.path.startsWith('/dashboard')) {
    if (role === 'admin') return
    if (role === 'sales_manager') return navigateTo('/sales-dashboard')
    if (role === 'supplier') return navigateTo('/supplier-dashboard')
    return navigateTo('/') // مشتری عادی اصلاً اجازه ورود ندارد
  }

  if (to.path.startsWith('/sales-dashboard')) {
    if (role === 'admin' || role === 'sales_manager') return
    return navigateTo('/')
  }

  if (to.path.startsWith('/supplier-dashboard')) {
    if (role === 'admin' || role === 'supplier') return
    return navigateTo('/')
  }

  // /checkout: هر کاربر لاگین‌کرده (با هر نقشی) مجاز است
})
