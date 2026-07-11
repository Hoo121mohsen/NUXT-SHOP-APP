import { ref } from 'vue'

// کامپوزبل مشترک چاپ و خروجی PDF فاکتورها (خرید و فروش)
// pageSize کنترل می‌کند که ناحیه قابل چاپ چه عرضی داشته باشد (A4 پهن‌تر برای فاکتورهای پرستون، A5 برای فاکتورهای ساده)
export function usePrintInvoice() {
  const pageSize = ref('A4') // A4 | A5

  function printNow() {
    if (import.meta.client) window.print()
  }

  async function downloadPdf(elementId, filename = 'invoice.pdf') {
    if (!import.meta.client) return
    const html2pdf = (await import('html2pdf.js')).default
    const el = document.getElementById(elementId)
    if (!el) return
    await html2pdf()
      .set({
        margin: 8,
        filename,
        html2canvas: { scale: 2 },
        jsPDF: {
          unit: 'mm',
          format: pageSize.value === 'A5' ? 'a5' : 'a4',
          orientation: 'portrait'
        }
      })
      .from(el)
      .save()
  }

  return { pageSize, printNow, downloadPdf }
}
