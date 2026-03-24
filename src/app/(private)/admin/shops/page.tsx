'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import ManageShopTable from '~/app/(private)/admin/shops/ManageShopTable'
import ShopSearch from '~/app/(private)/admin/shops/ShopSearch'
import ShopPagination from '~/app/(private)/admin/shops/ShopPagination'
import {
  getTopLevelCategoryIdsByRoleIdAPI,
  getShopsPaginatedAPI,
  banShopAPI,
  unbanShopAPI,
} from '~/apiRequests/admin.apiRequest'
import { AdminShop, AdminPaginationMeta } from '~/zodSchema/admin.schema'
import { useBoundStore } from '~/zustand/store'

const DEFAULT_LIMIT = 5

type ShopStatus = 'ACTIVE' | 'CLOSED' | 'BANNED' | 'REJECTED'

type TabState = {
  shops: AdminShop[]
  meta: AdminPaginationMeta
  searchQuery: string
  isLoading: boolean
}

const initialTabState: TabState = {
  shops: [],
  meta: { total: 0, page: 1, limit: DEFAULT_LIMIT, totalPages: 0 },
  searchQuery: '',
  isLoading: false,
}

const tabs: { value: ShopStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Đang hoạt động' },
  { value: 'CLOSED', label: 'Đã đóng cửa' },
  { value: 'BANNED', label: 'Đã bị ban' },
  { value: 'REJECTED', label: 'Đã từ chối' },
]

export default function ManageShopsPage() {
  const user = useBoundStore((state) => state.user)

  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [isInitializing, setIsInitializing] = useState(true)
  const [activeTab, setActiveTab] = useState<ShopStatus>('ACTIVE')
  const [actioningShopId, setActioningShopId] = useState<string | undefined>()

  // State cho từng tab
  const [tabStates, setTabStates] = useState<Record<ShopStatus, TabState>>({
    ACTIVE: { ...initialTabState },
    CLOSED: { ...initialTabState },
    BANNED: { ...initialTabState },
    REJECTED: { ...initialTabState },
  })

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

  // Fetch shops for a specific status
  const fetchShops = useCallback(
    async (status: ShopStatus) => {
      if (categoryIds.length === 0) return

      setTabStates((prev) => ({
        ...prev,
        [status]: { ...prev[status], isLoading: true },
      }))

      try {
        const currentState = tabStates[status]
        const response = await getShopsPaginatedAPI({
          page: currentState.meta.page,
          limit: currentState.meta.limit,
          status,
          search: currentState.searchQuery || undefined,
          categoryIds,
        })

        if (response) {
          setTabStates((prev) => ({
            ...prev,
            [status]: {
              ...prev[status],
              shops: response.shops,
              meta: response.meta,
              isLoading: false,
            },
          }))
        }
      } catch {
        toast.error('Không thể tải danh sách shop')
        setTabStates((prev) => ({
          ...prev,
          [status]: { ...prev[status], isLoading: false },
        }))
      }
    },
    [categoryIds, tabStates]
  )

  // Fetch shops when tab changes or categoryIds changes
  useEffect(() => {
    if (categoryIds.length > 0) {
      fetchShops(activeTab)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryIds, activeTab, tabStates[activeTab].meta.page, tabStates[activeTab].searchQuery])

  const handleSearch = (query: string) => {
    setTabStates((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        searchQuery: query,
        meta: { ...prev[activeTab].meta, page: 1 },
      },
    }))
  }

  const handlePageChange = (page: number) => {
    setTabStates((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        meta: { ...prev[activeTab].meta, page },
      },
    }))
  }

  const handleBan = async (shopId: string) => {
    setActioningShopId(shopId)
    try {
      const response = await banShopAPI(shopId)
      toast.success(response?.message || 'Đã ban shop thành công')
      // Refresh cả tab ACTIVE và BANNED
      fetchShops('ACTIVE')
      fetchShops('BANNED')
    } catch {
      toast.error('Không thể ban shop')
    } finally {
      setActioningShopId(undefined)
    }
  }

  const handleUnban = async (shopId: string) => {
    setActioningShopId(shopId)
    try {
      const response = await unbanShopAPI(shopId)
      toast.success(response?.message || 'Đã unban shop thành công')
      // Refresh cả tab ACTIVE và BANNED
      fetchShops('ACTIVE')
      fetchShops('BANNED')
    } catch {
      toast.error('Không thể unban shop')
    } finally {
      setActioningShopId(undefined)
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
      <div>
        <h1 className="text-2xl font-bold text-[#004643]">Quản lý Shop</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Quản lý tất cả các shop trên hệ thống
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ShopStatus)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
              <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">
                {tabStates[tab.value].meta.total}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            {/* Search & Stats */}
            <div className="flex items-center justify-between gap-4">
              <ShopSearch
                onSearch={handleSearch}
                placeholder={`Tìm kiếm shop ${tab.label.toLowerCase()}...`}
              />
              <div className="text-sm text-muted-foreground">
                Tổng:{' '}
                <span className="font-semibold text-[#004643]">
                  {tabStates[tab.value].meta.total}
                </span>{' '}
                shop
              </div>
            </div>

            {/* Table */}
            <ManageShopTable
              shops={tabStates[tab.value].shops}
              status={tab.value}
              onBan={tab.value === 'ACTIVE' ? handleBan : undefined}
              onUnban={tab.value === 'BANNED' ? handleUnban : undefined}
              isLoading={tabStates[tab.value].isLoading}
              actioningShopId={actioningShopId}
            />

            {/* Pagination */}
            <div className="flex justify-center">
              <ShopPagination
                meta={tabStates[tab.value].meta}
                onPageChange={handlePageChange}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}