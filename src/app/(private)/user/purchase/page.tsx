'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Header from '~/app/(public)/Header'
import { useBoundStore } from '~/zustand/store'
import { getUserOrdersPaginatedAPI, type UserOrder } from '~/apiRequests/order.apiRequest'
import { formatPrice } from '~/lib/utils'
import {
  Package,
  MapPin,
  CreditCard,
  ArrowLeft,
  ShoppingBag,
  Loader2,
} from 'lucide-react'

const getPaymentMethodLabel = (method: string) => {
  switch (method) {
  case 'COD': return 'Thanh toán khi nhận hàng (COD)'
  case 'WALLET': return 'Ví S-Zone'
  case 'QRCODE': return 'Chuyển khoản (QR)'
  default: return method
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
  case 'PENDING_PAYMENT': return 'Chờ thanh toán'
  case 'AWAITING_CONFIRMATION': return 'Chờ xác nhận'
  case 'PREPARING': return 'Đang chuẩn bị'
  case 'SHIPPING': return 'Đang giao hàng'
  case 'DELIVERY_COMPLETED': return 'Đã giao'
  case 'CANCELLED': return 'Đã hủy'
  default: return status
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
  case 'PENDING_PAYMENT': return 'bg-amber-100 text-amber-700'
  case 'AWAITING_CONFIRMATION': return 'bg-blue-100 text-blue-700'
  case 'PREPARING': return 'bg-indigo-100 text-indigo-700'
  case 'SHIPPING': return 'bg-cyan-100 text-cyan-700'
  case 'DELIVERY_COMPLETED': return 'bg-emerald-100 text-emerald-700'
  case 'CANCELLED': return 'bg-red-100 text-red-700'
  default: return 'bg-gray-100 text-gray-700'
  }
}

export default function UserPurchasePage() {
  const router = useRouter()
  const user = useBoundStore((state) => state.user)
  const [order, setOrder] = useState<UserOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchLatestOrder = async () => {
      try {
        const res = await getUserOrdersPaginatedAPI(user.id, {
          status: 'AWAITING_CONFIRMATION',
          limit: 1,
        })
        if (res.data && res.data.length > 0) {
          setOrder(res.data[0])
        }
      } catch (error) {
        console.error('Failed to fetch order:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLatestOrder()
  }, [user])

  return (
    <>
      <Header />
      <div className='min-h-screen bg-gray-50'>
        <div className='container mx-auto max-w-3xl px-4 py-8'>
          {/* Back button */}
          <button
            onClick={() => router.push('/')}
            className='mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700'
          >
            <ArrowLeft className='h-4 w-4' />
            Quay lại trang chủ
          </button>

          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-20'>
              <Loader2 className='h-8 w-8 animate-spin text-emerald-600' />
              <p className='mt-3 text-sm text-slate-500'>Đang tải đơn hàng...</p>
            </div>
          ) : !order ? (
            <div className='flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 shadow-sm'>
              <ShoppingBag className='h-16 w-16 text-slate-300' />
              <p className='mt-4 text-lg font-medium text-slate-600'>Không tìm thấy đơn hàng</p>
              <p className='mt-1 text-sm text-slate-400'>Bạn chưa có đơn hàng nào đang chờ xác nhận.</p>
              <button
                onClick={() => router.push('/')}
                className='mt-6 rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-800'
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <div className='space-y-4'>
              {/* Order Header */}
              <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100'>
                      <Package className='h-5 w-5 text-emerald-600' />
                    </div>
                    <div>
                      <h1 className='text-lg font-bold text-slate-900'>Đơn hàng của bạn</h1>
                      <p className='font-mono text-xs text-slate-400'>{order.id}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className='mt-4 flex items-center gap-4 rounded-lg bg-slate-50 px-4 py-3 text-sm'>
                  <div className='flex items-center gap-2 text-slate-500'>
                    <ShoppingBag className='h-4 w-4' />
                    <span className='font-medium text-slate-700'>{order.shopName}</span>
                  </div>
                  <div className='h-4 w-px bg-slate-200' />
                  <div className='flex items-center gap-2 text-slate-500'>
                    <CreditCard className='h-4 w-4' />
                    <span>{getPaymentMethodLabel(order.paymentMethod)}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
                <h2 className='mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400'>
                  Sản phẩm ({order.orderItems.length})
                </h2>
                <div className='divide-y divide-slate-100'>
                  {order.orderItems.map((item) => (
                    <div key={item.id} className='flex gap-4 py-4 first:pt-0 last:pb-0'>
                      <div className='h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50'>
                        <Image
                          src={item.variantImage}
                          alt={item.productName}
                          width={80}
                          height={80}
                          className='h-full w-full object-cover'
                          unoptimized
                        />
                      </div>
                      <div className='flex flex-1 flex-col justify-center'>
                        <span className='line-clamp-2 text-sm font-medium text-slate-800'>
                          {item.productName}
                        </span>
                        <span className='mt-1 text-xs text-slate-400'>
                          Phân loại: {item.sku}
                        </span>
                        <span className='text-xs text-slate-400'>
                          Số lượng: x{item.quantity}
                        </span>
                      </div>
                      <div className='flex items-center'>
                        <span className='text-sm font-semibold text-rose-500'>
                          {formatPrice(item.finalPrice)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
                <h2 className='mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400'>
                  Thông tin thanh toán
                </h2>
                <div className='space-y-3 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-slate-500'>Tổng tiền hàng</span>
                    <span className='font-medium'>{formatPrice(order.goodsPrice)}</span>
                  </div>
                  <div className='border-t border-slate-100 pt-3'>
                    <div className='flex justify-between text-base'>
                      <span className='font-semibold text-slate-800'>Thành tiền</span>
                      <span className='text-lg font-bold text-rose-500'>{formatPrice(order.finalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className='flex gap-3'>
                <button
                  onClick={() => router.push('/')}
                  className='flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98]'
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
