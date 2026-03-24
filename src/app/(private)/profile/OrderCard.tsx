'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Store, ExternalLink, Loader2, Star } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { requestReturnOrderItemAPI, type UserOrder } from '~/apiRequests/order.apiRequest'
import { createProductReviewAPI, uploadImageAPI, uploadVideoAPI } from '~/apiRequests/product.apiRequest'
import GalleryUploader from '~/app/(private)/shop/products/update/GalleryUploader'
import VideoUploader from '~/app/(private)/shop/products/update/VideoUploader'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'
import { cn } from '~/lib/utils'
import { useBoundStore } from '~/zustand/store'

interface OrderCardProps {
  order: UserOrder
  activeStatus: string
  onCancelOrder: (orderId: string, reason?: string) => Promise<void>
  onViewTimeline?: (orderId: string) => void
}

export default function OrderCard({ order, activeStatus, onCancelOrder, onViewTimeline }: OrderCardProps) {
  const showCancelButton = activeStatus === 'AWAITING_CONFIRMATION' || activeStatus === 'PREPARING'
  const showReviewButton = activeStatus === 'DELIVERY_COMPLETED'
  const showTimelineButton = [
    'AWAITING_CONFIRMATION',
    'PREPARING',
    'SHIPPING',
    'DELIVERY_COMPLETED',
    'DELIVERY_FAILED',
  ].includes(activeStatus)
  const user = useBoundStore((state) => state.user)

  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelReason, setCancelReason] = useState<string>('')
  const [customReason, setCustomReason] = useState('')
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState(order.orderItems[0]?.id ?? '')
  const [rating, setRating] = useState<0 | 1 | 2 | 3 | 4 | 5>(0)
  const [content, setContent] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [uploadingCount, setUploadingCount] = useState(0)
  const [isReturnOpen, setIsReturnOpen] = useState(false)
  const [selectedReturnItemId, setSelectedReturnItemId] = useState(order.orderItems[0]?.id ?? '')
  const [returnReason, setReturnReason] = useState<string>('')
  const [customReturnReason, setCustomReturnReason] = useState('')
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false)
  const [returnStatusOverrides, setReturnStatusOverrides] = useState<Record<string, string>>({})
  const [reviewedItemIds, setReviewedItemIds] = useState<string[]>(
    () => order.orderItems.filter((item) => item.isReviewed).map((item) => item.id)
  )

  const CANCEL_REASONS = [
    'Muốn thay đổi địa chỉ giao hàng',
    'Muốn thêm/bớt sản phẩm',
    'Tìm thấy giá rẻ hơn ở nơi khác',
    'Đổi ý, không muốn mua nữa',
    'Khác',
  ]

  const RETURN_REASONS = [
    'Sản phẩm bị lỗi/không hoạt động',
    'Sản phẩm không đúng mô tả',
    'Giao sai sản phẩm/phân loại',
    'Thiếu phụ kiện/thiếu hàng',
    'Khác',
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  const getReturnStatusMeta = (status?: string) => {
    switch (status) {
    case 'REFUNDED':
      return { label: 'Đã hoàn cho người mua', className: 'text-green-600' }
    default:
      return { label: 'Chưa yêu cầu', className: 'text-muted-foreground' }
    }
  }

  const selectedItem = useMemo(
    () => order.orderItems.find((item) => item.id === selectedItemId) ?? order.orderItems[0],
    [order.orderItems, selectedItemId]
  )

  useEffect(() => {
    if (!isReviewOpen) return
    setSelectedItemId((prev) => prev || (order.orderItems[0]?.id ?? ''))
    setRating(0)
    setContent('')
    setImageUrls([])
    setVideoUrl(null)
  }, [isReviewOpen, order.id, order.orderItems])

  useEffect(() => {
    if (!isReturnOpen) return
    setSelectedReturnItemId((prev) => prev || (order.orderItems[0]?.id ?? ''))
    setReturnReason('')
    setCustomReturnReason('')
  }, [isReturnOpen, order.id, order.orderItems])

  useEffect(() => {
    setReviewedItemIds(order.orderItems.filter((item) => item.isReviewed).map((item) => item.id))
  }, [order.id, order.orderItems])

  const handleConfirmCancel = async () => {
    if (cancelReason === 'Khác' && !customReason.trim()) {
      return // Don't allow empty custom reason
    }
    const finalReason = cancelReason === 'Khác' ? customReason.trim() : cancelReason

    setIsCancelling(true)
    try {
      await onCancelOrder(order.id, finalReason || undefined)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleUploadImage = async (file: File) => {
    setUploadingCount((prev) => prev + 1)
    try {
      const response = await uploadImageAPI(file)
      const url = response?.url
      if (!url) throw new Error('Missing image url')
      return url
    } finally {
      setUploadingCount((prev) => prev - 1)
    }
  }

  const handleUploadVideo = async (file: File) => {
    setUploadingCount((prev) => prev + 1)
    try {
      const response = await uploadVideoAPI(file)
      const url = response?.url
      if (!url) throw new Error('Missing video url')
      return url
    } finally {
      setUploadingCount((prev) => prev - 1)
    }
  }

  const handleSubmitReview = async () => {
    if (!selectedItem) {
      toast.error('Không tìm thấy sản phẩm cần đánh giá')
      return
    }

    if (reviewedItemIds.includes(selectedItem.id) || selectedItem.isReviewed) {
      toast.error('Sản phẩm này đã được đánh giá')
      return
    }

    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá')
      return
    }

    if (content.trim().length > 300) {
      toast.error('Nội dung đánh giá tối đa 300 ký tự')
      return
    }

    if (uploadingCount > 0) {
      toast.error('Đang tải media, vui lòng đợi hoàn tất')
      return
    }

    if (!user?.username) {
      toast.error('Không thể xác định username người mua')
      return
    }

    setIsSubmittingReview(true)
    try {
      const payload = {
        orderId: order.id,
        buyerUsername: user.username,
        buyerAvatar: user.avatar ?? null,
        productName: selectedItem.productName,
        sku: selectedItem.sku,
        rating: rating as 1 | 2 | 3 | 4 | 5,
        content: content.trim() ? content.trim() : undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        video: videoUrl ?? undefined,
      }

      await createProductReviewAPI(selectedItem.productId, payload)
      toast.success('Đã gửi đánh giá thành công')
      setReviewedItemIds((prev) =>
        prev.includes(selectedItem.id) ? prev : [...prev, selectedItem.id]
      )
      setIsReviewOpen(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Gửi đánh giá thất bại')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleSubmitReturn = async () => {
    const selectedReturnItem = order.orderItems.find((item) => item.id === selectedReturnItemId)
    if (!selectedReturnItem) {
      toast.error('Không tìm thấy sản phẩm cần trả hàng')
      return
    }

    if (returnReason === 'Khác' && !customReturnReason.trim()) {
      toast.error('Vui lòng nhập lý do cụ thể')
      return
    }

    const finalReason = returnReason === 'Khác' ? customReturnReason.trim() : returnReason
    if (!finalReason) {
      toast.error('Vui lòng chọn lý do trả hàng')
      return
    }

    setIsSubmittingReturn(true)
    try {
      await requestReturnOrderItemAPI(selectedReturnItem.id, finalReason)
      toast.success('Đã gửi yêu cầu trả hàng')
      setReturnStatusOverrides((prev) => ({
        ...prev,
        [selectedReturnItem.id]: 'REFUNDED',
      }))
      setIsReturnOpen(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Gửi yêu cầu trả hàng thất bại')
    } finally {
      setIsSubmittingReturn(false)
    }
  }

  const openReviewForItem = (itemId: string) => {
    if (reviewedItemIds.includes(itemId)) {
      toast.error('Sản phẩm này đã được đánh giá')
      return
    }
    setSelectedItemId(itemId)
    setIsReviewOpen(true)
  }

  const openReturnForItem = (itemId: string) => {
    setSelectedReturnItemId(itemId)
    setIsReturnOpen(true)
  }

  return (
    <div className='bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden'>
      {/* Shop Header */}
      <div className='flex items-center justify-between px-5 py-3 bg-gray-50/80 border-b border-gray-100'>
        <div className='flex items-center gap-2'>
          <Store className='w-4 h-4 text-[#004643]' />
          <span className='font-bold text-gray-800'>{order.shopName}</span>
        </div>
        <div className='flex items-center gap-3'>
          <Link
            href={`/shop/${order.shopId}`}
            className='inline-flex items-center gap-1.5 text-sm font-medium text-[#004643] hover:text-[#005d58] transition-colors'
          >
            <ExternalLink className='w-3.5 h-3.5' />
            Xem shop
          </Link>
        </div>
      </div>

      {/* Order Content */}
      <div className='px-5 py-4'>
        {/* Mã đơn hàng */}
        <p className='text-xs text-gray-400 mb-3'>
          Mã đơn hàng: <span className='text-gray-600 font-mono'>{order.id}</span>
        </p>

        {/* Order Items */}
        <div className='space-y-3'>
          {order.orderItems.map((item) => {
            const itemReturnStatus = returnStatusOverrides[item.id] ?? item.returnStatus
            const returnStatusMeta = getReturnStatusMeta(itemReturnStatus)
            const canRequestReturn = showReviewButton && (itemReturnStatus === undefined || itemReturnStatus === 'NONE')

            return (
              <div key={item.id} className='flex items-center gap-4'>
                {/* Variant Image */}
                <div className='relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0 bg-gray-50'>
                  <Image
                    src={item.variantImage}
                    alt={item.productName}
                    fill
                    className='object-cover'
                    sizes='64px'
                  />
                </div>

                {/* Item Info */}
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-800 line-clamp-1'>{item.productName}</p>
                  <p className='text-xs text-gray-500 mt-0.5'>Phân loại: {item.sku}</p>
                  <p className='text-xs text-gray-500'>x{item.quantity}</p>
                </div>

                {/* Price */}
                <div className='text-right shrink-0'>
                  <p className='text-sm font-semibold text-red-500'>{formatPrice(item.finalPrice)}</p>
                  {showReviewButton && (
                    reviewedItemIds.includes(item.id) || item.isReviewed ? (
                      <span className='mt-2 inline-flex items-center justify-center text-xs font-medium text-emerald-600'>
                        Đã đánh giá
                      </span>
                    ) : (
                      <button
                        className='mt-2 inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-white bg-linear-to-r from-[#004643] to-[#005d58] rounded-md hover:from-[#003d3a] hover:to-[#00524e] transition-all shadow-sm'
                        onClick={() => openReviewForItem(item.id)}
                      >
                        Đánh giá
                      </button>
                    )
                  )}

                  {showReviewButton && (
                    <div className='mt-2 flex flex-col items-end gap-1'>
                      <span className={cn('text-xs font-medium', returnStatusMeta.className)}>
                        {returnStatusMeta.label}
                      </span>
                      {canRequestReturn && (
                        <button
                          className='inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-[#004643] border border-[#004643] rounded-md hover:bg-[#f0f9f8] transition-all'
                          onClick={() => openReturnForItem(item.id)}
                        >
                          Trả hàng/Hoàn tiền
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Order Footer */}
      <div className='flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50'>
        <div className='text-sm text-gray-600'>
          Tổng đơn: <span className='text-base font-bold text-red-500'>{formatPrice(order.finalPrice)}</span>
        </div>

        <div className='flex items-center gap-2'>
          {showTimelineButton && (
            <button
              className='px-4 py-2 text-sm font-medium text-[#004643] border border-[#004643] rounded-lg hover:bg-[#f0f9f8] transition-all'
              onClick={() => onViewTimeline?.(order.id)}
            >
              Xem tuyến đường
            </button>
          )}
          {showCancelButton && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5'
                  disabled={isCancelling}
                >
                  {isCancelling && <Loader2 className='w-3.5 h-3.5 animate-spin' />}
                  Hủy đơn
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className='sm:max-w-[425px] rounded-2xl overflow-hidden p-0 gap-0 border-0 shadow-2xl'>
                {/* Header with gradient background */}
                <AlertDialogHeader className='bg-linear-to-r from-red-500 to-red-600 px-6 py-5 text-white'>
                  <AlertDialogTitle className='text-xl font-bold text-white flex items-center gap-2'>
                    Xác nhận hủy đơn hàng
                  </AlertDialogTitle>
                  <AlertDialogDescription className='text-red-50 mt-1 max-w-[95%]'>
                    Bạn đang yêu cầu hủy đơn hàng{' '}
                    <span className='font-bold text-white tracking-wide'>
                      #{order.id}
                    </span>
                    . Vui lòng chọn lý do để chúng tôi cải thiện dịch vụ tốt hơn nhé!
                  </AlertDialogDescription>
                </AlertDialogHeader>

                {/* Body with reasons list */}
                <div className='px-6 py-5 bg-white'>
                  <div className='flex flex-col gap-3'>
                    {CANCEL_REASONS.map((reason) => (
                      <div 
                        key={reason} 
                        className={`
                          relative flex items-center rounded-xl border p-3 cursor-pointer transition-all duration-200
                          ${cancelReason === reason 
                            ? 'border-red-500 bg-red-50/50 shadow-sm' 
                            : 'border-gray-200 hover:border-red-200 hover:bg-gray-50'
                          }
                        `}
                        onClick={() => setCancelReason(reason)}
                      >
                        <div className={`
                          flex shrink-0 items-center justify-center w-5 h-5 rounded-full border mr-3 transition-colors duration-200
                          ${cancelReason === reason
                            ? 'border-red-500 bg-red-500'
                            : 'border-gray-300'
                          }
                        `}>
                          {cancelReason === reason && (
                            <div className='w-2 h-2 rounded-full bg-white'></div>
                          )}
                        </div>
                        <span className={`text-sm font-medium ${cancelReason === reason ? 'text-red-700' : 'text-gray-700'}`}>
                          {reason}
                        </span>
                      </div>
                    ))}
                    
                    {/* Expandable Custom Reason Input */}
                    <div className={`
                      overflow-hidden transition-all duration-300 ease-in-out
                      ${cancelReason === 'Khác' ? 'max-h-32 opacity-100 mt-1' : 'max-h-0 opacity-0'}
                    `}>
                      <textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder='Chia sẻ lý do cụ thể của bạn để shop cải thiện nhé...'
                        className='w-full p-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all resize-none'
                        rows={3}
                        maxLength={500}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer with actions */}
                <AlertDialogFooter className='bg-gray-50 px-6 py-4 border-t border-gray-100 rounded-b-2xl flex sm:justify-end gap-3 sm:gap-0'>
                  <AlertDialogCancel className='mt-0 bg-white border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-xl px-5 transition-colors'>
                    Suy nghĩ lại
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className='bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/20 rounded-xl px-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'
                    onClick={handleConfirmCancel}
                    disabled={!cancelReason || (cancelReason === 'Khác' && !customReason.trim())}
                  >
                    Xác nhận hủy
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {showReviewButton && (
            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
              <DialogContent className='sm:max-w-[720px] max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                  <DialogTitle>Đánh giá sản phẩm</DialogTitle>
                  <DialogDescription>
                    Chia sẻ cảm nhận của bạn để giúp người khác có lựa chọn phù hợp.
                  </DialogDescription>
                </DialogHeader>

                <div className='space-y-5'>
                  <div className='space-y-2'>
                    <Label>Chọn sản phẩm</Label>
                    {order.orderItems.length > 1 ? (
                      <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Chọn sản phẩm cần đánh giá' />
                        </SelectTrigger>
                        <SelectContent>
                          {order.orderItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.productName} - {item.sku}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className='rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-700'>
                        {order.orderItems[0]?.productName} - {order.orderItems[0]?.sku}
                      </div>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label>Đánh giá</Label>
                    <div className='flex items-center gap-3'>
                      <div className='flex items-center gap-1'>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type='button'
                            className='rounded p-0.5 transition-colors hover:scale-105'
                            onClick={() => setRating(star as 1 | 2 | 3 | 4 | 5)}
                            aria-label={`${star} sao`}
                          >
                            <Star
                              className={cn(
                                'h-6 w-6',
                                star <= rating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-gray-300'
                              )}
                            />
                          </button>
                        ))}
                      </div>
                      {rating > 0 && (
                        <span className='text-sm text-gray-500'>{rating}/5</span>
                      )}
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label>Nội dung đánh giá</Label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder='Chia sẻ thật lòng về sản phẩm...'
                      maxLength={300}
                      className='min-h-[120px] resize-y'
                    />
                    <div className='flex items-center justify-between text-xs text-gray-500'>
                      <span>Tối đa 300 ký tự</span>
                      <span>{content.length}/300</span>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label>Ảnh minh họa (tối đa 3 ảnh)</Label>
                    <GalleryUploader
                      value={imageUrls}
                      onChange={setImageUrls}
                      onUpload={handleUploadImage}
                      maxImages={3}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label>Video minh họa (tối đa 1 video)</Label>
                    <VideoUploader
                      value={videoUrl}
                      onChange={setVideoUrl}
                      onUpload={handleUploadVideo}
                    />
                  </div>

                  {uploadingCount > 0 && (
                    <div className='flex items-center gap-2 text-xs text-gray-500'>
                      <Loader2 className='h-3.5 w-3.5 animate-spin' />
                      Đang tải media...
                    </div>
                  )}
                </div>

                <DialogFooter className='gap-2 sm:gap-0'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setIsReviewOpen(false)}
                    disabled={isSubmittingReview}
                  >
                    Hủy
                  </Button>
                  <Button
                    type='button'
                    className='bg-[#004643] hover:bg-[#003d3a]'
                    onClick={handleSubmitReview}
                    disabled={!selectedItem || rating === 0 || isSubmittingReview || uploadingCount > 0}
                  >
                    {isSubmittingReview && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    Gửi đánh giá
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {showReviewButton && (
            <Dialog open={isReturnOpen} onOpenChange={setIsReturnOpen}>
              <DialogContent className='sm:max-w-[560px] max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                  <DialogTitle>Yêu cầu trả hàng/hoàn tiền</DialogTitle>
                  <DialogDescription>
                    Vui lòng chọn sản phẩm và lý do để shop xử lý yêu cầu.
                  </DialogDescription>
                </DialogHeader>

                <div className='space-y-5'>
                  <div className='space-y-2'>
                    <Label>Chọn sản phẩm</Label>
                    {order.orderItems.length > 1 ? (
                      <Select value={selectedReturnItemId} onValueChange={setSelectedReturnItemId}>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Chọn sản phẩm cần trả hàng' />
                        </SelectTrigger>
                        <SelectContent>
                          {order.orderItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.productName} - {item.sku}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className='rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-700'>
                        {order.orderItems[0]?.productName} - {order.orderItems[0]?.sku}
                      </div>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label>Lý do trả hàng</Label>
                    <Select value={returnReason} onValueChange={setReturnReason}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Chọn lý do' />
                      </SelectTrigger>
                      <SelectContent>
                        {RETURN_REASONS.map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {returnReason === 'Khác' && (
                    <div className='space-y-2'>
                      <Label>Lý do cụ thể</Label>
                      <Textarea
                        value={customReturnReason}
                        onChange={(e) => setCustomReturnReason(e.target.value)}
                        placeholder='Mô tả chi tiết lý do trả hàng...'
                        maxLength={500}
                        className='min-h-[100px] resize-y'
                      />
                    </div>
                  )}
                </div>

                <DialogFooter className='gap-2 sm:gap-0'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setIsReturnOpen(false)}
                    disabled={isSubmittingReturn}
                  >
                    Hủy
                  </Button>
                  <Button
                    type='button'
                    className='bg-[#004643] hover:bg-[#003d3a]'
                    onClick={handleSubmitReturn}
                    disabled={!returnReason || (returnReason === 'Khác' && !customReturnReason.trim()) || isSubmittingReturn}
                  >
                    {isSubmittingReturn && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                    Gửi yêu cầu
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  )
}






