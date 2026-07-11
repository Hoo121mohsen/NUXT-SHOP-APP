// مدیریت حالت روز/شب سایت
// تم پیش‌فرض سایت "شب/تیره" است؛ انتخاب کاربر در localStorage ذخیره می‌شود تا با رفرش صفحه از بین نرود
export function useDarkMode() {
  const isDark = useState('isDark', () => true) // پیش‌فرض: حالت شب

  function applyClass() {
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', isDark.value)
    }
  }

  function init() {
    if (import.meta.client) {
      const saved = localStorage.getItem('theme')
      // اگر کاربر قبلاً انتخابی نکرده، تم پیش‌فرض سایت (شب) اعمال می‌شود
      isDark.value = saved ? saved === 'dark' : true
      applyClass()
    }
  }

  function toggle() {
    isDark.value = !isDark.value
    if (import.meta.client) {
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    }
    applyClass()
  }

  return { isDark, init, toggle }
}
