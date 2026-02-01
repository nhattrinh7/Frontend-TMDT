'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { searchAPI } from '~/apiRequests/search.apiRequest'
import { SearchShop } from '~/zodSchema/search.schema'
import SearchPagination from '~/components/search/SearchPagination'
import { Loader2 } from 'lucide-react'

export default function ShopsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [shops, setShops] = useState<SearchShop[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchQuery = searchParams.get('search') || ''

  // Fetch shops
  const fetchShops = useCallback(async (page: number) => {
    if (!searchQuery) return

    setLoading(true)
    setError(null)

    try {
      const response = await searchAPI({
        search: searchQuery,
        page,
        limit: 20, // 20 shops per page
      })

      setShops(response.shops.items)
      setCurrentPage(response.shops.meta.page)
      setTotalPages(response.shops.meta.totalPages)
    } catch (err) {
      console.error('Fetch shops error:', err)
      setError('Có lỗi xảy ra khi tải danh sách cửa hàng')
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  // Fetch on mount and when page changes
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1')
    fetchShops(page)
  }, [searchParams, fetchShops])

  // Handle page change
  const handlePageChange = (page: number) => {
    router.push(`/search/shops?search=${encodeURIComponent(searchQuery)}&page=${page}`)
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-400 mx-auto px-4 lg:px-6 py-6'>
        {/* Header */}
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-gray-800'>
            Cửa hàng cho: <span className='text-[#004643]'>&quot;{searchQuery}&quot;</span>
          </h1>
        </div>

        {/* Content */}
        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <Loader2 className='w-10 h-10 text-[#004643] animate-spin' />
          </div>
        ) : error ? (
          <div className='text-center py-12'>
            <p className='text-red-500 text-lg'>{error}</p>
          </div>
        ) : shops.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-gray-500 text-lg'>Không tìm thấy cửa hàng nào</p>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
              {shops.map((shop) => (
                <Link
                  key={shop.id}
                  href={`/shop/${shop.id}`}
                  className='bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group'
                >
                  <div className='relative w-full aspect-square bg-gray-100'>
                    <Image
                      src={shop.logo}
                      alt={shop.name}
                      fill
                      className='object-cover group-hover:scale-105 transition-transform'
                    />
                  </div>
                  <div className='p-4'>
                    <h3 className='font-semibold text-base text-gray-800 line-clamp-1 mb-2'>
                      {shop.name}
                    </h3>
                    <p className='text-sm text-gray-600 line-clamp-2'>
                      {shop.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <SearchPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  )
}
