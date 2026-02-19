'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { searchAPI } from '~/apiRequests/search.apiRequest'
import { getShopVouchersAPI } from '~/apiRequests/voucher.apiRequest'
import { SearchResponse } from '~/zodSchema/search.schema'
import { Voucher } from '~/zodSchema/voucher.schema'
import ShopBanner from '~/components/shop/ShopBanner'
import ShopVouchersList from '~/components/shop/ShopVouchersList'
import ProductCard from '~/components/products/ProductCard'
import SearchPagination from '~/components/search/SearchPagination'
import { Loader2 } from 'lucide-react'

export default function ShopPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const shopId = params.shopId as string

  const [shopData, setShopData] = useState<SearchResponse | null>(null)
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [vouchersLoading, setVouchersLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get current page and search query from URL
  const currentPage = parseInt(searchParams.get('page') || '1')
  const searchQuery = searchParams.get('search') || ''

  // Fetch shop data and products
  const fetchShopData = useCallback(async () => {
    if (!shopId) return

    setLoading(true)
    setError(null)

    try {
      const response = await searchAPI({
        shopId,
        page: currentPage,
        limit: 20,
        search: searchQuery || undefined, // Chỉ truyền search nếu có
      })
      setShopData(response)
    } catch (err) {
      console.error('Error fetching shop data:', err)
      setError('Không thể tải thông tin shop. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }, [shopId, currentPage, searchQuery])

  // Fetch vouchers
  const fetchVouchers = useCallback(async () => {
    if (!shopId) return

    setVouchersLoading(true)

    try {
      const response = await getShopVouchersAPI(shopId)
      setVouchers(response)
    } catch (err) {
      console.error('Error fetching vouchers:', err)
      // Don't show error for vouchers, just set empty array
      setVouchers([])
    } finally {
      setVouchersLoading(false)
    }
  }, [shopId])

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchShopData()
  }, [fetchShopData])

  useEffect(() => {
    fetchVouchers()
  }, [fetchVouchers])

  // Handle page change
  const handlePageChange = (page: number) => {
    router.push(`/shop/${shopId}?page=${page}`)
  }

  // Get shop info from search results
  const shopInfo = shopData?.shops?.items?.[0]

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-400 mx-auto px-4 lg:px-6 py-6'>
        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <Loader2 className='w-10 h-10 text-[#004643] animate-spin' />
          </div>
        ) : error ? (
          <div className='text-center py-12'>
            <p className='text-red-500 text-lg'>{error}</p>
          </div>
        ) : !shopInfo ? (
          <div className='text-center py-12'>
            <p className='text-gray-500 text-lg'>Không tìm thấy shop</p>
          </div>
        ) : (
          <>
            {/* Phần 1: Shop Banner */}
            <ShopBanner
              shop={{
                id: shopInfo.id,
                name: shopInfo.name,
                description: shopInfo.description,
                logo: shopInfo.logo,
              }}
            />

            {/* Phần 2: Vouchers List */}
            {!vouchersLoading && <ShopVouchersList vouchers={vouchers} />}

            {/* Phần 3: Products */}
            <div>
              <h2 className='text-2xl font-bold text-gray-800 mb-4'>
                {searchQuery ? (
                  <>
                    Kết quả tìm kiếm cho: <span className='text-[#004643]'>&quot;{searchQuery}&quot;</span>
                  </>
                ) : (
                  'Sản Phẩm Của Shop'
                )}
              </h2>

              {shopData.products.items.length > 0 ? (
                <>
                  <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
                    {shopData.products.items.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {shopData.products.meta.totalPages > 1 && (
                    <div className='mt-6'>
                      <SearchPagination
                        currentPage={shopData.products.meta.page}
                        totalPages={shopData.products.meta.totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className='text-center py-12'>
                  <p className='text-gray-500 text-lg'>
                    Shop chưa có sản phẩm nào
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
