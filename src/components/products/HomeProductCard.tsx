'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { formatRating } from '~/lib/utils'
import { Badge } from '~/components/ui/badge'
import { SearchProduct } from '~/zodSchema/search.schema'

interface HomeProductCardProps {
  product: SearchProduct
}

export default function HomeProductCard({ product }: HomeProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1).replace('.0', '')}M+`
    if (count >= 1000) return `${(count / 1000).toFixed(1).replace('.0', '')}k+`
    return count.toString()
  }

  return (
    <Link
      href={`/product/${product.id}`}
      className='bg-white rounded-md shadow-sm border border-slate-200 hover:shadow-2xl hover:border-emerald-500/40 transition-all duration-300 overflow-hidden group flex flex-col h-full'
    >
      <div className='relative w-full aspect-square bg-gray-100'>
        <Image
          src={product.main_image}
          alt={product.name}
          fill
          className='object-cover group-hover:scale-105 transition-transform'
        />
        <Badge className='absolute left-2 top-2 bg-linear-to-r from-[#FF6B35] to-[#FF5722] text-white shadow-md'>
          Gợi ý
        </Badge>
      </div>

      <div className='p-2 flex flex-col flex-1'>
        <h3 className='text-sm font-semibold text-slate-900 line-clamp-2 mb-1 group-hover:text-emerald-700 transition-colors leading-snug'>
          {product.name}
        </h3>

        <div className='mt-auto pt-1'>
          <div className='flex items-center gap-2 mb-3'>
            <div className='flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-xl w-max'>
              <Star className='w-4 h-4 fill-amber-400 text-amber-400' />
              <span className='text-sm font-bold text-amber-700'>
                {formatRating(product.ratingAvg)}
              </span>
            </div>
            <span className='text-slate-300 text-sm'>•</span>
            <span className='text-xs font-medium text-slate-700'>
              Đã bán {formatCount(product.buy_count)}
            </span>
          </div>

          <div className='flex items-baseline gap-1 mt-1.5'>
            {product.price.min === product.price.max ? (
              <p className='text-emerald-700 font-bold text-base lg:text-lg tracking-tight'>
                {formatPrice(product.price.min)}
              </p>
            ) : (
              <div className='flex flex-wrap items-center gap-x-1'>
                <p className='text-emerald-700 font-bold text-base lg:text-lg tracking-tight'>
                  {formatPrice(product.price.min)}
                </p>
                <span className='text-slate-500 text-sm'>-</span>
                <p className='text-emerald-700 font-bold text-base lg:text-lg tracking-tight'>
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

