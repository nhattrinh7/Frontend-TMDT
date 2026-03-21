'use client'

import Image from 'next/image'
import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Store,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Star,
  ShoppingCart,
  DollarSign,
  Ban,
  ShieldCheck,
} from 'lucide-react'
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Badge } from '~/components/ui/badge'
import { AdminShop } from '~/zodSchema/admin.schema'

type ShopStatus = 'ACTIVE' | 'CLOSED' | 'BANNED' | 'REJECTED'

type ManageShopTableProps = {
  shops: AdminShop[]
  status: ShopStatus
  onBan?: (shopId: string) => void
  onUnban?: (shopId: string) => void
  isLoading?: boolean
  actioningShopId?: string
}

const statusConfig: Record<ShopStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  ACTIVE: { label: 'Đang hoạt động', variant: 'default' },
  CLOSED: { label: 'Đã đóng cửa', variant: 'secondary' },
  BANNED: { label: 'Đã bị ban', variant: 'destructive' },
  REJECTED: { label: 'Đã từ chối', variant: 'outline' },
}

export default function ManageShopTable({
  shops,
  status,
  onBan,
  onUnban,
  isLoading = false,
  actioningShopId,
}: ManageShopTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    shopId: string
    shopName: string
    action: 'ban' | 'unban'
  }>({
    open: false,
    shopId: '',
    shopName: '',
    action: 'ban',
  })

  const toggleRow = (shopId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(shopId)) {
        newSet.delete(shopId)
      } else {
        newSet.add(shopId)
      }
      return newSet
    })
  }

  const handleConfirmAction = () => {
    if (confirmDialog.action === 'ban' && onBan) {
      onBan(confirmDialog.shopId)
    } else if (confirmDialog.action === 'unban' && onUnban) {
      onUnban(confirmDialog.shopId)
    }
    setConfirmDialog({ open: false, shopId: '', shopName: '', action: 'ban' })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
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
        <div className='text-muted-foreground'>Không có shop nào</div>
      </div>
    )
  }

  return (
    <>
      <div className='rounded-lg border overflow-x-auto'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50'>
              <TableHead className='w-10'></TableHead>
              <TableHead className='w-16'>Logo</TableHead>
              <TableHead className='min-w-[180px]'>Tên Shop</TableHead>
              <TableHead className='min-w-[100px]'>Đánh giá</TableHead>
              <TableHead className='min-w-[120px]'>Doanh thu</TableHead>
              <TableHead className='min-w-[100px]'>Đơn hàng</TableHead>
              {status !== 'ACTIVE' && status !== 'BANNED' && (
                <TableHead className='min-w-[110px]'>Trạng thái</TableHead>
              )}
              {(status === 'ACTIVE' || status === 'BANNED') && (
                <TableHead className='w-28 text-center'>Thao tác</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {shops.map((shop) => (
              <Collapsible key={shop.id} asChild open={expandedRows.has(shop.id)}>
                <>
                  <CollapsibleTrigger asChild>
                    <TableRow
                      className='hover:bg-muted/30 cursor-pointer'
                      onClick={() => toggleRow(shop.id)}
                    >
                      {/* Expand Icon */}
                      <TableCell>
                        {expandedRows.has(shop.id) ? (
                          <ChevronUp className='size-4 text-muted-foreground' />
                        ) : (
                          <ChevronDown className='size-4 text-muted-foreground' />
                        )}
                      </TableCell>

                      {/* Logo */}
                      <TableCell>
                        {shop.logo ? (
                          <div className='relative size-12 overflow-hidden rounded-lg border shadow-sm'>
                            <Image
                              src={shop.logo}
                              alt={shop.name}
                              fill
                              className='object-cover'
                            />
                          </div>
                        ) : (
                          <div className='flex size-12 items-center justify-center rounded-lg border bg-muted'>
                            <Store className='size-5 text-muted-foreground' />
                          </div>
                        )}
                      </TableCell>

                      {/* Name */}
                      <TableCell>
                        <div className='font-semibold text-[#004643]'>{shop.name}</div>
                        <p className='text-xs text-muted-foreground line-clamp-1 max-w-[200px]'>
                          {shop.description}
                        </p>
                      </TableCell>

                      {/* Rating */}
                      <TableCell>
                        <div className='flex items-center gap-1'>
                          <Star className='size-4 text-yellow-500 fill-yellow-500' />
                          <span className='font-medium'>{shop.ratingAvg.toFixed(1)}</span>
                          <span className='text-xs text-muted-foreground'>
                            ({shop.ratingCount})
                          </span>
                        </div>
                      </TableCell>

                      {/* Revenue */}
                      <TableCell>
                        <div className='flex items-center gap-1'>
                          <DollarSign className='size-4 text-green-600' />
                          <span className='text-sm font-medium'>
                            {formatCurrency(shop.totalRevenue)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Orders */}
                      <TableCell>
                        <div className='flex items-center gap-1'>
                          <ShoppingCart className='size-4 text-blue-600' />
                          <span className='font-medium'>{shop.totalOrderCount}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      {status !== 'ACTIVE' && status !== 'BANNED' && (
                        <TableCell>
                          <Badge variant={statusConfig[status].variant}>
                            {statusConfig[status].label}
                          </Badge>
                        </TableCell>
                      )}

                      {/* Actions */}
                      {status === 'ACTIVE' && onBan && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className='flex justify-center'>
                            <Button
                              size='sm'
                              variant='destructive'
                              className='gap-1'
                              onClick={() =>
                                setConfirmDialog({
                                  open: true,
                                  shopId: shop.id,
                                  shopName: shop.name,
                                  action: 'ban',
                                })
                              }
                              disabled={actioningShopId === shop.id}
                            >
                              <Ban className='size-4' />
                              {actioningShopId === shop.id ? 'Đang...' : 'Ban'}
                            </Button>
                          </div>
                        </TableCell>
                      )}
                      {status === 'BANNED' && onUnban && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className='flex justify-center'>
                            <Button
                              size='sm'
                              className='gap-1 bg-green-600 hover:bg-green-700'
                              onClick={() =>
                                setConfirmDialog({
                                  open: true,
                                  shopId: shop.id,
                                  shopName: shop.name,
                                  action: 'unban',
                                })
                              }
                              disabled={actioningShopId === shop.id}
                            >
                              <ShieldCheck className='size-4' />
                              {actioningShopId === shop.id ? 'Đang...' : 'Unban'}
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  </CollapsibleTrigger>

                  {/* Expanded Content */}
                  <CollapsibleContent asChild>
                    <TableRow className='bg-muted/20 hover:bg-muted/20'>
                      <TableCell colSpan={status === 'ACTIVE' ? 7 : status === 'BANNED' ? 7 : 7}>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4'>
                          {/* Owner Info */}
                          <div className='space-y-2'>
                            <div className='flex items-center gap-2 text-sm font-semibold text-[#004643]'>
                              <User className='size-4' />
                              Chủ Shop
                            </div>
                            <div className='space-y-1 text-sm'>
                              <div>{shop.owner.fullName}</div>
                              <div className='text-muted-foreground'>{shop.owner.email}</div>
                              <div className='text-muted-foreground'>{shop.owner.phoneNumber}</div>
                            </div>
                          </div>

                          {/* Address */}
                          <div className='space-y-2'>
                            <div className='flex items-center gap-2 text-sm font-semibold text-[#004643]'>
                              <MapPin className='size-4' />
                              Địa chỉ
                            </div>
                            <div className='space-y-1 text-sm'>
                              <div>{shop.address.recipientName}</div>
                              <div className='text-muted-foreground'>
                                {shop.address.detail}, {shop.address.ward}, {shop.address.province}
                              </div>
                              <div className='text-muted-foreground'>
                                SĐT: {shop.address.recipientPhoneNumber}
                              </div>
                            </div>
                          </div>

                          {/* Bank Info */}
                          <div className='space-y-2'>
                            <div className='flex items-center gap-2 text-sm font-semibold text-[#004643]'>
                              <CreditCard className='size-4' />
                              Ngân hàng & MST
                            </div>
                            <div className='space-y-1 text-sm'>
                              <div>{shop.bankName}</div>
                              <div className='text-muted-foreground'>STK: {shop.bankNumber}</div>
                              <div className='text-muted-foreground'>MST: {shop.taxCode}</div>
                            </div>
                          </div>

                          {/* Date & Reject Reason */}
                          <div className='space-y-2'>
                            <div className='flex items-center gap-2 text-sm font-semibold text-[#004643]'>
                              <Calendar className='size-4' />
                              Ngày đăng ký
                            </div>
                            <div className='text-sm'>{formatDate(shop.createdAt)}</div>
                            
                            {status === 'REJECTED' && shop.rejectReason && (
                              <div className='mt-3 p-3 bg-red-50 border border-red-200 rounded-md'>
                                <div className='text-sm font-semibold text-red-700'>Lý do từ chối:</div>
                                <div className='text-sm text-red-600'>{shop.rejectReason}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </CollapsibleContent>
                </>
              </Collapsible>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Confirm Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'ban' ? 'Ban shop này?' : 'Unban shop này?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn {confirmDialog.action === 'ban' ? 'ban' : 'unban'} shop{' '}
              <span className='font-semibold'>{confirmDialog.shopName}</span>?
              {confirmDialog.action === 'ban' && (
                <> Shop sẽ không thể hoạt động trên hệ thống.</>
              )}
              {confirmDialog.action === 'unban' && (
                <> Shop sẽ được phép hoạt động trở lại.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={
                confirmDialog.action === 'ban'
                  ? 'bg-destructive hover:bg-destructive/90'
                  : 'bg-green-600 hover:bg-green-700'
              }
            >
              {confirmDialog.action === 'ban' ? 'Ban' : 'Unban'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
