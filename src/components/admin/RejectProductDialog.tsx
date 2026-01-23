'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'
import { Textarea } from '~/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'

const rejectReasonSchema = z.object({
  rejectReason: z.string().min(10, 'Lý do từ chối phải có ít nhất 10 ký tự'),
})

type RejectReasonFormValues = z.infer<typeof rejectReasonSchema>

type RejectProductDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName: string
  onConfirm: (rejectReason: string) => void
  isLoading?: boolean
}

export default function RejectProductDialog({
  open,
  onOpenChange,
  productName,
  onConfirm,
  isLoading = false,
}: RejectProductDialogProps) {
  const form = useForm<RejectReasonFormValues>({
    resolver: zodResolver(rejectReasonSchema),
    defaultValues: {
      rejectReason: '',
    },
  })

  const handleSubmit = (values: RejectReasonFormValues) => {
    onConfirm(values.rejectReason)
    form.reset()
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">Từ chối sản phẩm</DialogTitle>
          <DialogDescription>
            Bạn đang từ chối sản phẩm <span className="font-semibold">{productName}</span>.
            Vui lòng nhập lý do từ chối để thông báo cho người bán.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rejectReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do từ chối</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập lý do từ chối sản phẩm..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isLoading}
              >
                {isLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
