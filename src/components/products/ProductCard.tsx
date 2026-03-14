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
      className='bg-white rounded-4xl shadow-sm border border-slate-200 hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300 overflow-hidden group flex flex-col h-full'
    >
      <div className='relative w-full aspect-square bg-gray-100'>
        <Image
          src={product.main_image}
          alt={product.name}
          fill
          className='object-cover group-hover:scale-105 transition-transform'
        />
      </div>

      <div className='p-4 lg:p-5 flex flex-col flex-1'>
        <h3 className='text-lg font-bold text-slate-800 line-clamp-2 mb-2 group-hover:text-emerald-700 transition-colors leading-snug'>
          {product.name}
        </h3>

        <div className='mt-auto pt-3'>
          {/* Rating and Buy Count */}
          <div className='flex items-center gap-2 mb-3'>
            <div className='flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-xl w-max'>
              <Star className='w-4 h-4 fill-amber-400 text-amber-400' />
              <span className='text-sm font-bold text-amber-700'>
                {product.ratingAvg > 0 ? product.ratingAvg.toFixed(1) : '0.0'}
              </span>
            </div>
            <span className='text-slate-300 text-sm'>•</span>
            <span className='text-sm font-medium text-slate-500'>
              Đã bán {product.buy_count}
            </span>
          </div>

          {/* Price */}
          <div className='flex items-baseline gap-2'>
            {product.price.min === product.price.max ? (
              <p className='text-emerald-600 font-semibold text-xl lg:text-2xl tracking-tight'>
                {formatPrice(product.price.min)}
              </p>
            ) : (
              <div className='flex flex-wrap items-center gap-x-2'>
                <p className='text-emerald-600 font-semibold text-xl lg:text-2xl tracking-tight'>
                  {formatPrice(product.price.min)}
                </p>
                <span className='text-slate-400 text-base'>-</span>
                <p className='text-emerald-600 font-semibold text-xl lg:text-2xl tracking-tight'>
                  {formatPrice(product.price.max)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
