'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Loader2, PackageCheck, PackageX, MapPin, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { getOrderDeliveryHistoryAPI, type OrderDeliveryHistory } from '~/apiRequests/order.apiRequest'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import { cn } from '~/lib/utils'

interface OrderDeliveryTimelineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string | null
}

interface TimelineItem {
  key: string
  title: string
  time?: string | null
  description?: string
  icon?: ReactNode
  tone?: 'primary' | 'success' | 'danger'
}

const formatDateTime = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function OrderDeliveryTimelineDialog({
  open,
  onOpenChange,
  orderId,
}: OrderDeliveryTimelineDialogProps) {
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<OrderDeliveryHistory | null>(null)

  useEffect(() => {
    if (!open || !orderId) return

    const fetchHistory = async () => {
      try {
        setLoading(true)
        const res = await getOrderDeliveryHistoryAPI(orderId)
        setHistory(res.data || null)
      } catch {
        toast.error('Không thể tải lịch sử giao hàng')
        setHistory(null)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [open, orderId])

  const timelineItems = useMemo<TimelineItem[]>(() => {
    if (!history) return []

    const items: TimelineItem[] = []

    if (history.orderedAt) {
      items.push({
        key: 'orderedAt',
        title: 'Thời điểm đặt hàng',
        time: history.orderedAt,
        icon: <MapPin className='h-4 w-4' />,
        tone: 'primary',
      })
    }

    if (history.dispatchToCarrierAt) {
      items.push({
        key: 'dispatchToCarrierAt',
        title: 'Đơn vị vận chuyển lấy hàng thành công',
        time: history.dispatchToCarrierAt,
        icon: <Truck className='h-4 w-4' />,
        tone: 'primary',
      })
    }

    const warehouses = Array.isArray(history.warehouses) ? history.warehouses : []
    const sortedWarehouses = [...warehouses].sort((a, b) => {
      const timeA = new Date(a.time).getTime()
      const timeB = new Date(b.time).getTime()
      return timeA - timeB
    })

    sortedWarehouses.forEach((warehouse, index) => {
      items.push({
        key: `warehouse-${index}-${warehouse.name}`,
        title: `Đơn hàng đã đi đến kho ${warehouse.name}`,
        time: warehouse.time,
        description: warehouse.address ? `Địa chỉ: ${warehouse.address}` : undefined,
        icon: <MapPin className='h-4 w-4' />,
        tone: 'primary',
      })
    })

    if (history.shipper) {
      const shipperName = history.shipper.name
      const shipperPhone = history.shipper.phoneNumber
      const shipperTitle = shipperName
        ? `Đơn hàng được nhân viên ${shipperName} tiếp nhận`
        : 'Đơn hàng được nhân viên tiếp nhận'
      const shipperDescription = shipperPhone
        ? `SĐT: ${shipperPhone}`
        : undefined

      items.push({
        key: 'shipper',
        title: shipperTitle,
        time: history.shipper.time,
        description: shipperDescription,
        icon: <Truck className='h-4 w-4' />,
        tone: 'primary',
      })
    }

    if (history.deliverySuccessAt) {
      items.push({
        key: 'deliverySuccessAt',
        title: 'Giao hàng thành công',
        time: history.deliverySuccessAt,
        icon: <PackageCheck className='h-4 w-4' />,
        tone: 'success',
      })
    }

    if (history.deliveryFailAt) {
      items.push({
        key: 'deliveryFailAt',
        title: 'Giao hàng thất bại',
        time: history.deliveryFailAt,
        icon: <PackageX className='h-4 w-4' />,
        tone: 'danger',
      })
    }

    return items.sort((a, b) => {
      const timeA = a.time ? new Date(a.time).getTime() : 0
      const timeB = b.time ? new Date(b.time).getTime() : 0
      return timeB - timeA
    })
  }, [history])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[860px] max-h-[85vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Hành trình đơn hàng</DialogTitle>
          <DialogDescription>
            Theo dõi tiến trình xử lý và vận chuyển của đơn hàng.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='h-6 w-6 animate-spin text-[#004643]' />
            <span className='ml-3 text-sm text-gray-500'>Đang tải tuyến đường...</span>
          </div>
        ) : timelineItems.length === 0 ? (
          <div className='rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500'>
            Chưa có dữ liệu hành trình cho đơn hàng này.
          </div>
        ) : (
          <div className='relative pl-14'>
            <div className='space-y-6'>
              {timelineItems.map((item, index) => {
                const isLast = index === timelineItems.length - 1
                const isCurrent = index === 0
                return (
                  <div key={item.key} className='relative'>
                    <div className='absolute left-3.5 top-3 bottom-[-4px] w-[2px] bg-gray-300' />
                    {!isLast && (
                      <div className='absolute left-3.5 top-9 bottom-[-28px] w-[2px] bg-gray-300' />
                    )}

                    <div className={cn(
                      'absolute left-0 top-0 h-8 w-8 rounded-full border-2 flex items-center justify-center text-white shadow-sm',
                      item.tone === 'success' && 'bg-emerald-500 border-emerald-500',
                      item.tone === 'danger' && 'bg-rose-500 border-rose-500',
                      (!item.tone || item.tone === 'primary') && 'bg-[#004643] border-[#004643]',
                      isCurrent && 'ring-4 ring-[#004643]/20'
                    )}>
                      {item.icon}
                    </div>

                    <div className='pl-10 pt-0.5'>
                      <div className='flex flex-col gap-1'>
                        <div className='flex flex-wrap items-center gap-3'>
                          <p className={cn(
                            'text-sm font-semibold',
                            isCurrent ? 'text-[#004643]' : 'text-gray-800'
                          )}>
                            {item.title}
                          </p>
                          {item.time && (
                            <span className='text-xs text-gray-500'>
                              {formatDateTime(item.time)}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className='text-xs text-gray-500'>{item.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
