'use client'

import { useEffect, useState } from 'react'
import { getShopOrdersPaginatedAPI, ShopOrder } from '~/apiRequests/order.apiRequest'
import { useBoundStore } from '~/zustand/store'
import { Input } from '~/components/ui/input'
import { Search } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { formatPrice } from '~/lib/utils'
import Image from 'next/image'
import { Button } from '~/components/ui/button'
import OrderDetailsDialog from '~/components/shop/OrderDetailsDialog'
import DeliverOrderDialog from '~/components/shop/DeliverOrderDialog'
import ConfirmOrderDialog from '~/components/shop/ConfirmOrderDialog'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'

interface OrderTableProps {
  status: string
}

export default function OrderTable({ status }: OrderTableProps) {
  const shop = useBoundStore((state) => state.shop)
  const [orders, setOrders] = useState<ShopOrder[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500)

  const buildQueryParams = () => {
    if (status === 'RETURNED') {
      return { status: 'DELIVERY_COMPLETED', returnStatus: 'REFUNDED' }
    }
    return { status }
  }

  const filterReturnedOrders = (items: ShopOrder[]) => {
    if (status !== 'RETURNED') return items
    return items
      .map((order) => ({
        ...order,
        orderItems: order.orderItems.filter((item) => item.returnStatus === 'REFUNDED'),
      }))
      .filter((order) => order.orderItems.length > 0)
  }

  // Fetch data
  const fetchOrders = async () => {
    if (!shop) return
    try {
      const res = await getShopOrdersPaginatedAPI(shop.id, {
        ...buildQueryParams(),
        page,
        limit: 5,
        search: debouncedSearchTerm || undefined,
      })
      if (res.data) {
        setOrders(filterReturnedOrders(res.data.items))
        setTotalPages(res.data.meta.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
  }

  useEffect(() => {
    // Reset page to 1 when search or status changes
    setPage(1)
  }, [debouncedSearchTerm, status])

  useEffect(() => {
    const fetchOrdersData = async () => {
      if (!shop) return
      try {
        const res = await getShopOrdersPaginatedAPI(shop.id, {
          ...buildQueryParams(),
          page,
          limit: 5,
          search: debouncedSearchTerm || undefined,
        })
        if (res.data) {
          setOrders(filterReturnedOrders(res.data.items))
          setTotalPages(res.data.meta.totalPages)
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      }
    }
    fetchOrdersData()
  }, [shop, status, page, debouncedSearchTerm])

  // Lấy các cột mở rộng
  const hasReviewColumn = status === 'DELIVERY_COMPLETED'
  const hasCancelReasonColumn = status === 'CANCELLED'
  const hasReturnReasonColumn = status === 'RETURNED'

  const getReturnStatusLabel = (returnStatus?: string) => {
    switch (returnStatus) {
    case 'REFUNDED':
      return { label: 'Đã hoàn cho người mua', className: 'text-green-600' }
    default:
      return { label: 'Chưa yêu cầu', className: 'text-muted-foreground' }
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center w-full max-w-md relative'>
        <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
        <Input
          placeholder='Tìm kiếm theo Mã đơn hàng, Tên sản phẩm'
          className='pl-8'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className='rounded-md border bg-white overflow-hidden'>
        <div className='overflow-x-auto w-full'>
          <table className='w-full text-sm'>
            <thead className='bg-[#f0f9f8]'>
              <tr className='border-b'>
                <th className='p-4 text-left font-semibold text-[#004643] whitespace-nowrap'>Mã đơn hàng</th>
                <th className='p-4 text-left font-semibold text-[#004643] whitespace-nowrap'>Người mua</th>
                <th className='p-4 text-left font-semibold text-[#004643]'>Sản phẩm</th>
                <th className='p-4 text-right font-semibold text-[#004643] whitespace-nowrap'>Tổng tiền</th>
                {hasReviewColumn && (
                  <th className='p-4 text-left font-semibold text-[#004643] whitespace-nowrap'>Đánh giá</th>
                )}
                {hasCancelReasonColumn && (
                  <th className='p-4 text-left font-semibold text-[#004643] whitespace-nowrap'>Lý do hủy</th>
                )}
                {hasReturnReasonColumn && (
                  <>
                    <th className='p-4 text-left font-semibold text-[#004643] whitespace-nowrap'>Lý do hoàn</th>
                    <th className='p-4 text-left font-semibold text-[#004643] whitespace-nowrap'>Phương án</th>
                    <th className='p-4 text-left font-semibold text-[#004643] whitespace-nowrap'>Trạng thái hoàn</th>
                  </>
                )}
                <th className='p-4 text-center font-semibold text-[#004643] whitespace-nowrap'>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className='p-8 text-center text-muted-foreground'>
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className='border-b last:border-0 hover:bg-muted/30'>
                    <td className='p-4 align-top font-medium'>{order.id}</td>
                    <td className='p-4 align-top'>
                      <div className='flex items-center gap-2'>
                        <Avatar className='h-8 w-8'>
                          <AvatarImage src={order.buyerAvatar || undefined} />
                          <AvatarFallback>{order.buyerUsername?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <span className='font-medium text-sm line-clamp-1' title={order.buyerUsername}>{order.buyerUsername}</span>
                      </div>
                    </td>
                    <td className='p-4 align-top'>
                      <div className='flex flex-col gap-3'>
                        {order.orderItems.map((item) => (
                          <div key={item.id} className='flex gap-3 items-start'>
                            <div className='h-12 w-12 shrink-0 overflow-hidden rounded-md border'>
                              <Image 
                                src={item.variantImage} 
                                alt={item.productName} 
                                width={48} 
                                height={48} 
                                className='h-full w-full object-cover'
                                unoptimized
                              />
                            </div>
                            <div className='flex flex-col'>
                              <span className='line-clamp-2 font-medium'>{item.productName}</span>
                              <span className='text-xs text-muted-foreground'>Phân loại: {item.sku} x {item.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Cột giá */}
                    <td className='p-4 align-middle text-right font-bold text-lg text-rose-500'>
                      {formatPrice(typeof order.finalPrice === 'string' ? parseFloat(order.finalPrice) : order.finalPrice)}
                    </td>
                    
                    {/* Các cột thêm vào tùy status */}
                    {hasReviewColumn && (
                      <td className='p-4 align-top text-muted-foreground whitespace-nowrap'>
                        Chưa có đánh giá
                      </td>
                    )}
                    {hasCancelReasonColumn && (
                      <td className='p-4 align-top max-w-[200px] truncate' title={order.cancelReason || 'Không có lý do'}>
                        {order.cancelReason || 'Không có lý do'}
                      </td>
                    )}

                    {hasReturnReasonColumn && (
                      <>
                        <td className='p-4 align-top max-w-[180px]'>
                          <div className='flex flex-col gap-1'>
                            {order.orderItems.map((item) => (
                              <div key={item.id} className='truncate' title={item.returnReason || 'Không có lý do'}>
                                {item.returnReason || 'Không có lý do'}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className='p-4 align-top whitespace-nowrap'>
                          <div className='flex flex-col gap-1'>
                            {order.orderItems.map((item) => (
                              <div key={item.id}>Hoàn tiền ngay</div>
                            ))}
                          </div>
                        </td>
                        <td className='p-4 align-top whitespace-nowrap'>
                          <div className='flex flex-col gap-1'>
                            {order.orderItems.map((item) => {
                              const statusMeta = getReturnStatusLabel(item.returnStatus)
                              return (
                                <div key={item.id} className={statusMeta.className}>
                                  {statusMeta.label}
                                </div>
                              )
                            })}
                          </div>
                        </td>
                      </>
                    )}

                    {/* Cột thao tác */}
                    <td className='p-4 align-top text-center'>
                      <div className='flex flex-col items-center gap-2'>
                        {/* Nút xác nhận */}
                        {status === 'AWAITING_CONFIRMATION' && (
                          <ConfirmOrderDialog 
                            orderId={order.id} 
                            fetchData={fetchOrders} 
                          />
                        )}
                        {/* Nút Đã giao cho bên vận chuyển */}
                        {status === 'PREPARING' && (
                          <DeliverOrderDialog 
                            orderId={order.id} 
                            fetchData={fetchOrders} 
                          />
                        )}
                        {/* Nút xem chi tiết */}
                        <OrderDetailsDialog order={order} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-end gap-2 mt-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Trang trước
          </Button>
          <div className='text-sm'>
            Trang {page} / {totalPages}
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  )
}
