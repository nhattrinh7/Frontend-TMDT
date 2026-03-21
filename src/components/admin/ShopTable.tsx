'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Check, X, Store, User, MapPin, CreditCard, Calendar } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'
import { Badge } from '~/components/ui/badge'
import { AdminShop } from '~/zodSchema/admin.schema'

type ShopTableProps = {
  shops: AdminShop[]
  onApprove: (shopId: string) => void
  onReject: (shopId: string, reason: string) => void
  isLoading?: boolean
  isApproving?: string
  isRejecting?: string
}

export default function ShopTable({
  shops,
  onApprove,
  onReject,
  isLoading = false,
  isApproving,
  isRejecting,
}: ShopTableProps) {
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean
    shopId: string
    shopName: string
  }>({
    open: false,
    shopId: '',
    shopName: '',
  })
  
  const [rejectReason, setRejectReason] = useState('')

  const handleOpenRejectDialog = (shopId: string, shopName: string) => {
    setRejectDialog({ open: true, shopId, shopName })
    setRejectReason('')
  }

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) return
    onReject(rejectDialog.shopId, rejectReason)
    setRejectDialog({ open: false, shopId: '', shopName: '' })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-muted-foreground'>Đang tải...</div>
      </div>
    )
  }

  if (shops.length === 0) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-muted-foreground'>Không có shop nào cần duyệt</div>
      </div>
    )
  }

  return (
    <>
      <div className='rounded-lg border overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50'>
              <TableHead className='w-20'>Logo</TableHead>
              <TableHead className='min-w-[200px]'>Thông tin Shop</TableHead>
              <TableHead className='min-w-[180px]'>Chủ Shop</TableHead>
              <TableHead className='min-w-[200px]'>Địa chỉ</TableHead>
              <TableHead className='min-w-[150px]'>Ngân hàng & MST</TableHead>
              <TableHead className='min-w-[100px]'>Ngày đăng ký</TableHead>
              <TableHead className='w-32 text-center'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shops.map((shop) => (
              <TableRow key={shop.id} className='hover:bg-muted/30'>
                {/* Logo */}
                <TableCell>
                  {shop.logo ? (
                    <div className='relative size-14 overflow-hidden rounded-lg border shadow-sm'>
                      <Image
                        src={shop.logo}
                        alt={shop.name}
                        fill
                        className='object-cover'
                      />
                    </div>
                  ) : (
                    <div className='flex size-14 items-center justify-center rounded-lg border bg-muted'>
                      <Store className='size-6 text-muted-foreground' />
                    </div>
                  )}
                </TableCell>

                {/* Shop Info */}
                <TableCell>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <span className='font-semibold text-[#004643]'>{shop.name}</span>
                      <Badge variant='secondary' className='text-xs'>
                        Chờ duyệt
                      </Badge>
                    </div>
                    <p className='text-sm text-muted-foreground line-clamp-2'>
                      {shop.description}
                    </p>
                  </div>
                </TableCell>

                {/* Owner Info */}
                <TableCell>
                  <div className='flex items-start gap-2'>
                    <User className='size-4 text-muted-foreground mt-0.5 shrink-0' />
                    <div className='space-y-0.5'>
                      <div className='font-medium'>{shop.owner.fullName}</div>
                      <div className='text-xs text-muted-foreground'>{shop.owner.email}</div>
                      <div className='text-xs text-muted-foreground'>{shop.owner.phoneNumber}</div>
                    </div>
                  </div>
                </TableCell>

                {/* Address */}
                <TableCell>
                  <div className='flex items-start gap-2'>
                    <MapPin className='size-4 text-muted-foreground mt-0.5 shrink-0' />
                    <div className='space-y-0.5'>
                      <div className='text-sm font-medium'>{shop.address.recipientName}</div>
                      <div className='text-xs text-muted-foreground'>
                        {shop.address.detail}, {shop.address.ward}, {shop.address.province}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        SĐT: {shop.address.recipientPhoneNumber}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Bank & Tax */}
                <TableCell>
                  <div className='flex items-start gap-2'>
                    <CreditCard className='size-4 text-muted-foreground mt-0.5 shrink-0' />
                    <div className='space-y-0.5'>
                      <div className='text-sm font-medium'>{shop.bankName}</div>
                      <div className='text-xs text-muted-foreground'>STK: {shop.bankNumber}</div>
                      <div className='text-xs text-muted-foreground'>MST: {shop.taxCode}</div>
                    </div>
                  </div>
                </TableCell>

                {/* Created Date */}
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Calendar className='size-4 text-muted-foreground' />
                    <span className='text-sm'>{formatDate(shop.createdAt)}</span>
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <div className='flex items-center justify-center gap-2'>
                    <Button
                      size='sm'
                      className='gap-1 bg-green-600 hover:bg-green-700'
                      onClick={() => onApprove(shop.id)}
                      disabled={isApproving === shop.id || isRejecting === shop.id}
                    >
                      <Check className='size-4' />
                      {isApproving === shop.id ? 'Đang...' : 'Duyệt'}
                    </Button>
                    <Button
                      size='sm'
                      variant='destructive'
                      className='gap-1'
                      onClick={() => handleOpenRejectDialog(shop.id, shop.name)}
                      disabled={isApproving === shop.id || isRejecting === shop.id}
                    >
                      <X className='size-4' />
                      {isRejecting === shop.id ? 'Đang...' : 'Từ chối'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Reject Reason Dialog */}
      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ chối duyệt shop {rejectDialog.shopName}</DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối. Shop sẽ nhận được thông báo về lý do này.
            </DialogDescription>
          </DialogHeader>
          
          <div className='py-4 space-y-2'>
            <Label htmlFor='reject-reason'>Lý do từ chối</Label>
            <Textarea
              id='reject-reason'
              placeholder='Nhập lý do từ chối...'
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className='resize-none'
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => setRejectDialog((prev) => ({ ...prev, open: false }))}
            >
              Hủy
            </Button>
            <Button
              variant='destructive'
              onClick={handleConfirmReject}
              disabled={!rejectReason.trim()}
            >
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
