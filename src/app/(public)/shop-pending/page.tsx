'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, XCircle, CheckCircle, ArrowLeft, Store } from 'lucide-react'
import { checkUserHasShopAPI } from '~/apiRequests/shop.apiRequest'
import { useBoundStore } from '~/zustand/store'

export default function ShopPendingPage() {
  const [shopStatus, setShopStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const user = useBoundStore((state) => state.user)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const checkShopStatus = async () => {
      try {
        const response = await checkUserHasShopAPI()
        const { hasShop, shopStatus: status } = response.data

        if (!hasShop) {
          router.push('/create-shop')
          return
        }

        if (status === 'ACTIVE') {
          router.push('/shop/orders')
          return
        }

        setShopStatus(status)
      } catch {
        // Ignore error
      } finally {
        setIsLoading(false)
      }
    }
    checkShopStatus()
  }, [user, router])

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004643]'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
      <div className='max-w-lg w-full'>
        {shopStatus === 'UNDER_REVIEW' && (
          <div className='bg-white rounded-2xl shadow-lg overflow-hidden'>
            {/* Header */}
            <div className='bg-linear-to-r from-amber-400 to-amber-500 p-8 text-center'>
              <div className='inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4'>
                <Clock className='w-10 h-10 text-white' />
              </div>
              <h1 className='text-2xl font-bold text-white'>Đang chờ phê duyệt</h1>
            </div>

            {/* Content */}
            <div className='p-8 text-center'>
              <div className='flex items-center justify-center gap-2 mb-4'>
                <Store className='w-5 h-5 text-amber-500' />
                <span className='text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full'>
                  Đang xử lý
                </span>
              </div>

              <p className='text-gray-600 mb-2'>
                Đơn đăng ký shop của bạn đã được gửi thành công.
              </p>
              <p className='text-gray-600 mb-6'>
                Chúng tôi sẽ xem xét và phản hồi qua email trong thời gian sớm nhất. Vui lòng kiểm tra email thường xuyên.
              </p>

              <div className='bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6'>
                <p className='text-sm text-amber-700'>
                  ⏳ Thời gian phê duyệt thường mất từ 1-3 ngày làm việc
                </p>
              </div>

              <button
                onClick={() => router.push('/')}
                className='inline-flex items-center gap-2 text-[#004643] hover:text-[#005d58] font-semibold transition-colors'
              >
                <ArrowLeft className='w-4 h-4' />
                Quay về trang chủ
              </button>
            </div>
          </div>
        )}

        {shopStatus === 'REJECTED' && (
          <div className='bg-white rounded-2xl shadow-lg overflow-hidden'>
            {/* Header */}
            <div className='bg-linear-to-r from-red-400 to-red-500 p-8 text-center'>
              <div className='inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4'>
                <XCircle className='w-10 h-10 text-white' />
              </div>
              <h1 className='text-2xl font-bold text-white'>Đơn đăng ký bị từ chối</h1>
            </div>

            {/* Content */}
            <div className='p-8 text-center'>
              <p className='text-gray-600 mb-6'>
                Rất tiếc, đơn đăng ký shop của bạn đã bị từ chối. Vui lòng kiểm tra email để biết lý do và liên hệ hỗ trợ nếu cần.
              </p>

              <div className='flex flex-col gap-3'>
                <button
                  onClick={() => router.push('/create-shop')}
                  className='w-full px-6 py-3 bg-[#004643] text-white rounded-lg font-semibold hover:bg-[#005d58] transition-all'
                >
                  Đăng ký lại
                </button>
                <button
                  onClick={() => router.push('/')}
                  className='inline-flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 font-medium transition-colors'
                >
                  <ArrowLeft className='w-4 h-4' />
                  Quay về trang chủ
                </button>
              </div>
            </div>
          </div>
        )}

        {shopStatus === 'BANNED' && (
          <div className='bg-white rounded-2xl shadow-lg overflow-hidden'>
            <div className='bg-linear-to-r from-gray-600 to-gray-700 p-8 text-center'>
              <div className='inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4'>
                <XCircle className='w-10 h-10 text-white' />
              </div>
              <h1 className='text-2xl font-bold text-white'>Shop đã bị cấm</h1>
            </div>
            <div className='p-8 text-center'>
              <p className='text-gray-600 mb-6'>
                Shop của bạn đã bị cấm hoạt động. Vui lòng liên hệ bộ phận hỗ trợ để biết thêm chi tiết.
              </p>
              <button
                onClick={() => router.push('/')}
                className='inline-flex items-center gap-2 text-[#004643] hover:text-[#005d58] font-semibold transition-colors'
              >
                <ArrowLeft className='w-4 h-4' />
                Quay về trang chủ
              </button>
            </div>
          </div>
        )}

        {shopStatus === 'CLOSED' && (
          <div className='bg-white rounded-2xl shadow-lg overflow-hidden'>
            <div className='bg-linear-to-r from-gray-400 to-gray-500 p-8 text-center'>
              <div className='inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4'>
                <CheckCircle className='w-10 h-10 text-white' />
              </div>
              <h1 className='text-2xl font-bold text-white'>Shop đã đóng</h1>
            </div>
            <div className='p-8 text-center'>
              <p className='text-gray-600 mb-6'>
                Shop của bạn hiện đã đóng. Nếu muốn mở lại, vui lòng liên hệ bộ phận hỗ trợ.
              </p>
              <button
                onClick={() => router.push('/')}
                className='inline-flex items-center gap-2 text-[#004643] hover:text-[#005d58] font-semibold transition-colors'
              >
                <ArrowLeft className='w-4 h-4' />
                Quay về trang chủ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
