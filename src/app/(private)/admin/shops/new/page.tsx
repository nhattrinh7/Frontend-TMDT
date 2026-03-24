'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import ShopTable from '~/app/(private)/admin/shops/new/ReviewShopTable'
import ShopSearch from '~/app/(private)/admin/shops/ShopSearch'
import ShopPagination from '~/app/(private)/admin/shops/ShopPagination'
import {
  getTopLevelCategoryIdsByRoleIdAPI,
  getShopsPaginatedAPI,
  approveShopAPI,
  rejectShopAPI,
} from '~/apiRequests/admin.apiRequest'
import { AdminShop, AdminPaginationMeta } from '~/zodSchema/admin.schema'
import { useBoundStore } from '~/zustand/store'

const DEFAULT_LIMIT = 5

export default function ApproveNewShopPage() {
  const user = useBoundStore((state) => state.user)
  
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [shops, setShops] = useState<AdminShop[]>([])
  const [meta, setMeta] = useState<AdminPaginationMeta>({
    total: 0,
    page: 1,
    limit: DEFAULT_LIMIT,
    totalPages: 0,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isApproving, setIsApproving] = useState<string | undefined>(undefined)
  const [isRejecting, setIsRejecting] = useState<string | undefined>(undefined)

  // Fetch category IDs on mount
  useEffect(() => {
    const fetchCategoryIds = async () => {
      if (!user?.roleId) return

      try {
        const data = await getTopLevelCategoryIdsByRoleIdAPI(user.roleId)
        if (data) {
          setCategoryIds(data)
        }
      } catch {
        toast.error('Không thể tải danh sách danh mục')
      } finally {
        setIsInitializing(false)
      }
    }

    fetchCategoryIds()
  }, [user?.roleId])

  // Fetch shops when categoryIds are available
  const fetchShops = useCallback(async () => {
    if (categoryIds.length === 0) return

    setIsLoading(true)
    try {
      const response = await getShopsPaginatedAPI({
        page: meta.page,
        limit: meta.limit,
        status: 'UNDER_REVIEW',
        search: searchQuery || undefined,
        categoryIds,
      })

      if (response) {
        setShops(response.shops)
        setMeta(response.meta)
      }
    } catch {
      toast.error('Không thể tải danh sách shop')
    } finally {
      setIsLoading(false)
    }
  }, [meta.page, meta.limit, searchQuery, categoryIds])

  useEffect(() => {
    if (categoryIds.length > 0) {
      fetchShops()
    }
  }, [fetchShops, categoryIds])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setMeta((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setMeta((prev) => ({ ...prev, page }))
  }

  const handleApprove = async (shopId: string) => {
    setIsApproving(shopId)
    try {
      await approveShopAPI(shopId)
      toast.success('Đã duyệt shop thành công')
      fetchShops()
    } catch {
      toast.error('Không thể duyệt shop')
    } finally {
      setIsApproving(undefined)
    }
  }

  const handleReject = async (shopId: string, reason: string) => {
    setIsRejecting(shopId)
    try {
      await rejectShopAPI(shopId, reason)
      toast.success('Đã từ chối shop thành công')
      fetchShops()
    } catch {
      toast.error('Không thể từ chối shop')
    } finally {
      setIsRejecting(undefined)
    }
  }

  if (isInitializing) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Đang khởi tạo...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#004643]">Duyệt Shop Mới</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Xét duyệt các shop đang chờ được phê duyệt hoạt động
          </p>
        </div>
      </div>

      {/* Search & Stats */}
      <div className="flex items-center justify-between gap-4">
        <ShopSearch onSearch={handleSearch} placeholder="Tìm kiếm theo tên shop..." />
        <div className="text-sm text-muted-foreground">
          Tổng: <span className="font-semibold text-[#004643]">{meta.total}</span> shop chờ duyệt
        </div>
      </div>

      {/* Table */}
      <ShopTable
        shops={shops}
        onApprove={handleApprove}
        onReject={handleReject}
        isLoading={isLoading}
        isApproving={isApproving}
        isRejecting={isRejecting}
      />

      {/* Pagination */}
      <div className="flex justify-center">
        <ShopPagination meta={meta} onPageChange={handlePageChange} />
      </div>
    </div>
  )
}