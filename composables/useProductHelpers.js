// توابع کمکی مشترک برای نمایش محصول در کارت‌ها و صفحات مختلف

// تصویر اول محصول (بر اساس sort_order) به عنوان کاور کارت
export function getCoverImage(product) {
  const images = product.product_images || []
  if (!images.length) return 'https://placehold.co/500x500?text=No+Image'
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order)
  return sorted[0].image_url
}

// همه تصاویر محصول به ترتیب، برای گالری صفحه جزئیات
export function getSortedImages(product) {
  const images = product.product_images || []
  return [...images].sort((a, b) => a.sort_order - b.sort_order).map((i) => i.image_url)
}

export function getSortedColors(product) {
  const colors = product.product_colors || []
  return [...colors].sort((a, b) => a.sort_order - b.sort_order)
}

// قیمت نهایی با احتساب درصد تخفیف
export function getFinalPrice(product) {
  const discount = Number(product.discount_percentage || 0)
  const price = Number(product.sale_price || 0)
  if (discount <= 0) return price
  return Math.round(price - (price * discount) / 100)
}

export function isInStock(product) {
  return Number(product.stock_quantity || 0) > 0
}

export function formatToman(value) {
  return Number(value || 0).toLocaleString('fa-IR')
}

// تبدیل مبلغ تومان (که در تعریف محصول وارد می‌شود) به ریال برای نمایش در فاکتورها
// خروجی با جداکننده هزارگان فارسی (۳ رقم ۳ رقم از هم جدا)
export function formatRial(tomanValue) {
  const rial = Math.round(Number(tomanValue || 0) * 10)
  return rial.toLocaleString('fa-IR')
}

