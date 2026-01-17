'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '~/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { toast } from 'sonner'
import ProductTable from '~/components/products/ProductTable'
import ProductSearch from '~/components/products/ProductSearch'
import ProductPagination from '~/components/products/ProductPagination'
import {
  getShopProductsPaginatedAPI,
  hideProductAPI,
  unhideProductAPI,
} from '~/apiRequests/product.apiRequest'
import { ProductWithVariants, PaginationMeta } from '~/zodSchema/product.schema'
import { useBoundStore } from '~/zustand/store'

type TabType = 'active' | 'rejected' | 'pending' | 'hidden'

const TAB_CONFIG: Record<TabType, { label: string; approveStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED'; isActive?: boolean }> = {
  active: { label: 'Đang hoạt động', approveStatus: 'ACCEPTED', isActive: true },
  rejected: { label: 'Không được duyệt', approveStatus: 'REJECTED' },
  pending: { label: 'Chờ duyệt bởi Szone', approveStatus: 'PENDING' },
  hidden: { label: 'Đang bị ẩn', isActive: false },
}

const DEFAULT_LIMIT = 5

export default function ProductsPage() {
  const { shop } = useBoundStore()
  const [activeTab, setActiveTab] = useState<TabType>('active')
  const [products, setProducts] = useState<ProductWithVariants[]>([])
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: DEFAULT_LIMIT,
    totalPages: 0,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fetchProducts = useCallback(async () => {
    if (!shop?.id) return

    setIsLoading(true)
    try {
      const config = TAB_CONFIG[activeTab]
      const response = await getShopProductsPaginatedAPI({
        shopId: shop.id,
        page: meta.page,
        limit: meta.limit,
        search: searchQuery || undefined,
        approveStatus: config.approveStatus,
        isActive: config.isActive,
      })

      if (response) {
        setProducts(response.items)
        setMeta(response.meta)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast.error('Không thể tải danh sách sản phẩm')
    } finally {
      setIsLoading(false)
    }
  }, [shop?.id, activeTab, meta.page, meta.limit, searchQuery])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleTabChange = (value: string) => {
    setActiveTab(value as TabType)
    setMeta((prev) => ({ ...prev, page: 1 }))
    setSearchQuery('')
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setMeta((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setMeta((prev) => ({ ...prev, page }))
  }

  const handleHideProduct = async (productId: string) => {
    try {
      await hideProductAPI(productId)
      toast.success('Đã ẩn sản phẩm')
      fetchProducts()
    } catch (error) {
      console.error('Failed to hide product:', error)
      toast.error('Không thể ẩn sản phẩm')
    }
  }

  const handleUnhideProduct = async (productId: string) => {
    try {
      await unhideProductAPI(productId)
      toast.success('Đã hiển thị sản phẩm')
      fetchProducts()
    } catch (error) {
      console.error('Failed to unhide product:', error)
      toast.error('Không thể hiển thị sản phẩm')
    }
  }

  if (!shop) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Đang tải thông tin cửa hàng...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#004643]">Quản lý sản phẩm</h1>
        <Link href="/shop/products/new">
          <Button className="gap-2 bg-[#004643] hover:bg-[#004643]/90">
            <Plus className="size-4" />
            Thêm sản phẩm
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          {(Object.entries(TAB_CONFIG) as [TabType, typeof TAB_CONFIG[TabType]][]).map(
            ([key, config]) => (
              <TabsTrigger key={key} value={key} className="text-sm">
                {config.label}
              </TabsTrigger>
            )
          )}
        </TabsList>

        {(Object.keys(TAB_CONFIG) as TabType[]).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-6 space-y-4">
            {/* Search */}
            <div className="flex items-center justify-between gap-4">
              <ProductSearch onSearch={handleSearch} />
              <div className="text-sm text-muted-foreground">
                Tổng: {meta.total} sản phẩm
              </div>
            </div>

            {/* Table */}
            <ProductTable
              products={products}
              activeTab={activeTab}
              onHide={handleHideProduct}
              onUnhide={handleUnhideProduct}
              isLoading={isLoading}
            />

            {/* Pagination */}
            <div className="flex justify-center">
              <ProductPagination meta={meta} onPageChange={handlePageChange} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
