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

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
        {displayedShops.map((shop) => (
          <Link
            key={shop.id}
            href={`/shop/${shop.id}`}
            className='group flex flex-col items-center'
          >
            <div className='relative w-32 h-32 mb-3 shrink-0'>
              <Image
                src={shop.logo}
                alt={shop.name}
                fill
                className='object-cover rounded-full group-hover:scale-110 transition-transform'
              />
            </div>
            <h3 className='font-bold text-base text-gray-800 line-clamp-2 text-center'>
              {shop.name}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  )
}
