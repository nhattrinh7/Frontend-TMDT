'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { ShopOrder } from '~/apiRequests/order.apiRequest'
import { formatPrice } from '~/lib/utils'
import Image from 'next/image'
import { Separator } from '~/components/ui/separator'

interface OrderDetailsDialogProps {
  order: ShopOrder
}

// Hàm format che SDT
const maskPhoneNumber = (phone: string) => {
  if (!phone || phone.length < 10) return phone
  return phone.slice(0, 3) + '****' + phone.slice(-3)
}

// Hàm format che địa chỉ (che phường/xã, quận/huyện)
const maskAddress = (address: string) => {
  if (!address) return address
  const parts = address.split(',').map(p => p.trim())
  if (parts.length >= 3) {
    // Giả sử format: Số nhà/Đường, Phường/Xã, Quận/Huyện, Tỉnh/TP
    // Sẽ che phần Phường, Quận
    const maskedParts = parts.map((part, index) => {
      if (index === parts.length - 2 || index === parts.length - 3) {
        return '***'
      }
      return part
    })
    return maskedParts.join(', ')
  }
  return '***'
}

const getPaymentMethodLabel = (method: string) => {
  switch (method) {
  case 'COD': return 'Thanh toán khi nhận hàng (COD)'
  case 'WALLET': return 'Ví S-Zone'
  case 'QRCODE': return 'Chuyển khoản (QR)'
  default: return method
  }
}

const getReturnStatusLabel = (returnStatus?: string) => {
  switch (returnStatus) {
  case 'REFUNDED':
    return { label: 'Đã hoàn cho người mua', className: 'text-green-600' }
  default:
    return { label: 'Chưa yêu cầu', className: 'text-muted-foreground' }
  }
}

export default function OrderDetailsDialog({ order }: OrderDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant='outline' 
          size='sm' 
          className='w-28 border-[#004643] text-[#004643] hover:bg-[#f0f9f8] shadow-sm'
        >
          Xem chi tiết
        </Button>
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold text-[#004643]'>Chi tiết đơn hàng</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-6 p-4'>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div className='flex flex-col gap-1'>
              <span className='text-muted-foreground'>Mã đơn hàng:</span>
              <span className='font-semibold'>{order.id}</span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-muted-foreground'>Người mua:</span>
              <span className='font-medium'>{order.buyerUsername || 'Người dùng'}</span>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className='font-semibold text-[#004643] mb-3'>Thông tin nhận hàng</h3>
            <div className='grid grid-cols-1 gap-2 text-sm bg-muted/30 p-4 rounded-md'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Người nhận:</span>
                <span className='font-medium'>{order.receiverName}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Số điện thoại:</span>
                <span className='font-medium'>{maskPhoneNumber(order.receiverPhoneNumber)}</span>
              </div>
              <div className='flex justify-between gap-4'>
                <span className='text-muted-foreground'>Địa chỉ:</span>
                <span className='font-medium text-right'>{maskAddress(order.shippingAddress)}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className='font-semibold text-[#004643] mb-3'>Sản phẩm ({order.orderItems.length})</h3>
            <div className='flex flex-col gap-4'>
              {order.orderItems.map((item) => (
                <div key={item.id} className='flex gap-4 items-center bg-white border p-3 rounded-md'>
                  <div className='h-16 w-16 shrink-0 overflow-hidden rounded-md border'>
                    <Image 
                      src={item.variantImage} 
                      alt={item.productName} 
                      width={64} 
                      height={64} 
                      className='h-full w-full object-cover'
                      unoptimized
                    />
                  </div>
                  <div className='flex-1 flex flex-col'>
                    <span className='font-medium line-clamp-2'>{item.productName}</span>
                    <span className='text-sm text-muted-foreground'>Phân loại: {item.sku}</span>
                    <span className='text-sm mt-1'>SL: x{item.quantity}</span>
                  </div>
                  <div className='text-right font-medium text-rose-500'>
                    {formatPrice(item.finalPrice)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />
          
          {order.status === 'CANCELLED' && order.cancelReason && (
            <div>
              <h3 className='font-semibold text-rose-500 mb-2'>Lý do hủy đơn</h3>
              <div className='bg-rose-50 p-3 rounded-md text-sm border border-rose-100'>
                {order.cancelReason}
              </div>
            </div>
          )}

          {order.status === 'RETURNED' && (
            <div>
              <h3 className='font-semibold text-orange-600 mb-2'>Thông tin hoàn trả</h3>
              <div className='bg-orange-50 p-3 rounded-md text-sm border border-orange-100 grid gap-2'>
                <div className='flex justify-between gap-4'>
                  <span className='text-muted-foreground whitespace-nowrap'>Lý do:</span>
                  <div className='flex-1 text-right'>
                    <div className='flex flex-col gap-1'>
                      {order.orderItems.map((item) => (
                        <div key={item.id}>
                          {item.returnReason || 'Không có lý do'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Phương án:</span>
                  <div className='text-right'>
                    <div className='flex flex-col gap-1 font-medium'>
                      {order.orderItems.map((item) => (
                        <div key={item.id}>Hoàn tiền ngay</div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Trạng thái:</span>
                  <div className='text-right'>
                    <div className='flex flex-col gap-1 font-medium'>
                      {order.orderItems.map((item) => {
                        const statusMeta = getReturnStatusLabel(item.returnStatus)
                        return (
                          <div key={item.id} className={statusMeta.className}>
                            {statusMeta.label}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className='font-semibold text-[#004643] mb-3'>Thông tin thanh toán</h3>
            <div className='flex flex-col gap-2 text-sm bg-muted/30 p-4 rounded-md'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Tổng tiền hàng:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Phí vận chuyển:</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Shop Voucher giảm:</span>
                <span className='text-green-600'>- {formatPrice(order.shopVoucherDiscount)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Platform Voucher giảm:</span>
                <span className='text-green-600'>- {formatPrice(order.szoneVoucherDiscount)}</span>
              </div>
              <Separator className='my-2' />
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>Tiền hàng (sau giảm giá):</span>
                <span className='font-medium'>{formatPrice(typeof order.goodsPrice === 'number' ? order.goodsPrice : 0)}</span>
              </div>
              <div className='flex justify-between font-bold text-base'>
                <span>Người mua thanh toán:</span>
                <span className='text-rose-500'>
                  {formatPrice(typeof order.finalPrice === 'string' ? parseFloat(order.finalPrice) : order.finalPrice)}
                </span>
              </div>
              
              <div className='flex justify-between mt-2 pt-2 border-t'>
                <span className='text-muted-foreground'>Phương thức:</span>
                <span className='font-medium text-[#004643]'>{getPaymentMethodLabel(order.paymentMethod)}</span>
              </div>
            </div>
          </div>
          
        </div>
      </DialogContent>
    </Dialog>
  )
}
