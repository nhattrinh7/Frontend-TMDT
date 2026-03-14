'use client'

import Image from 'next/image'
import Link from 'next/link'
import { SearchShop } from '~/zodSchema/search.schema'

interface ShopResultsProps {
  shops: SearchShop[]
  searchQuery: string
}

export default function ShopResults({ shops, searchQuery }: ShopResultsProps) {
  if (!shops || shops.length === 0) {
    return null
  }

  const displayedShops = shops.slice(0, 5)

  return (
    <div className='mb-12'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-2xl font-bold text-slate-800'>Cửa hàng</h2>
        {shops.length > 5 && (
          <Link 
            href={`/search/shops?search=${encodeURIComponent(searchQuery)}`}
            className='text-base text-[#004643] hover:text-[#005d58] font-bold'
          >
            Xem thêm ({shops.length - 5})
          </Link>
        )}
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6'>
        {displayedShops.map((shop) => (
          <div
            key={shop.id}
            className='flex flex-col items-center bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:border-[#004643]/30 transition-all group'
          >
            <div className='relative w-24 h-24 lg:w-32 lg:h-32 mb-4 shrink-0'>
              {shop.logo ? (
                <Image
                  src={shop.logo}
                  alt={shop.name}
                  fill
                  className='object-cover rounded-full group-hover:scale-105 transition-transform'
                />
              ) : (
                <div className='w-full h-full rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition-colors'>
                  <span className='text-3xl text-slate-400'>🏪</span>
                </div>
              )}
            </div>
            <h3 className='text-lg font-bold text-slate-800 line-clamp-1 text-center mb-5 px-2 group-hover:text-[#004643] transition-colors'>
              {shop.name}
            </h3>
            <Link
              href={`/shop/${shop.id}`}
              className='px-6 py-2.5 text-base font-bold border-2 border-[#004643] text-[#004643] rounded-xl hover:bg-[#004643] hover:text-white transition-all whitespace-nowrap shadow-sm'
            >
              Xem shop
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
