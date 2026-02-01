'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { searchAPI } from '~/apiRequests/search.apiRequest'
import { SearchResponse } from '~/zodSchema/search.schema'
import SearchSidebar from '~/components/search/SearchSidebar'
import ShopResults from '~/components/search/ShopResults'
import ProductResults from '~/components/search/ProductResults'
import SearchPagination from '~/components/search/SearchPagination'
import { Loader2 } from 'lucide-react'

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get current filters from URL
  const getCurrentFilters = useCallback(() => {
    return {
      search: searchParams.get('search') || '',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
      sort: (searchParams.get('sort') as 'asc' | 'desc' | undefined) || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
    }
  }, [searchParams])

  // Update URL with new filters
  const updateURL = useCallback((filters: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.set(key, value.toString())
      }
    })

    router.push(`/search?${params.toString()}`)
  }, [router])

  // Fetch search results
  const fetchSearchResults = useCallback(async () => {
    const filters = getCurrentFilters()
    
    if (!filters.search) {
      setError('Vui lòng nhập từ khóa tìm kiếm')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await searchAPI(filters)
      setSearchResults(response)
    } catch (err) {
      console.error('Search error:', err)
      setError('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [getCurrentFilters])

  // Fetch on mount and when search params change
  useEffect(() => {
    fetchSearchResults()
  }, [fetchSearchResults])

  // Handle filter change
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
      page: '1', // Reset to page 1 when filters change
    })
  }

  // Handle page change
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
      <div className='max-w-400 mx-auto px-4 lg:px-6 py-6'>
        {/* Search Query Display */}
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-gray-800'>
            Kết quả tìm kiếm cho: <span className='text-[#004643]'>&quot;{currentFilters.search}&quot;</span>
          </h1>
          {searchResults && (
            <p className='text-sm text-gray-600 mt-2'>
              Tìm thấy {searchResults.products.meta.total} sản phẩm và {searchResults.shops.meta.total} cửa hàng
            </p>
          )}
        </div>

        <div className='flex gap-6'>
          {/* Sidebar */}
          <SearchSidebar
            currentFilters={{
              sort: currentFilters.sort,
              minPrice: currentFilters.minPrice,
              maxPrice: currentFilters.maxPrice,
              minRating: currentFilters.minRating,
            }}
            onFilterChange={handleFilterChange}
          />

          {/* Main Content */}
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
                {/* Shop Results */}
                <ShopResults 
                  shops={searchResults.shops.items} 
                  searchQuery={currentFilters.search}
                />

                {/* Product Results */}
                <div>
                  <h2 className='text-xl font-bold text-gray-800 mb-4'>Sản phẩm</h2>
                  <ProductResults products={searchResults.products.items} />

                  {/* Pagination */}
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
