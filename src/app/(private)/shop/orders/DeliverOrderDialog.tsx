'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { deliverOrderAPI } from '~/apiRequests/order.apiRequest'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface DeliverOrderDialogProps {
  orderId: string
  fetchData: () => Promise<void>
}

export default function DeliverOrderDialog({ orderId, fetchData }: DeliverOrderDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDeliverOrder = async () => {
    try {
      setLoading(true)
      const res = await deliverOrderAPI(orderId)
      if (res.success) {
        toast.success('Đã xác nhận giao cho đơn vị vận chuyển')
        await fetchData()
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res.message || 'Có lỗi xảy ra khi cập nhật đơn hàng')
      }
    } catch (e) {
      const error = e as Error
      toast.error(error.message || 'Lỗi kết nối')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          className='w-max bg-[#004643] hover:bg-[#004643]/90 text-white shadow-sm text-xs px-3' 
          size='sm'
        >
          Đã giao cho vận chuyển
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận giao hàng?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn đã giao đơn hàng này cho đơn vị vận chuyển không? Sau khi xác nhận, đơn hàng sẽ chuyển sang trạng thái &quot;Đang giao hàng&quot;.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault()
              handleDeliverOrder()
            }}
            disabled={loading}
            className='bg-[#004643] hover:bg-[#004643]/90 text-white'
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
