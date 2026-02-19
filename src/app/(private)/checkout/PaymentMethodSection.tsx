'use client'

import { Wallet, QrCode, Truck } from 'lucide-react'

export type PaymentMethod = 'COD' | 'WALLET' | 'QRCODE'

interface PaymentMethodSectionProps {
  paymentMethod: PaymentMethod
  onPaymentMethodChange: (method: PaymentMethod) => void
}

const paymentOptions: { value: PaymentMethod; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'COD',
    label: 'Thanh toán khi nhận hàng',
    description: 'Thanh toán bằng tiền mặt khi nhận hàng',
    icon: <Truck className="h-5 w-5" />,
  },
  {
    value: 'WALLET',
    label: 'Ví Szone',
    description: 'Thanh toán bằng số dư ví Szone',
    icon: <Wallet className="h-5 w-5" />,
  },
  {
    value: 'QRCODE',
    label: 'Chuyển khoản ngân hàng',
    description: 'Quét mã QR để thanh toán qua ngân hàng',
    icon: <QrCode className="h-5 w-5" />,
  },
]

export default function PaymentMethodSection({
  paymentMethod,
  onPaymentMethodChange,
}: PaymentMethodSectionProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-bold text-slate-900">Phương Thức Thanh Toán</h2>

      <div className="space-y-2">
        {paymentOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onPaymentMethodChange(opt.value)}
            className={`flex w-full items-center gap-4 rounded-lg border-2 px-4 py-3.5 text-left transition-all ${
              paymentMethod === opt.value
                ? 'border-emerald-600 bg-emerald-50/50'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {/* Radio indicator */}
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                paymentMethod === opt.value
                  ? 'border-emerald-600'
                  : 'border-slate-300'
              }`}
            >
              {paymentMethod === opt.value && (
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              )}
            </div>

            {/* Icon */}
            <div
              className={`shrink-0 ${
                paymentMethod === opt.value ? 'text-emerald-700' : 'text-slate-500'
              }`}
            >
              {opt.icon}
            </div>

            {/* Text */}
            <div>
              <p
                className={`font-semibold ${
                  paymentMethod === opt.value ? 'text-emerald-800' : 'text-slate-700'
                }`}
              >
                {opt.label}
              </p>
              <p className="text-xs text-slate-500">{opt.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
