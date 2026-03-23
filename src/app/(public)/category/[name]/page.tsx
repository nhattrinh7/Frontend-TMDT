'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { getRootCategoryProductsAPI } from '~/apiRequests/search.apiRequest'
import { RootCategoryProductsResponse } from '~/zodSchema/search.schema'
import SearchSidebar from '~/components/search/SearchSidebar'
import ProductResults from '~/components/search/ProductResults'
import SearchPagination from '~/components/search/SearchPagination'

function RootCategoryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams<{ name: string }>()

  const rawName = Array.isArray(params.name) ? params.name[0] : params.name || ''
  const rootCategoryName = decodeURIComponent(rawName)

  const [searchResults, setSearchResults] = useState<RootCategoryProductsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCurrentFilters = useCallback(() => {
    return {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '40'),
      sort: (searchParams.get('sort') as 'asc' | 'desc' | undefined) || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
    }
  }, [searchParams])

  const updateURL = useCallback((filters: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, value.toString())
      }
    })

    router.push(`/category/${encodeURIComponent(rootCategoryName)}?${params.toString()}`)
  }, [router, rootCategoryName])

  const fetchProducts = useCallback(async () => {
    if (!rootCategoryName) {
      setError('Không xác định được ngành hàng')
      return
    }

    const filters = getCurrentFilters()
    setLoading(true)
    setError(null)

    try {
      const response = await getRootCategoryProductsAPI({
        rootCategory: rootCategoryName,
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minRating: filters.minRating,
      })
      setSearchResults(response)
    } catch (err) {
      console.error('Root category search error:', err)
      setError('Có lỗi xảy ra khi tải sản phẩm. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [getCurrentFilters, rootCategoryName])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleFilterChange = (newFilters: {
    sort?: 'asc' | 'desc'
    minPrice?: number
    maxPrice?: number
    minRating?: number
  }) => {
    const currentFilters = getCurrentFilters()
    updateURL({
      ...currentFilters,
      ...newFilters,
      page: '1',
    })
  }

  const handlePageChange = (page: number) => {
    const currentFilters = getCurrentFilters()
    updateURL({
      ...currentFilters,
      page,
    })
  }

  const currentFilters = getCurrentFilters()

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-400 mx-auto px-4 lg:px-6 py-4 lg:py-6'>
        <div className='mb-6'>
          <h1 className='text-lg lg:text-xl font-bold text-gray-800 tracking-tight'>
            Ngành hàng: <span className='text-[#004643]'>&quot;{rootCategoryName}&quot;</span>
          </h1>
          {searchResults && (
            <p className='text-lg text-gray-600 mt-4'>
              Tìm thấy <span className='font-semibold text-gray-900'>{searchResults.products.meta.total}</span> sản phẩm
            </p>
          )}
        </div>

        <div className='flex flex-col lg:flex-row gap-4 lg:gap-6'>
          <div className='w-full lg:w-52 xl:w-60 shrink-0'>
            <SearchSidebar
              currentFilters={{
                sort: currentFilters.sort,
                minPrice: currentFilters.minPrice,
                maxPrice: currentFilters.maxPrice,
                minRating: currentFilters.minRating,
              }}
              onFilterChange={handleFilterChange}
            />
          </div>

          <div className='flex-1 min-w-0'>
            {loading ? (
              <div className='flex items-center justify-center py-20'>
                <Loader2 className='w-10 h-10 text-[#004643] animate-spin' />
              </div>
            ) : error ? (
              <div className='text-center py-12'>
                <p className='text-red-500 text-lg'>{error}</p>
              </div>
            ) : searchResults ? (
              <>
                <div className='mt-2'>
                  <ProductResults products={searchResults.products.items} />

                  <SearchPagination
                    currentPage={searchResults.products.meta.page}
                    totalPages={searchResults.products.meta.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RootCategoryPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-gray-50 flex items-center justify-center py-20'>
          <Loader2 className='w-10 h-10 text-[#004643] animate-spin' />
        </div>
      }
    >
      <RootCategoryContent />
    </Suspense>
  )
}
