'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import Header from '~/app/(public)/Header'
import { CheckCircle2, XCircle, Clock, ShoppingBag, ArrowLeft } from 'lucide-react'

function ResultContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const status = searchParams.get('status') || 'success'
  const orderIds = searchParams.get('orderIds')?.split(',').filter(Boolean) || []
  const message = searchParams.get('message') || ''

  const config: Record<string, {
    icon: React.ReactNode
    title: string
    description: string
    bgColor: string
    iconBgColor: string
  }> = {
    success: {
      icon: <CheckCircle2 className='h-10 w-10 text-emerald-500' />,
      title: 'Đặt hàng thành công!',
      description: 'Đơn hàng của bạn đã được tạo và đang chờ xác nhận từ người bán.',
      bgColor: 'bg-emerald-50',
      iconBgColor: 'bg-emerald-100',
    },
    failed: {
      icon: <XCircle className='h-10 w-10 text-red-500' />,
      title: 'Đặt hàng thất bại',
      description: message || 'Có lỗi xảy ra trong quá trình xử lý đơn hàng.',
      bgColor: 'bg-red-50',
      iconBgColor: 'bg-red-100',
    },
    timeout: {
      icon: <Clock className='h-10 w-10 text-amber-500' />,
      title: 'Hết thời gian thanh toán',
      description: 'Bạn không thực hiện thanh toán trong thời gian quy định. Đơn hàng đã bị hủy.',
      bgColor: 'bg-amber-50',
      iconBgColor: 'bg-amber-100',
    },
  }

  const currentConfig = config[status] || config.failed

  return (
    <div className='container mx-auto max-w-lg px-6 py-12'>
      <div className='rounded-2xl border border-slate-200 bg-white p-8 shadow-sm'>
        {/* Icon + Title */}
        <div className='flex flex-col items-center text-center'>
          <div className={`flex h-20 w-20 items-center justify-center rounded-full ${currentConfig.iconBgColor}`}>
            {currentConfig.icon}
          </div>
          <h1 className='mt-5 text-2xl font-bold text-slate-900'>{currentConfig.title}</h1>
          <p className='mt-2 max-w-sm text-sm text-slate-500'>{currentConfig.description}</p>
        </div>

        {/* Order IDs (chỉ hiện khi success) */}
        {status === 'success' && orderIds.length > 0 && (
          <div className='mt-6 rounded-lg bg-slate-50 p-4'>
            <p className='mb-2 text-xs font-medium uppercase tracking-wide text-slate-400'>Mã đơn hàng</p>
            <div className='space-y-1.5'>
              {orderIds.map((id) => (
                <div key={id} className='flex items-center gap-2'>
                  <ShoppingBag className='h-4 w-4 text-emerald-500' />
                  <span className='font-mono text-sm font-medium text-slate-700'>{id}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className='mt-8 flex flex-col gap-3'>
          {status === 'success' ? (
            <>
              <button
                onClick={() => router.push('/user/purchase')}
                className='w-full rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-800 hover:shadow-md active:scale-[0.98]'
              >
                Xem đơn hàng của tôi
              </button>
              <button
                onClick={() => router.push('/')}
                className='w-full rounded-lg border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98]'
              >
                Tiếp tục mua sắm
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/checkout')}
                className='w-full rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-800 hover:shadow-md active:scale-[0.98]'
              >
                Thử lại
              </button>
              <button
                onClick={() => router.push('/cart')}
                className='flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98]'
              >
                <ArrowLeft className='h-4 w-4' />
                Quay lại giỏ hàng
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CheckoutResultPage() {
  return (
    <>
      <Header />
      <div className='min-h-screen bg-gray-50'>
        <Suspense
          fallback={
            <div className='flex items-center justify-center py-20'>
              <div className='h-8 w-8 animate-spin rounded-full border-3 border-emerald-700 border-t-transparent' />
            </div>
          }
        >
          <ResultContent />
        </Suspense>
      </div>
    </>
  )
}
