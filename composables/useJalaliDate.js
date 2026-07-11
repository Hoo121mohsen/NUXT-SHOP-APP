import jalaali from 'jalaali-js'

// تبدیل تاریخ میلادی به شمسی برای نمایش در فاکتورها، گزارشات و لیست‌های داشبورد
// خروجی مثلا: ۱۴۰۴/۰۴/۱۶  یا با ساعت: ۱۴۰۴/۰۴/۱۶ - ۱۴:۳۰
const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

function toPersianDigits(str) {
  return String(str).replace(/[0-9]/g, (d) => persianDigits[Number(d)])
}

export function toJalaliDate(dateInput) {
  if (!dateInput) return ''
  const d = new Date(dateInput)
  const { jy, jm, jd } = jalaali.toJalaali(d)
  const pad = (n) => String(n).padStart(2, '0')
  return toPersianDigits(`${jy}/${pad(jm)}/${pad(jd)}`)
}

export function toJalaliDateTime(dateInput) {
  if (!dateInput) return ''
  const d = new Date(dateInput)
  const pad = (n) => String(n).padStart(2, '0')
  return `${toJalaliDate(dateInput)} - ${toPersianDigits(`${pad(d.getHours())}:${pad(d.getMinutes())}`)}`
}

// نام ماه‌های شمسی (برای نمایش خواناتر در صورت نیاز)
export const jalaliMonthNames = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
]
