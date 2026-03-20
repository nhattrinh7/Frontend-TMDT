'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { Calendar } from '~/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { getShopByOwnerIdAPI } from '~/apiRequests/shop.apiRequest'
import { getShopSettlementsAPI, type SettlementStatus } from '~/apiRequests/settlement.apiRequest'
import { getWalletBalanceAPI } from '~/apiRequests/wallet.apiRequest'
import type { Settlement } from '~/zodSchema/settlement.schema'
import type { OffsetMeta } from '~/apiRequests/order.apiRequest'
import { cn, formatPrice } from '~/lib/utils'
import { useBoundStore } from '~/zustand/store'
import { toast } from 'sonner'

const formatDateInput = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseDateInput = (value: string) => {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? undefined : date
}

const getStartOfWeek = (date: Date) => {
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const start = new Date(date)
  start.setDate(date.getDate() + diff)
  start.setHours(0, 0, 0, 0)
  return start
}

const formatDateTime = (value: string | null) => {
  if (!value) return 'Chưa thanh toán'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Chưa thanh toán'
  return date.toLocaleString('vi-VN')
}

const getDefaultRange = () => {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  return {
    startDate: formatDateInput(startOfMonth),
    endDate: formatDateInput(today),
  }
}

const getThisWeekRange = () => {
  const today = new Date()
  return {
    startDate: formatDateInput(getStartOfWeek(today)),
    endDate: formatDateInput(today),
  }
}

const getThisMonthRange = () => {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  return {
    startDate: formatDateInput(startOfMonth),
    endDate: formatDateInput(today),
  }
}

interface DatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
}

const DatePicker = ({
  value,
  onChange,
  placeholder = 'Chọn ngày',
}: DatePickerProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        type='button'
        variant='outline'
        className={cn(
          'w-[170px] justify-start text-left font-normal border-[#004643]/20 bg-white text-gray-900',
          !value && 'text-muted-foreground',
        )}
      >
        <CalendarIcon className='mr-2 h-4 w-4' />
        {value ? format(value, 'dd/MM/yyyy', { locale: vi }) : placeholder}
      </Button>
    </PopoverTrigger>
    <PopoverContent className='w-auto p-0 bg-white' align='start'>
      <Calendar
        mode='single'
        selected={value}
        onSelect={onChange}
        initialFocus
      />
    </PopoverContent>
  </Popover>
)

