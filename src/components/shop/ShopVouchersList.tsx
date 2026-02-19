'use client'

import { useRef } from 'react'
import { ChevronLeft, ChevronRight, Ticket } from 'lucide-react'
import { Voucher } from '~/zodSchema/voucher.schema'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface ShopVouchersListProps {
  vouchers: Voucher[]
}

export default function ShopVouchersList({ vouchers }: ShopVouchersListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount)
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  if (!vouchers || vouchers.length === 0) {
    return null
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi })
  }

  const formatDiscount = (voucher: Voucher) => {
    if (voucher.discountType === 'PERCENT') {
      return `${voucher.discountValue}%`
    } else {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(voucher.discountValue)
    }
  }

  return (
    <div className='mb-6'>
      <h2 className='text-2xl font-bold text-gray-800 mb-4'>Mã Giảm Giá Của Shop</h2>
      
      <div className='relative group'>
        {/* Scroll buttons */}
        {vouchers.length > 3 && (
          <>
            <button
              onClick={() => scroll('left')}
              className='absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity'
              aria-label='Scroll left'
            >
              <ChevronLeft className='w-6 h-6 text-gray-700' />
            </button>
            <button
              onClick={() => scroll('right')}
              className='absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity'
              aria-label='Scroll right'
            >
              <ChevronRight className='w-6 h-6 text-gray-700' />
            </button>
          </>
        )}

        {/* Vouchers list */}
        <div
          ref={scrollContainerRef}
          className='flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2'
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {vouchers.map((voucher) => (
            <div
              key={voucher.id}
              className='shrink-0 w-80 bg-linear-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow'
            >
              <div className='flex items-start gap-3'>
                <div className='bg-amber-500 rounded-full p-2 shrink-0'>
                  <Ticket className='w-6 h-6 text-white' />
                </div>
                
                <div className='flex-1 min-w-0'>
                  {/* Voucher name */}
                  <h3 className='font-bold text-gray-800 text-lg mb-1 line-clamp-1'>
                    {voucher.name}
                  </h3>
                  
                  {/* Code */}
                  <div className='flex items-center gap-2 mb-2'>
                    <span className='text-sm font-semibold text-gray-600'>Mã:</span>
                    <code className='bg-amber-200 text-amber-900 px-2 py-1 rounded text-sm font-bold'>
                      {voucher.code}
                    </code>
                  </div>

                  {/* Discount info */}
                  <div className='mb-2'>
                    <p className='text-2xl font-bold text-[#FF6B35]'>
                      Giảm {formatDiscount(voucher)}
                    </p>
                  </div>

                  {/* Dates and User Limit */}
                  <div className='text-xs text-gray-600 space-y-1'>
                    <p>
                      <span className='font-semibold'>Thời gian:</span> {formatDate(voucher.startDate)} - {formatDate(voucher.endDate)}
                    </p>
                    <p>
                      <span className='font-semibold'>Giới hạn/người:</span> {voucher.perUserLimit} lần
                    </p>
                    <p className='text-xs text-gray-500 italic'>
                      {voucher.scope === 'ALL' 
                        ? 'Áp dụng cho tất cả sản phẩm' 
                        : 'Áp dụng cho một số sản phẩm nhất định'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
