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
    <div className='mb-8'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl font-bold text-gray-800'>Cửa hàng</h2>
        {shops.length > 5 && (
          <Link 
            href={`/search/shops?search=${encodeURIComponent(searchQuery)}`}
            className='text-sm text-[#004643] hover:text-[#005d58] font-semibold'
          >
            Xem thêm ({shops.length - 5})
          </Link>
        )}
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
        {displayedShops.map((shop) => (
          <div
            key={shop.id}
            className='flex flex-col items-center bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow'
          >
            <div className='relative w-20 h-20 mb-3 shrink-0'>
              <Image
                src={shop.logo}
                alt={shop.name}
                fill
                className='object-cover rounded-full'
              />
            </div>
            <h3 className='text-base text-gray-800 line-clamp-2 text-center mb-3 px-2'>
              {shop.name}
            </h3>
            <Link
              href={`/shop/${shop.id}`}
              className='px-4 py-1.5 text-sm border-2 border-[#004643] text-[#004643] rounded-md hover:bg-[#004643] hover:text-white transition-colors whitespace-nowrap'
            >
              Xem shop
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