export default function RevenuePage() {
  const shop = useBoundStore((state) => state.shop)
  const setShop = useBoundStore((state) => state.setShop)

  const [activeTab, setActiveTab] = useState<SettlementStatus>('PENDING')
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(5)
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [meta, setMeta] = useState<OffsetMeta | null>(null)
  const [totalPayout, setTotalPayout] = useState(0)
  const [loading, setLoading] = useState(true)
  const [walletBalance, setWalletBalance] = useState(0)
  const [walletLoading, setWalletLoading] = useState(true)

  const initialRange = useMemo(() => getDefaultRange(), [])
  const [dateInput, setDateInput] = useState(initialRange)
  const [dateRange, setDateRange] = useState(initialRange)

  const shopId = shop?.id

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const shopInfo = await getShopByOwnerIdAPI()
        setShop(shopInfo)
      } catch {
        toast.error('Không thể tải thông tin shop')
      }
    }

    if (!shopId) fetchShopInfo()
  }, [shopId, setShop])

  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        setWalletLoading(true)
        const wallet = await getWalletBalanceAPI()
        setWalletBalance(wallet.balance)
      } catch {
        toast.error('Không thể tải số dư ví')
      } finally {
        setWalletLoading(false)
      }
    }

    fetchWalletBalance()
  }, [])

  const fetchSettlements = useCallback(async () => {
    if (!shopId) return

    try {
      setLoading(true)
      const data = await getShopSettlementsAPI(shopId, {
        status: activeTab,
        page: currentPage,
        limit,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })

      setSettlements(data.items)
      setMeta(data.meta)
      setTotalPayout(data.totalPayout)
    } catch {
      toast.error('Không thể tải dữ liệu đối soát')
    } finally {
      setLoading(false)
    }
  }, [shopId, activeTab, currentPage, limit, dateRange.startDate, dateRange.endDate])

  useEffect(() => {
    fetchSettlements()
  }, [fetchSettlements])

  const handleTabChange = (value: string) => {
    setActiveTab(value as SettlementStatus)
    setCurrentPage(1)
  }

  const handleApplyDate = () => {
    if (dateInput.startDate > dateInput.endDate) {
      toast.error('Ngày bắt đầu không được sau ngày kết thúc')
      return
    }

    setDateRange(dateInput)
    setCurrentPage(1)
  }

  const handleQuickRange = (type: 'week' | 'month') => {
    const range = type === 'week' ? getThisWeekRange() : getThisMonthRange()
    setDateInput(range)
    setDateRange(range)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const renderPagination = () => {
    if (!meta || meta.totalPages <= 1 || loading) return null

    const totalPages = meta.totalPages
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }

    return (
      <div className='flex items-center justify-between p-4 border-t border-[#004643]/10 bg-white rounded-b-md'>
        <span className='text-sm text-muted-foreground'>
          Hiển thị {Math.min(currentPage * limit, meta.totalItems)} trên {meta.totalItems} kết quả
        </span>
        <Pagination className='justify-end w-auto'>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href='#'
                onClick={(event) => {
                  event.preventDefault()
                  if (currentPage > 1) handlePageChange(currentPage - 1)
                }}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {pages.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href='#'
                  isActive={currentPage === page}
                  onClick={(event) => {
                    event.preventDefault()
                    handlePageChange(page)
                  }}
                  className='cursor-pointer'
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href='#'
                onClick={(event) => {
                  event.preventDefault()
                  if (currentPage < totalPages) handlePageChange(currentPage + 1)
                }}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    )
  }

  const renderStatusBadge = (status: SettlementStatus) => {
    if (status === 'COMPLETED') {
      return (
        <Badge className='bg-emerald-50 text-emerald-700 border border-emerald-200'>
          Đã thanh toán
        </Badge>
      )
    }

    return (
      <Badge className='bg-amber-50 text-amber-700 border border-amber-200'>
        Chưa thanh toán
      </Badge>
    )
  }

  const renderPaymentMethod = (method: string) => {
    if (method === 'WALLET') return 'Ví shop'
    return method
  }

  const renderTableSkeleton = () => (
    <div className='rounded-md border border-[#004643]/10'>
      <Table>
        <TableHeader className='bg-[#f8fbfa]'>
          <TableRow>
            <TableHead className='text-[#004643] font-semibold'>Mã đơn hàng</TableHead>
            <TableHead className='text-[#004643] font-semibold'>Tiền hàng thanh toán</TableHead>
            <TableHead className='text-[#004643] font-semibold'>Phí sàn</TableHead>
            <TableHead className='text-[#004643] font-semibold'>Shop thực nhận</TableHead>
            <TableHead className='text-[#004643] font-semibold'>Phương thức nhận</TableHead>
            <TableHead className='text-[#004643] font-semibold'>Trạng thái</TableHead>
            <TableHead className='text-[#004643] font-semibold'>Thời gian sàn thanh toán</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: limit }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className='h-4 w-[220px]' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-4 w-[120px]' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-4 w-[90px]' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-4 w-[120px]' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-4 w-[90px]' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-5 w-[110px]' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-4 w-[140px]' />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const renderSettlementTable = () => {
    if (loading) {
      return renderTableSkeleton()
    }

    return (
      <div className='rounded-md border border-[#004643]/10'>
        <Table>
          <TableHeader className='bg-[#f8fbfa]'>
            <TableRow>
              <TableHead className='text-[#004643] font-semibold'>Mã đơn hàng</TableHead>
              <TableHead className='text-[#004643] font-semibold'>Tiền hàng thanh toán</TableHead>
              <TableHead className='text-[#004643] font-semibold'>Phí sàn</TableHead>
              <TableHead className='text-[#004643] font-semibold'>Shop thực nhận</TableHead>
              <TableHead className='text-[#004643] font-semibold'>Phương thức nhận</TableHead>
              <TableHead className='text-[#004643] font-semibold'>Trạng thái</TableHead>
              <TableHead className='text-[#004643] font-semibold'>Thời gian sàn thanh toán</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settlements.length > 0 ? (
              settlements.map((settlement) => (
                <TableRow key={settlement.orderId} className='hover:bg-[#f8fbfa]'>
                  <TableCell className='font-mono text-xs text-[#004643] break-all'>
                    {settlement.orderId}
                  </TableCell>
                  <TableCell className='font-semibold text-[#004643]'>
                    {formatPrice(settlement.goodsPrice)}
                  </TableCell>
                  <TableCell>{formatPrice(settlement.commissionFee)}</TableCell>
                  <TableCell className='font-semibold text-[#004643]'>
                    {formatPrice(settlement.payout)}
                  </TableCell>
                  <TableCell>{renderPaymentMethod(settlement.paymentMethod)}</TableCell>
                  <TableCell>{renderStatusBadge(settlement.status)}</TableCell>
                  <TableCell>{formatDateTime(settlement.payoutAt)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className='h-24 text-center text-muted-foreground'>
                  Không có bản ghi đối soát nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {renderPagination()}
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-8 p-8 bg-[#f7fbfa] min-h-screen'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-[#004643]'>Doanh thu</h1>
          <p className='text-[#004643]/70 mt-1 font-semibold'>
            Theo dõi số dư ví và đối soát doanh thu theo từng khoảng thời gian.
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='border-l-4 border-l-[#004643] bg-white shadow-sm'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-semibold text-[#004643]/70'>Số dư ví shop</CardTitle>
          </CardHeader>
          <CardContent>
            {walletLoading ? (
              <Skeleton className='h-9 w-[200px]' />
            ) : (
              <div className='text-3xl font-bold text-[#004643]'>
                {formatPrice(walletBalance)}
              </div>
            )}
            <p className='text-sm text-muted-foreground mt-2'>
              Số dư hiện tại của ví chủ shop.
            </p>
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-[#f9bc60] bg-white shadow-sm'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-semibold text-[#004643]/70'>
              {activeTab === 'PENDING' ? 'Tổng tiền chưa thanh toán' : 'Tổng tiền đã thanh toán'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className='h-9 w-[220px]' />
            ) : (
              <div className='text-3xl font-bold text-[#004643]'>
                {formatPrice(totalPayout)}
              </div>
            )}
            <p className='text-sm text-muted-foreground mt-2'>
              Tổng payout theo tab đang chọn trong khoảng thời gian đã lọc.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className='bg-white shadow-sm border border-[#004643]/10'>
        <CardHeader className='flex flex-col gap-4'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <div>
              <CardTitle className='text-xl text-[#004643]'>Lịch sử đối soát</CardTitle>
              <p className='text-sm text-muted-foreground mt-1'>
                Danh sách settlement theo khoảng thời gian và trạng thái thanh toán.
              </p>
            </div>
            <div className='flex flex-wrap items-end gap-3'>
              <div className='flex items-center gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => handleQuickRange('week')}
                  className='border-[#004643]/20 text-[#004643] hover:bg-[#004643]/5'
                >
                  Tuần này
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => handleQuickRange('month')}
                  className='border-[#004643]/20 text-[#004643] hover:bg-[#004643]/5'
                >
                  Tháng này
                </Button>
              </div>
              <div className='flex flex-col gap-1'>
                <span className='text-xs text-muted-foreground'>Từ ngày</span>
                <DatePicker
                  value={parseDateInput(dateInput.startDate)}
                  onChange={(date) => {
                    if (!date) return
                    setDateInput({ ...dateInput, startDate: formatDateInput(date) })
                  }}
                />
              </div>
              <div className='flex flex-col gap-1'>
                <span className='text-xs text-muted-foreground'>Đến ngày</span>
                <DatePicker
                  value={parseDateInput(dateInput.endDate)}
                  onChange={(date) => {
                    if (!date) return
                    setDateInput({ ...dateInput, endDate: formatDateInput(date) })
                  }}
                />
              </div>
              <Button
                onClick={handleApplyDate}
                className='bg-[#004643] hover:bg-[#003330] text-white'
              >
                Áp dụng
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className='w-full'>
            <TabsList className='bg-[#f0f7f6] border border-[#004643]/10 shadow-sm rounded-md'>
              <TabsTrigger
                value='PENDING'
                className='data-[state=active]:bg-[#004643] data-[state=active]:text-white text-[#004643] font-semibold'
              >
                Chưa thanh toán
              </TabsTrigger>
              <TabsTrigger
                value='COMPLETED'
                className='data-[state=active]:bg-[#004643] data-[state=active]:text-white text-[#004643] font-semibold'
              >
                Đã thanh toán
              </TabsTrigger>
            </TabsList>

            <TabsContent value='PENDING' className='mt-6'>
              {renderSettlementTable()}
            </TabsContent>

            <TabsContent value='COMPLETED' className='mt-6'>
              {renderSettlementTable()}
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  )
}
