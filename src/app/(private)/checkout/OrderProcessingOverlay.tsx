'use client'

import { Loader2 } from 'lucide-react'

interface OrderProcessingOverlayProps {
  isVisible: boolean
  message?: string
}

export default function OrderProcessingOverlay({
  isVisible,
  message = 'Đang xử lý đơn hàng...',
}: OrderProcessingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='mx-4 flex flex-col items-center gap-5 rounded-2xl bg-white px-10 py-8 shadow-2xl'>
        <div className='relative'>
          <div className='h-16 w-16 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600' />
          <Loader2 className='absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-emerald-600' />
        </div>
        <div className='text-center'>
          <p className='text-base font-semibold text-slate-800'>{message}</p>
          <p className='mt-1 text-sm text-slate-400'>Vui lòng không đóng trang này</p>
        </div>
      </div>
    </div>
  )
}
