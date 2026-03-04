'use client'

import type { CalculatePriceSummary } from '~/apiRequests/order.apiRequest'

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

interface OrderSummaryProps {
  summary: CalculatePriceSummary | null
  isLoading: boolean
  onPlaceOrder: () => void
  isPlacingOrder?: boolean
}

export default function OrderSummary({ summary, isLoading, onPlaceOrder, isPlacingOrder = false }: OrderSummaryProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-slate-900">Chi Tiết Thanh Toán</h2>

      {isLoading || !summary ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Tổng tiền hàng</span>
              <span className="font-medium text-slate-700">{formatPrice(summary.subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Tổng phí vận chuyển</span>
              <span className="font-medium text-slate-700">{formatPrice(summary.shippingFee)}</span>
            </div>

            {summary.shopsVoucherDiscount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Giảm giá voucher Shop</span>
                <span className="font-medium text-orange-600">
                  -{formatPrice(summary.shopsVoucherDiscount)}
                </span>
              </div>
            )}

            {summary.szoneVoucherDiscount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Giảm giá voucher Szone</span>
                <span className="font-medium text-rose-600">
                  -{formatPrice(summary.szoneVoucherDiscount)}
                </span>
              </div>
            )}

            <div className="border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-slate-900">Tổng thanh toán</span>
                <span className="text-2xl font-bold text-emerald-700">
                  {formatPrice(summary.finalPrice)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onPlaceOrder}
            disabled={isPlacingOrder}
            className="mt-6 w-full rounded-lg bg-emerald-800 py-3.5 text-base font-bold text-white shadow-sm transition-all hover:bg-emerald-900 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPlacingOrder ? 'Đang xử lý...' : 'Đặt Hàng'}
          </button>
        </>
      )}
    </div>
  )
}
