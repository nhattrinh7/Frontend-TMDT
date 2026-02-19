'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { SearchProduct } from '~/zodSchema/search.schema'

interface ProductCardProps {
  product: SearchProduct
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  return (
    <Link
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
        <h3 className='text-base font-semibold text-gray-800 line-clamp-2 mb-4'>
          {product.name}
        </h3>

        <div>
          {/* Rating and Buy Count */}
          <div className='flex items-center gap-1 mb-2'>
            <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
            <span className='text-sm font-semibold text-gray-700'>
              {product.ratingAvg > 0 ? product.ratingAvg.toFixed(1) : '0'}
            </span>
            <span className='text-sm text-gray-500 mx-1'>|</span>
            <span className='text-sm text-gray-500'>
              Đã bán {product.buy_count}
            </span>
          </div>

          {/* Price */}
          <div className='flex items-baseline gap-1'>
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
        </div>
      </div>
    </Link>
  )
}
