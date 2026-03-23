'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { getTodayRecommendationsAPI } from '~/apiRequests/product.apiRequest'
import HomeCategorySection from '~/components/home/HomeCategorySection'
import HomeProductCard from '~/components/products/HomeProductCard'
import { Skeleton } from '~/components/ui/skeleton'
import { RECOMMENDATION_LIMIT } from '~/constants/home.constants'
import type { SearchProduct } from '~/zodSchema/search.schema'

export default function HomePage() {
  const [recommendations, setRecommendations] = useState<SearchProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)
        const data = await getTodayRecommendationsAPI(RECOMMENDATION_LIMIT)
        setRecommendations(data.items.slice(0, RECOMMENDATION_LIMIT))
      } catch (error) {
        setRecommendations([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  return (
    <div className='min-h-screen bg-gray-50'>
      <HomeCategorySection />

      {/* Recommendations Section */}
      <section className='w-full py-12 md:py-16'>
        <div className='w-full max-w-400 mx-auto px-4 lg:px-6'>
          <div className='flex items-center justify-between mb-8'>
            <div className='flex items-center gap-3'>
              <div className='bg-linear-to-r from-[#FF6B35] to-[#FF5722] p-2 rounded-lg'>
                <Sparkles className='w-6 h-6 text-white' />
              </div>
              <div>
                <h2 className='text-xl md:text-2xl lg:text-3xl font-bold text-gray-800'>
                  Gợi Ý Hôm Nay
                </h2>
              </div>
            </div>
          </div>

          {loading ? (
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4'>
              {Array.from({ length: 10 }).map((_, index) => (
                <Skeleton key={index} className='h-[360px] w-full rounded-xl' />
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4'>
              {recommendations.map((product) => (
                <HomeProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className='py-16 text-center text-slate-500'>
              Chưa có sản phẩm
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
