'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Store, ExternalLink, Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { UserOrder } from '~/apiRequests/order.apiRequest'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'

interface OrderCardProps {
  order: UserOrder
  activeStatus: string
  onCancelOrder: (orderId: string, reason?: string) => Promise<void>
}

export default function OrderCard({ order, activeStatus, onCancelOrder }: OrderCardProps) {
  const showCancelButton = activeStatus === 'AWAITING_CONFIRMATION' || activeStatus === 'PREPARING'
  const showReviewButton = activeStatus === 'DELIVERY_COMPLETED'

  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelReason, setCancelReason] = useState<string>('')
  const [customReason, setCustomReason] = useState('')

  const CANCEL_REASONS = [
    'Muốn thay đổi địa chỉ giao hàng',
    'Muốn thêm/bớt sản phẩm',
    'Tìm thấy giá rẻ hơn ở nơi khác',
    'Đổi ý, không muốn mua nữa',
    'Khác',
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const handleConfirmCancel = async () => {
    if (cancelReason === 'Khác' && !customReason.trim()) {
      return // Don't allow empty custom reason
    }
    const finalReason = cancelReason === 'Khác' ? customReason.trim() : cancelReason

    setIsCancelling(true)
    try {
      await onCancelOrder(order.id, finalReason || undefined)
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className='bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden'>
      {/* Shop Header */}
      <div className='flex items-center justify-between px-5 py-3 bg-gray-50/80 border-b border-gray-100'>
        <div className='flex items-center gap-2'>
          <Store className='w-4 h-4 text-[#004643]' />
          <span className='font-bold text-gray-800'>{order.shopName}</span>
        </div>
        <div className='flex items-center gap-3'>
          <Link
            href={`/shop/${order.shopId}`}
            className='inline-flex items-center gap-1.5 text-sm font-medium text-[#004643] hover:text-[#005d58] transition-colors'
          >
            <ExternalLink className='w-3.5 h-3.5' />
            Xem shop
          </Link>
        </div>
      </div>

      {/* Order Content */}
      <div className='px-5 py-4'>
        {/* Mã đơn hàng */}
        <p className='text-xs text-gray-400 mb-3'>
          Mã đơn hàng: <span className='text-gray-600 font-mono'>{order.id.slice(0, 8).toUpperCase()}</span>
        </p>

        {/* Order Items */}
        <div className='space-y-3'>
          {order.orderItems.map((item) => (
            <div key={item.id} className='flex items-center gap-4'>
              {/* Variant Image */}
              <div className='relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-50'>
                <Image
                  src={item.variantImage}
                  alt={item.productName}
                  fill
                  className='object-cover'
                  sizes='64px'
                />
              </div>

              {/* Item Info */}
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-800 line-clamp-1'>{item.productName}</p>
                <p className='text-xs text-gray-500 mt-0.5'>Phân loại: {item.sku}</p>
                <p className='text-xs text-gray-500'>x{item.quantity}</p>
              </div>

              {/* Price */}
              <div className='text-right shrink-0'>
                <p className='text-sm font-semibold text-red-500'>{formatPrice(item.finalPrice)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Footer */}
      <div className='flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50'>
        <div className='text-sm text-gray-600'>
          Tổng đơn: <span className='text-base font-bold text-red-500'>{formatPrice(order.finalPrice)}</span>
        </div>

        <div className='flex items-center gap-2'>
          {showCancelButton && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5'
                  disabled={isCancelling}
                >
                  {isCancelling && <Loader2 className='w-3.5 h-3.5 animate-spin' />}
                  Hủy đơn
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className='sm:max-w-[425px] rounded-2xl overflow-hidden p-0 gap-0 border-0 shadow-2xl'>
                {/* Header with gradient background */}
                <AlertDialogHeader className='bg-linear-to-r from-red-500 to-red-600 px-6 py-5 text-white'>
                  <AlertDialogTitle className='text-xl font-bold text-white flex items-center gap-2'>
                    Xác nhận hủy đơn hàng
                  </AlertDialogTitle>
                  <AlertDialogDescription className='text-red-50 mt-1 max-w-[95%]'>
                    Bạn đang yêu cầu hủy đơn hàng{' '}
                    <span className='font-bold text-white tracking-wide'>
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    . Vui lòng chọn lý do để chúng tôi cải thiện dịch vụ tốt hơn nhé!
                  </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Body with reasons list */}
                <div className='px-6 py-5 bg-white'>
                  <div className='flex flex-col gap-3'>
                    {CANCEL_REASONS.map((reason) => (
                      <div 
                        key={reason} 
                        className={`
                          relative flex items-center rounded-xl border p-3 cursor-pointer transition-all duration-200
                          ${cancelReason === reason 
                            ? 'border-red-500 bg-red-50/50 shadow-sm' 
                            : 'border-gray-200 hover:border-red-200 hover:bg-gray-50'
                          }
                        `}
                        onClick={() => setCancelReason(reason)}
                      >
                        <div className={`
                          flex shrink-0 items-center justify-center w-5 h-5 rounded-full border mr-3 transition-colors duration-200
                          ${cancelReason === reason
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-300'
                          }
                        `}>
                          {cancelReason === reason && (
                            <div className='w-2 h-2 rounded-full bg-white'></div>
                          )}
                        </div>
                        <span className={`text-sm font-medium ${cancelReason === reason ? 'text-red-700' : 'text-gray-700'}`}>
                          {reason}
                        </span>
                      </div>
                    ))}
                    
                    {/* Expandable Custom Reason Input */}
                    <div className={`
                      overflow-hidden transition-all duration-300 ease-in-out
                      ${cancelReason === 'Khác' ? 'max-h-32 opacity-100 mt-1' : 'max-h-0 opacity-0'}
                    `}>
                      <textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder='Chia sẻ lý do cụ thể của bạn để shop cải thiện nhé...'
                        className='w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all resize-none'
                        rows={3}
                        maxLength={500}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer with actions */}
                <AlertDialogFooter className='bg-gray-50 px-6 py-4 border-t border-gray-100 rounded-b-2xl flex sm:justify-end gap-3 sm:gap-0'>
                  <AlertDialogCancel className='mt-0 bg-white border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-xl px-5 transition-colors'>
                    Suy nghĩ lại
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className='bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/20 rounded-xl px-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
                    onClick={handleConfirmCancel}
                    disabled={!cancelReason || (cancelReason === 'Khác' && !customReason.trim())}
                  >
                    Xác nhận hủy
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {showReviewButton && (
            <button
              className='px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#004643] to-[#005d58] rounded-lg hover:from-[#003d3a] hover:to-[#00524e] transition-all shadow-sm'
              onClick={() => {
                // TODO: Implement review order
              }}
            >
              Đánh giá
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
