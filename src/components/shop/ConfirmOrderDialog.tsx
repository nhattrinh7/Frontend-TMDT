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
import { acceptOrderAPI } from '~/apiRequests/order.apiRequest'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ConfirmOrderDialogProps {
  orderId: string
  fetchData: () => Promise<void>
}

export default function ConfirmOrderDialog({ orderId, fetchData }: ConfirmOrderDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleConfirmOrder = async () => {
    try {
      setLoading(true)
      const res = await acceptOrderAPI(orderId)
      if (res.success) {
        toast.success('Xác nhận đơn hàng thành công')
        await fetchData()
        setOpen(false)
        router.refresh()
      } else {
        toast.error(res.message || 'Có lỗi xảy ra khi xác nhận đơn hàng')
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
          className='w-28 bg-[#004643] hover:bg-[#004643]/90 text-white shadow-sm' 
          size='sm'
        >
          Xác nhận
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận đơn hàng?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xác nhận đơn hàng này không? Sau khi xác nhận, đơn hàng sẽ chuyển sang trạng thái &quot;Chờ lấy hàng&quot;.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault()
              handleConfirmOrder()
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
