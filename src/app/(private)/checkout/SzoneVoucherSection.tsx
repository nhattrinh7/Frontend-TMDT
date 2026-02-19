'use client'

import { useState } from 'react'
import { Ticket, Check } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { getEligibleSzoneVouchersAPI } from '~/apiRequests/order.apiRequest'
import type { EligibleVoucher, EligibleVoucherItem } from '~/apiRequests/order.apiRequest'
import { toast } from 'sonner'

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

interface SzoneVoucherSectionProps {
  szoneVoucherId: string | null
  szoneVoucherName: string | null
  onSzoneVoucherChange: (voucherId: string | null, voucherName: string | null) => void
  allItems: EligibleVoucherItem[]
}

export default function SzoneVoucherSection({
  szoneVoucherId,
  szoneVoucherName,
  onSzoneVoucherChange,
  allItems,
}: SzoneVoucherSectionProps) {
  const [eligibleVouchers, setEligibleVouchers] = useState<EligibleVoucher[]>([])
  const [loadingVouchers, setLoadingVouchers] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const fetchEligibleVouchers = async () => {
    setLoadingVouchers(true)
    try {
      const response = await getEligibleSzoneVouchersAPI({ items: allItems })
      setEligibleVouchers(response.data.vouchers)
    } catch {
      toast.error('Không thể tải voucher sàn')
    } finally {
      setLoadingVouchers(false)
    }
  }

  const handlePopoverOpen = (open: boolean) => {
    setIsPopoverOpen(open)
    if (open) {
      fetchEligibleVouchers()
    }
  }

  const handleSelectVoucher = (voucher: EligibleVoucher) => {
    if (szoneVoucherId === voucher.id) {
      onSzoneVoucherChange(null, null)
    } else {
      onSzoneVoucherChange(voucher.id, voucher.name)
    }
    setIsPopoverOpen(false)
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-rose-500" />
          <span className="font-bold text-slate-900">Voucher Szone</span>
          {szoneVoucherName && (
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
              {szoneVoucherName}
            </span>
          )}
        </div>

        <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpen}>
          <PopoverTrigger asChild>
            <button className="rounded-lg border border-rose-400 px-4 py-2 text-sm font-semibold text-rose-600 transition-all hover:bg-rose-50">
              {szoneVoucherId ? 'Đổi voucher' : 'Chọn voucher sàn'}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="border-b border-slate-200 px-4 py-3">
              <h4 className="font-semibold text-slate-900">Voucher Sàn Szone</h4>
            </div>
            <div className="max-h-60 overflow-y-auto p-2">
              {loadingVouchers ? (
                <div className="flex items-center justify-center py-6">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                </div>
              ) : eligibleVouchers.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  Không có voucher sàn khả dụng
                </p>
              ) : (
                eligibleVouchers.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handleSelectVoucher(v)}
                    className={`mb-1 w-full rounded-lg border-2 p-3 text-left transition-all hover:border-rose-400 hover:bg-rose-50/50 ${
                      szoneVoucherId === v.id
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{v.name}</span>
                          {szoneVoucherId === v.id && (
                            <Check className="h-4 w-4 text-rose-600" />
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">Mã: {v.code}</p>
                        <p className="mt-1 text-sm font-medium text-rose-600">
                          Giảm{' '}
                          {v.discountType === 'FIXED'
                            ? formatPrice(v.discountValue)
                            : `${v.discountValue}%`}
                          {v.maxDiscountValue && ` (tối đa ${formatPrice(v.maxDiscountValue)})`}
                        </p>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      Đơn tối thiểu: {formatPrice(v.minOrderValue)} • Còn lại: {v.userRemainingUsage} lượt
                    </p>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
