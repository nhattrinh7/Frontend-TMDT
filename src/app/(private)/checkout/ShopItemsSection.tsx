'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Ticket, Check } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { getEligibleShopVouchersAPI } from '~/apiRequests/order.apiRequest'
import type { CalculatePriceShop, EligibleVoucher, EligibleVoucherItem } from '~/apiRequests/order.apiRequest'
import { toast } from 'sonner'

// Format giá
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

interface ShopItemsSectionProps {
  itemsWithShop: CalculatePriceShop[]
  shopVouchers: Record<string, string> // shopId -> voucherId
  selectedVoucherNames: Record<string, string> // shopId -> voucher name (for display)
  onShopVoucherChange: (shopId: string, voucherId: string | null, voucherName: string | null) => void
  allItems: EligibleVoucherItem[] // tất cả items đã chọn (cần cho API eligible)
}

export default function ShopItemsSection({
  itemsWithShop,
  shopVouchers,
  selectedVoucherNames,
  onShopVoucherChange,
  allItems,
}: ShopItemsSectionProps) {
  return (
    <div className='space-y-4'>
      {itemsWithShop.map((shop) => (
        <ShopCard
          key={shop.id}
          shop={shop}
          selectedVoucherId={shopVouchers[shop.id] || null}
          selectedVoucherName={selectedVoucherNames[shop.id] || null}
          onVoucherChange={(voucherId, voucherName) =>
            onShopVoucherChange(shop.id, voucherId, voucherName)
          }
          shopItems={allItems.filter((item) =>
            shop.items.some((si) => si.productVariantId === item.productVariantId)
          )}
        />
      ))}
    </div>
  )
}

// ============ ShopCard ============

interface ShopCardProps {
  shop: CalculatePriceShop
  selectedVoucherId: string | null
  selectedVoucherName: string | null
  onVoucherChange: (voucherId: string | null, voucherName: string | null) => void
  shopItems: EligibleVoucherItem[]
}

