'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import PendingProductTable from '~/app/(private)/admin/products/new/ReviewProductTable'
import ProductSearch from '~/app/(private)/admin/products/ProductSearch'
import ProductPagination from '~/app/(private)/admin/products/ProductPagination'
import {
  getProductsPaginatedAPI,
  approveProductAPI,
  rejectProductAPI,
} from '~/apiRequests/product.apiRequest'
import { AdminProduct, PaginationMeta } from '~/zodSchema/product.schema'

const DEFAULT_LIMIT = 10

export default function ApproveNewProductPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: DEFAULT_LIMIT,
    totalPages: 0,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [actioningProductId, setActioningProductId] = useState<string | undefined>()

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await getProductsPaginatedAPI({
        page: meta.page,
        limit: meta.limit,
        search: searchQuery || undefined,
        approveStatus: 'PENDING',
      })

      if (response) {
        setProducts(response.products)
        setMeta(response.meta)
      }
    } catch {
      toast.error('Không thể tải danh sách sản phẩm')
    } finally {
      setIsLoading(false)
    }
  }, [meta.page, meta.limit, searchQuery])

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setMeta((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setMeta((prev) => ({ ...prev, page }))
  }

  const handleApprove = async (productId: string) => {
    setActioningProductId(productId)
    try {
      const response = await approveProductAPI(productId)
      toast.success(response?.message || 'Duyệt sản phẩm thành công')
      fetchProducts()
    } catch {
      toast.error('Không thể duyệt sản phẩm')
    } finally {
      setActioningProductId(undefined)
    }
  }

  const handleReject = async (productId: string, rejectReason: string) => {
    setActioningProductId(productId)
    try {
      const response = await rejectProductAPI(productId, rejectReason)
      toast.success(response?.message || 'Đã từ chối sản phẩm')
      fetchProducts()
    } catch {
      toast.error('Không thể từ chối sản phẩm')
    } finally {
      setActioningProductId(undefined)
    }
  }

  return (
    <div className='flex flex-col gap-6 p-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-[#004643]'>Duyệt sản phẩm mới</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Xem xét và duyệt các sản phẩm mới từ người bán trên hệ thống
        </p>
      </div>

      {/* Search & Stats */}
      <div className='flex items-center justify-between gap-4'>
        <ProductSearch
          onSearch={handleSearch}
          placeholder='Tìm kiếm sản phẩm...'
        />
        <div className='text-sm text-muted-foreground'>
          Tổng:{' '}
          <span className='font-semibold text-[#004643]'>
            {meta.total}
          </span>{' '}
          sản phẩm cần duyệt
        </div>
      </div>

      {/* Table */}
      <PendingProductTable
        products={products}
        onApprove={handleApprove}
        onReject={handleReject}
        isLoading={isLoading}
        actioningProductId={actioningProductId}
      />

      {/* Pagination */}
      <div className='flex justify-center'>
        <ProductPagination
          meta={meta}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}