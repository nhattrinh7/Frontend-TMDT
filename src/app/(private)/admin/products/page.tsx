'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import ManageProductTable from '~/components/admin/ManageProductTable'
import ProductSearch from '~/components/admin/ProductSearch'
import ProductPagination from '~/components/admin/ProductPagination'
import { getProductsPaginatedAPI } from '~/apiRequests/product.apiRequest'
import { AdminProduct, PaginationMeta } from '~/zodSchema/product.schema'

const DEFAULT_LIMIT = 5

type ProductStatusTab = 'ACCEPTED' | 'REJECTED'

type TabState = {
  products: AdminProduct[]
  meta: PaginationMeta
  searchQuery: string
  isLoading: boolean
}

const initialTabState: TabState = {
  products: [],
  meta: { total: 0, page: 1, limit: DEFAULT_LIMIT, totalPages: 0 },
  searchQuery: '',
  isLoading: false,
}

const tabs: { value: ProductStatusTab; label: string }[] = [
  { value: 'ACCEPTED', label: 'Đang hoạt động' },
  { value: 'REJECTED', label: 'Đã từ chối duyệt' },
]

export default function ManageProductsPage() {
  const [activeTab, setActiveTab] = useState<ProductStatusTab>('ACCEPTED')

  // State cho từng tab
  const [tabStates, setTabStates] = useState<Record<ProductStatusTab, TabState>>({
    ACCEPTED: { ...initialTabState },
    REJECTED: { ...initialTabState },
  })

  // Fetch products when tab or pagination changes
  useEffect(() => {
    const currentState = tabStates[activeTab]
    
    const fetchData = async () => {
      setTabStates(prev => ({
        ...prev,
        [activeTab]: { ...prev[activeTab], isLoading: true }
      }))

      try {
        const response = await getProductsPaginatedAPI({
          page: currentState.meta.page,
          limit: currentState.meta.limit,
          approveStatus: activeTab,
          search: currentState.searchQuery || undefined,
        })
        
        // response is AdminProductsPaginatedResponse which has { products, meta }
        if (response && response.products) {
          setTabStates(prev => ({
            ...prev,
            [activeTab]: {
              ...prev[activeTab],
              products: response.products,
              meta: response.meta,
            }
          }))
        }
      } catch (error) {
        console.error(error)
        toast.error('Có lỗi xảy ra khi tải dữ liệu')
      } finally {
        setTabStates(prev => ({
          ...prev,
          [activeTab]: { ...prev[activeTab], isLoading: false }
        }))
      }
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, tabStates[activeTab].meta.page, tabStates[activeTab].searchQuery])


  const handleSearch = (query: string) => {
    setTabStates((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        searchQuery: query,
        meta: { ...prev[activeTab].meta, page: 1 }, // Reset to page 1 on search
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

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#004643]">Quản lý sản phẩm</h1>
          <p className="text-sm text-muted-foreground mt-1">Danh sách các sản phẩm đang hoạt động và bị từ chối</p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ProductStatusTab)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
              {/* Optional: Show count if available, but tricky because we only have count for current tab often-times unless we pre-fetch.
                  For now, we can show count if we have it loaded.
               */}
              {tabStates[tab.value].products.length > 0 && (
                <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">
                  {tabStates[tab.value].meta.total}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4 pt-4">
            <div className="flex items-center justify-between gap-4">
              <ProductSearch
                onSearch={handleSearch}
                placeholder={`Tìm kiếm sản phẩm ${tab.label.toLowerCase()}...`}
              />
              {tabStates[tab.value].meta.total > 0 && (
                <div className="text-sm text-muted-foreground">
                    Tổng: <span className="font-semibold text-[#004643]">{tabStates[tab.value].meta.total}</span> sản phẩm
                </div>
              )}
            </div>

            <ManageProductTable
              products={tabStates[tab.value].products}
              isLoading={tabStates[tab.value].isLoading}
            />

            <div className="flex justify-center">
              <ProductPagination
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