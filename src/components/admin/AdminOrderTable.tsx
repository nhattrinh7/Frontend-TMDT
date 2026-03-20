'use client'

import Image from 'next/image'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { formatPrice } from '~/lib/utils'
import type { AdminOrder } from '~/apiRequests/order.apiRequest'
import AdminOrderDetailsDialog from '~/components/admin/AdminOrderDetailsDialog'

export type AdminOrderStatus =
  | 'AWAITING_CONFIRMATION'
  | 'PREPARING'
  | 'SHIPPING'
  | 'DELIVERY_COMPLETED'
  | 'DELIVERY_FAILED'
  | 'CANCELLED'
  | 'RETURNED'

interface AdminOrderTableProps {
  orders: AdminOrder[]
  status: AdminOrderStatus
  isLoading: boolean
}

export default function AdminOrderTable({
  orders,
  status,
  isLoading,
}: AdminOrderTableProps) {
  const hasReviewColumn = status === 'DELIVERY_COMPLETED'
  const hasCancelReasonColumn = status === 'CANCELLED'
  const hasReturnColumns = status === 'RETURNED'

  const getReturnStatusLabel = (returnStatus?: string) => {
    switch (returnStatus) {
    case 'REFUNDED':
      return { label: 'Đã hoàn cho người mua', className: 'text-green-600' }
    default:
      return { label: 'Chưa yêu cầu', className: 'text-muted-foreground' }
    }
  }

  if (isLoading) {
    return (
      <div className='flex justify-center p-8'>
        <div className='text-muted-foreground'>Đang tải danh sách đơn hàng...</div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center p-8 border rounded-lg bg-card text-card-foreground shadow-sm'>
        <p className='text-muted-foreground'>Không có đơn hàng nào</p>
      </div>
    )
  }

  return (
    <div className='rounded-md border bg-white'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='whitespace-nowrap'>Mã đơn hàng</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead className='text-right whitespace-nowrap'>Tổng tiền người mua thanh toán</TableHead>
            {hasReviewColumn && (
              <TableHead className='whitespace-nowrap'>Đánh giá</TableHead>
            )}
            {hasCancelReasonColumn && (
              <TableHead className='whitespace-nowrap'>Lý do hủy</TableHead>
            )}
            {hasReturnColumns && (
              <>
                <TableHead className='whitespace-nowrap'>Lý do hoàn</TableHead>
                <TableHead className='whitespace-nowrap'>Phương án hoàn</TableHead>
                <TableHead className='whitespace-nowrap'>Trạng thái hoàn</TableHead>
              </>
            )}
            <TableHead className='text-center whitespace-nowrap'>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className='align-top'>
              <TableCell className='font-medium whitespace-nowrap'>{order.id}</TableCell>
              <TableCell>
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
                        <span className='text-xs text-muted-foreground'>SKU: {item.sku} x {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell className='text-right font-bold text-rose-500 whitespace-nowrap'>
                {formatPrice(typeof order.finalPrice === 'string' ? parseFloat(order.finalPrice) : order.finalPrice)}
              </TableCell>

              {hasReviewColumn && (
                <TableCell className='text-muted-foreground whitespace-nowrap'>
                  {order.review || 'Chưa có đánh giá'}
                </TableCell>
              )}

              {hasCancelReasonColumn && (
                <TableCell className='max-w-[240px] truncate' title={order.cancelReason || 'Không có lý do'}>
                  {order.cancelReason || 'Không có lý do'}
                </TableCell>
              )}

              {hasReturnColumns && (
                <>
                  <TableCell className='max-w-[200px]'>
                    <div className='flex flex-col gap-1'>
                      {order.orderItems.map((item) => (
                        <div key={item.id} className='truncate' title={item.returnReason || 'Không có lý do'}>
                          {item.returnReason || 'Không có lý do'}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className='whitespace-nowrap'>
                    <div className='flex flex-col gap-1'>
                      {order.orderItems.map((item) => (
                        <div key={item.id}>Hoàn tiền ngay</div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className='whitespace-nowrap'>
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
                  </TableCell>
                </>
              )}

              <TableCell className='text-center'>
                <AdminOrderDetailsDialog order={order} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
