'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { SearchProduct } from '~/zodSchema/search.schema'

interface ProductResultsProps {
  products: SearchProduct[]
}

export default function ProductResults({ products }: ProductResultsProps) {
  if (!products || products.length === 0) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-500 text-lg'>Không tìm thấy sản phẩm nào</p>
      </div>
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  return (
    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/product/${product.id}`}
          className='bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group flex flex-col'
        >
          <div className='relative w-full aspect-square bg-gray-100'>
            <Image
              src={product.main_image}
              alt={product.name}
              fill
              className='object-cover group-hover:scale-105 transition-transform'
            />
          </div>

          <div className='p-3 flex flex-col flex-1'>
            <h3 className='text-base font-bold text-gray-800 line-clamp-2'>
              {product.name}
            </h3>

            <div>
              <div className='flex items-baseline gap-1 mb-1'>
                {product.price.min === product.price.max ? (
                  <p className='text-[#FF6B35] font-bold text-lg'>
                    {formatPrice(product.price.min)}
                  </p>
                ) : (
                  <>
                    <p className='text-[#FF6B35] font-bold text-lg'>
                      {formatPrice(product.price.min)}
                    </p>
                    <span className='text-xs text-gray-500'>-</span>
                    <p className='text-[#FF6B35] font-bold text-lg'>
                      {formatPrice(product.price.max)}
                    </p>
                  </>
                )}
              </div>

              <div className='flex items-center gap-1'>
                <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
                <span className='text-sm font-semibold text-gray-700'>
                  {product.ratingAvg > 0 ? product.ratingAvg.toFixed(1) : '0'}
                </span>
                <span className='text-xs text-gray-500 ml-1'>
                  ({product.buy_count} đã bán)
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
