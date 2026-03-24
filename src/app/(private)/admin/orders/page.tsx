'use client'

import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'
import { Search } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Input } from '~/components/ui/input'
import { toast } from 'sonner'
import {
  getAdminOrdersPaginatedAPI,
  type AdminOrder,
  type OffsetMeta,
} from '~/apiRequests/order.apiRequest'
import AdminOrderTable, { type AdminOrderStatus } from '~/app/(private)/admin/orders/AdminOrderTable'
import AdminOrderPagination from '~/app/(private)/admin/orders/AdminOrderPagination'

const DEFAULT_LIMIT = 10

type TabState = {
  orders: AdminOrder[]
  meta: OffsetMeta
  searchQuery: string
  isLoading: boolean
}

const initialMeta: OffsetMeta = {
  page: 1,
  limit: DEFAULT_LIMIT,
  totalPages: 0,
  totalItems: 0,
}

const initialTabState: TabState = {
  orders: [],
  meta: { ...initialMeta },
  searchQuery: '',
  isLoading: false,
}

const tabs: { value: AdminOrderStatus; label: string }[] = [
  { value: 'AWAITING_CONFIRMATION', label: 'Chờ xác nhận' },
  { value: 'PREPARING', label: 'Chờ lấy hàng' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'DELIVERY_COMPLETED', label: 'Giao thành công' },
  { value: 'DELIVERY_FAILED', label: 'Giao thất bại' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'RETURNED', label: 'Trả hàng/Hoàn tiền' },
]

export default function ManageOrdersPage() {
  const [activeTab, setActiveTab] = useState<AdminOrderStatus>('AWAITING_CONFIRMATION')

  const [tabStates, setTabStates] = useState<Record<AdminOrderStatus, TabState>>({
    AWAITING_CONFIRMATION: { ...initialTabState },
    PREPARING: { ...initialTabState },
    SHIPPING: { ...initialTabState },
    DELIVERY_COMPLETED: { ...initialTabState },
    DELIVERY_FAILED: { ...initialTabState },
    CANCELLED: { ...initialTabState },
    RETURNED: { ...initialTabState },
  })

  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearch] = useDebounce(searchValue, 500)

  const buildQueryParams = (status: AdminOrderStatus) => {
    if (status === 'RETURNED') {
      return { status: 'DELIVERY_COMPLETED', returnStatus: 'REFUNDED' }
    }
    return { status }
  }

  const filterReturnedOrders = (items: AdminOrder[], status: AdminOrderStatus) => {
    if (status !== 'RETURNED') return items
    return items
      .map((order) => ({
        ...order,
        orderItems: order.orderItems.filter((item) => item.returnStatus === 'REFUNDED'),
      }))
      .filter((order) => order.orderItems.length > 0)
  }

  useEffect(() => {
    setSearchValue(tabStates[activeTab].searchQuery)
  }, [activeTab])

  useEffect(() => {
    setTabStates((prev) => {
      const current = prev[activeTab]
      if (current.searchQuery === debouncedSearch) return prev

      return {
        ...prev,
        [activeTab]: {
          ...current,
          searchQuery: debouncedSearch,
          meta: { ...current.meta, page: 1 },
        },
      }
    })
  }, [debouncedSearch])

  useEffect(() => {
    const currentState = tabStates[activeTab]

    const fetchOrders = async () => {
      setTabStates((prev) => ({
        ...prev,
        [activeTab]: { ...prev[activeTab], isLoading: true },
      }))

      try {
        const res = await getAdminOrdersPaginatedAPI({
          ...buildQueryParams(activeTab),
          page: currentState.meta.page,
          limit: currentState.meta.limit,
          search: currentState.searchQuery || undefined,
        })

        if (res?.data) {
          const filteredOrders = filterReturnedOrders(res.data.items, activeTab)
          setTabStates((prev) => ({
            ...prev,
            [activeTab]: {
              ...prev[activeTab],
              orders: filteredOrders,
              meta: res.data.meta,
            },
          }))
        }
      } catch (error) {
        console.error(error)
        toast.error('Không thể tải danh sách đơn hàng')
      } finally {
        setTabStates((prev) => ({
          ...prev,
          [activeTab]: { ...prev[activeTab], isLoading: false },
        }))
      }
    }

    fetchOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, tabStates[activeTab].meta.page, tabStates[activeTab].searchQuery])

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
    <div className='flex flex-col gap-6 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-[#004643]'>Quản lý đơn hàng</h1>
          <p className='text-sm text-muted-foreground mt-1'>Theo dõi và xử lý đơn hàng theo từng trạng thái</p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as AdminOrderStatus)}
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7'>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className='text-xs md:text-sm'>
              {tab.label}
              {tabStates[tab.value].meta.totalItems > 0 && (
                <span className='ml-2 text-xs bg-muted px-1.5 py-0.5 rounded'>
                  {tabStates[tab.value].meta.totalItems}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          tab.value === activeTab ? (
            <TabsContent key={tab.value} value={tab.value} className='space-y-4 pt-4'>
              <div className='flex flex-wrap items-center justify-between gap-4'>
                <div className='relative w-full max-w-sm'>
                  <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
                  <Input
                    type='text'
                    placeholder='Tìm kiếm theo mã đơn hàng hoặc tên sản phẩm...'
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className='pl-10'
                  />
                </div>
                {tabStates[tab.value].meta.totalItems > 0 && (
                  <div className='text-sm text-muted-foreground'>
                    Tổng: <span className='font-semibold text-[#004643]'>{tabStates[tab.value].meta.totalItems}</span> đơn hàng
                  </div>
                )}
              </div>

              <AdminOrderTable
                orders={tabStates[tab.value].orders}
                status={tab.value}
                isLoading={tabStates[tab.value].isLoading}
              />

              <div className='flex justify-center'>
                <AdminOrderPagination
                  meta={tabStates[tab.value].meta}
                  onPageChange={handlePageChange}
                />
              </div>
            </TabsContent>
          ) : null
        ))}
      </Tabs>
    </div>
  )
}
