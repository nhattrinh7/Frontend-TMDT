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
  onCancelOrder: (orderId: string) => Promise<void>
}

export default function OrderCard({ order, activeStatus, onCancelOrder }: OrderCardProps) {
  const showCancelButton = activeStatus === 'AWAITING_CONFIRMATION' || activeStatus === 'PREPARING'
  const showReviewButton = activeStatus === 'DELIVERY_COMPLETED'

  const [isCancelling, setIsCancelling] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const handleConfirmCancel = async () => {
    setIsCancelling(true)
    try {
      await onCancelOrder(order.id)
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
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận hủy đơn hàng</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn hủy đơn hàng{' '}
                    <span className='font-semibold text-gray-700'>
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>{' '}
                    không? Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Giữ đơn</AlertDialogCancel>
                  <AlertDialogAction
                    className='bg-red-500 hover:bg-red-600 text-white'
                    onClick={handleConfirmCancel}
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