function ShopCard({ shop, selectedVoucherId, selectedVoucherName, onVoucherChange, shopItems }: ShopCardProps) {
  const [eligibleVouchers, setEligibleVouchers] = useState<EligibleVoucher[]>([])
  const [loadingVouchers, setLoadingVouchers] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const fetchEligibleVouchers = async () => {
    setLoadingVouchers(true)
    try {
      const response = await getEligibleShopVouchersAPI(shop.id, { items: shopItems })
      setEligibleVouchers(response.data.vouchers)
    } catch {
      toast.error('Không thể tải voucher shop')
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
    if (selectedVoucherId === voucher.id) {
      // Bỏ chọn nếu nhấn lại voucher đã chọn
      onVoucherChange(null, null)
    } else {
      onVoucherChange(voucher.id, voucher.name)
    }
    setIsPopoverOpen(false)
  }

  return (
    <div className='rounded-lg border border-slate-200 bg-white'>
      {/* Shop Header */}
      <div className='flex items-center gap-3 border-b border-slate-200 px-6 py-4'>
        {shop.logo ? (
          <Image
            src={shop.logo}
            alt={shop.name}
            width={36}
            height={36}
            className='h-9 w-9 rounded-full object-cover'
          />
        ) : (
          <div className='flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100'>
            <span className='text-sm font-semibold text-emerald-700'>{shop.name[0]}</span>
          </div>
        )}
        <span className='font-semibold text-slate-900'>{shop.name}</span>
      </div>

      {/* Items */}
      <div className='divide-y divide-slate-100'>
        {shop.items.map((item) => (
          <div key={item.id} className='flex items-center gap-4 px-6 py-4'>
            {/* Image */}
            <div className='h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200'>
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={64}
                  height={64}
                  className='h-full w-full object-cover'
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center bg-slate-100'>
                  <span className='text-xs text-slate-400'>No img</span>
                </div>
              )}
            </div>

            {/* Tên + Phân loại */}
            <div className='min-w-0 flex-1'>
              <h3 className='line-clamp-1 text-sm font-semibold text-slate-900'>{item.name}</h3>
              {item.sku && (
                <p className='mt-0.5 text-xs text-slate-500'>Phân loại: {item.sku}</p>
              )}
            </div>

            {/* Đơn giá */}
            <div className='w-28 shrink-0 text-right'>
              <p className='text-sm text-slate-600'>{formatPrice(item.price)}</p>
            </div>

            {/* Số lượng */}
            <div className='w-16 shrink-0 text-center'>
              <p className='text-sm text-slate-600'>x{item.quantity}</p>
            </div>

            {/* Thành tiền */}
            <div className='w-28 shrink-0 text-right'>
              <p className='text-sm font-semibold text-emerald-700'>
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Shop Footer: Voucher + Summary */}
      <div className='border-t border-slate-200 px-6 py-4'>
        {/* Shop Voucher */}
        <div className='mb-3 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Ticket className='h-4 w-4 text-orange-500' />
            <span className='text-sm font-medium text-slate-700'>Voucher Shop</span>
          </div>

          <Popover open={isPopoverOpen} onOpenChange={handlePopoverOpen}>
            <PopoverTrigger asChild>
              <button className='rounded-lg border border-orange-400 px-3 py-1.5 text-sm font-medium text-orange-600 transition-all hover:bg-orange-50'>
                {selectedVoucherName ? selectedVoucherName : 'Chọn voucher'}
              </button>
            </PopoverTrigger>
            <PopoverContent className='w-80 p-0' align='end'>
              <div className='border-b border-slate-200 px-4 py-3'>
                <h4 className='font-semibold text-slate-900'>Voucher của Shop</h4>
              </div>
              <div className='max-h-60 overflow-y-auto p-2'>
                {loadingVouchers ? (
                  <div className='flex items-center justify-center py-6'>
                    <div className='h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent' />
                  </div>
                ) : eligibleVouchers.length === 0 ? (
                  <p className='py-6 text-center text-sm text-slate-500'>
                    Không có voucher khả dụng
                  </p>
                ) : (
                  eligibleVouchers.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleSelectVoucher(v)}
                      className={`mb-1 w-full rounded-lg border-2 p-3 text-left transition-all hover:border-orange-400 hover:bg-orange-50/50 ${
                        selectedVoucherId === v.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className='flex items-start justify-between'>
                        <div>
                          <div className='flex items-center gap-2'>
                            <span className='font-semibold text-slate-900'>{v.name}</span>
                            {selectedVoucherId === v.id && (
                              <Check className='h-4 w-4 text-orange-600' />
                            )}
                          </div>
                          <p className='mt-0.5 text-xs text-slate-500'>Mã: {v.code}</p>
                          <p className='mt-1 text-sm font-medium text-orange-600'>
                            Giảm{' '}
                            {v.discountType === 'FIXED'
                              ? formatPrice(v.discountValue)
                              : `${v.discountValue}%`}
                            {v.maxDiscountValue && ` (tối đa ${formatPrice(v.maxDiscountValue)})`}
                          </p>
                        </div>
                      </div>
                      <p className='mt-1 text-xs text-slate-400'>
                        Đơn tối thiểu: {formatPrice(v.minOrderValue)} • Còn lại: {v.userRemainingUsage} lượt
                      </p>
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Shop Summary */}
        <div className='space-y-1.5 border-t border-dashed border-slate-200 pt-3'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-slate-500'>Tổng tiền hàng:</span>
            <span className='font-medium text-slate-700'>{formatPrice(shop.shopSubtotal)}</span>
          </div>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-slate-500'>Phí vận chuyển:</span>
            <span className='font-medium text-slate-700'>{formatPrice(shop.shopShippingFee)}</span>
          </div>
          {shop.shopVoucherDiscount > 0 && (
            <div className='flex items-center justify-between text-sm'>
              <span className='text-slate-500'>Giảm giá voucher:</span>
              <span className='font-medium text-orange-600'>
                -{formatPrice(shop.shopVoucherDiscount)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
