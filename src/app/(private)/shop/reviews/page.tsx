'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { useDebounce } from 'use-debounce'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Badge } from '~/components/ui/badge'
import { Checkbox } from '~/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Skeleton } from '~/components/ui/skeleton'
import { Calendar } from '~/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Textarea } from '~/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination'
import { CalendarIcon, Search, Star } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { getShopByOwnerIdAPI } from '~/apiRequests/shop.apiRequest'
import { createReviewReplyAPI, getShopReviewsPaginatedAPI } from '~/apiRequests/product.apiRequest'
import type { PaginationMeta, ShopReview } from '~/zodSchema/product.schema'
import { useBoundStore } from '~/zustand/store'
import { cn } from '~/lib/utils'
import { toast } from 'sonner'

const ratingOptions = [5, 4, 3, 2, 1]

const formatDateInput = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const parseDateInput = (value: string) => {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? undefined : date
}

const getStartOfWeek = (date: Date) => {
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const start = new Date(date)
  start.setDate(date.getDate() + diff)
  start.setHours(0, 0, 0, 0)
  return start
}

const formatDateTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('vi-VN')
}

const getDefaultRange = () => {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  return {
    startDate: formatDateInput(startOfMonth),
    endDate: formatDateInput(today),
  }
}

const getThisWeekRange = () => {
  const today = new Date()
  return {
    startDate: formatDateInput(getStartOfWeek(today)),
    endDate: formatDateInput(today),
  }
}

const getThisMonthRange = () => {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  return {
    startDate: formatDateInput(startOfMonth),
    endDate: formatDateInput(today),
  }
}

interface DatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
}

const DatePicker = ({ value, onChange, placeholder = 'Chọn ngày' }: DatePickerProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button
        type='button'
        variant='outline'
        className={cn(
          'w-[170px] justify-start text-left font-normal border-[#004643]/20 bg-white text-gray-900',
          !value && 'text-muted-foreground',
        )}
      >
        <CalendarIcon className='mr-2 h-4 w-4' />
        {value ? format(value, 'dd/MM/yyyy', { locale: vi }) : placeholder}
      </Button>
    </PopoverTrigger>
    <PopoverContent className='w-auto p-0 bg-white' align='start'>
      <Calendar
        mode='single'
        selected={value}
        onSelect={onChange}
        initialFocus
      />
    </PopoverContent>
  </Popover>
)

export default function ReviewsPage() {
  const shop = useBoundStore((state) => state.shop)
  const setShop = useBoundStore((state) => state.setShop)

  const [reviews, setReviews] = useState<ShopReview[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(5)

  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearch] = useDebounce(searchValue, 500)
  const [selectedRatings, setSelectedRatings] = useState<number[]>([])

  const initialRange = useMemo(() => getDefaultRange(), [])
  const [dateInput, setDateInput] = useState(initialRange)
  const [dateRange, setDateRange] = useState(initialRange)

  const [replyOpen, setReplyOpen] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [activeReview, setActiveReview] = useState<ShopReview | null>(null)
  const [mediaViewer, setMediaViewer] = useState<{
    open: boolean
    type: 'image' | 'video'
    url: string
    alt?: string
  }>({
    open: false,
    type: 'image',
    url: '',
    alt: '',
  })

  const shopId = shop?.id

  useEffect(() => {
    const fetchShopInfo = async () => {
      try {
        const shopInfo = await getShopByOwnerIdAPI()
        setShop(shopInfo)
      } catch {
        toast.error('Không thể tải thông tin shop')
      }
    }

    if (!shopId) fetchShopInfo()
  }, [shopId, setShop])

  const fetchReviews = useCallback(async () => {
    if (!shopId) return

    try {
      setLoading(true)
      const data = await getShopReviewsPaginatedAPI({
        shopId,
        page: currentPage,
        limit,
        ratings: selectedRatings,
        search: debouncedSearch || undefined,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })

      setReviews(data.items)
      setMeta(data.meta)
    } catch {
      toast.error('Không thể tải danh sách đánh giá')
    } finally {
      setLoading(false)
    }
  }, [shopId, currentPage, limit, selectedRatings, debouncedSearch, dateRange.startDate, dateRange.endDate])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleApplyDate = () => {
    if (dateInput.startDate > dateInput.endDate) {
      toast.error('Ngày bắt đầu không được sau ngày kết thúc')
      return
    }

    setDateRange(dateInput)
    setCurrentPage(1)
  }

  const handleQuickRange = (type: 'week' | 'month') => {
    const range = type === 'week' ? getThisWeekRange() : getThisMonthRange()
    setDateInput(range)
    setDateRange(range)
    setCurrentPage(1)
  }

  const toggleRating = (rating: number) => {
    setSelectedRatings((prev) => {
      const isSelected = prev.includes(rating)
      if (isSelected) return prev.filter((item) => item !== rating)
      return [...prev, rating]
    })
    setCurrentPage(1)
  }

  const openReply = (review: ShopReview) => {
    setActiveReview(review)
    setReplyContent('')
    setReplyOpen(true)
  }

  const closeReply = () => {
    setReplyOpen(false)
    setActiveReview(null)
  }

  const handleSendReply = () => {
    if (!replyContent.trim()) {
      toast.error('Vui lòng nhập nội dung phản hồi')
      return
    }

    if (!activeReview) {
      toast.error('Không xác định được đánh giá cần trả lời')
      return
    }

    if (!shopId) {
      toast.error('Không xác định được shop')
      return
    }

    createReviewReplyAPI(activeReview.id, {
      shopId,
      content: replyContent.trim(),
    })
      .then(() => {
        const replyPayload = {
          content: replyContent.trim(),
          createdAt: new Date().toISOString(),
        }

        setReviews((prev) => prev.map((review) => (
          review.id === activeReview.id
            ? { ...review, reply: replyPayload }
            : review
        )))

        toast.success('Đã gửi phản hồi')
        closeReply()
      })
      .catch(() => {
        toast.error('Gửi phản hồi thất bại')
      })
  }

  const openMediaViewer = (url: string, type: 'image' | 'video', alt?: string) => {
    setMediaViewer({
      open: true,
      type,
      url,
      alt,
    })
  }

  const closeMediaViewer = () => {
    setMediaViewer((prev) => ({ ...prev, open: false }))
  }

  const renderPagination = () => {
    if (!meta || meta.totalPages <= 1 || loading) return null

    const totalPages = meta.totalPages
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }

    return (
      <div className='flex items-center justify-between p-4 border-t border-[#004643]/10 bg-white rounded-b-md'>
        <span className='text-sm text-muted-foreground'>
          Hiển thị {Math.min(currentPage * limit, meta.total)} trên {meta.total} kết quả
        </span>
        <Pagination className='justify-end w-auto'>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href='#'
                onClick={(event) => {
                  event.preventDefault()
                  if (currentPage > 1) handlePageChange(currentPage - 1)
                }}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {pages.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href='#'
                  isActive={currentPage === page}
                  onClick={(event) => {
                    event.preventDefault()
                    handlePageChange(page)
                  }}
                  className='cursor-pointer'
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href='#'
                onClick={(event) => {
                  event.preventDefault()
                  if (currentPage < totalPages) handlePageChange(currentPage + 1)
                }}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    )
  }

  const renderStars = (rating: number) => (
    <div className='flex items-center gap-1'>
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1
        return (
          <Star
            key={starValue}
            className={cn(
              'h-4 w-4',
              starValue <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300',
            )}
          />
        )
      })}
    </div>
  )

  const renderTableSkeleton = () => (
    <div className='rounded-md border border-[#004643]/10'>
      <Table>
        <TableHeader className='bg-[#f8fbfa]'>
          <TableRow>
            <TableHead className='text-[#004643] font-semibold'>Thông tin sản phẩm</TableHead>
            <TableHead className='text-[#004643] font-semibold'>Đánh giá của người mua</TableHead>
            <TableHead className='text-[#004643] font-semibold'>Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: limit }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className='h-16 w-[260px]' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-16 w-[280px]' />
              </TableCell>
              <TableCell>
                <Skeleton className='h-9 w-[90px]' />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const renderProductImage = (url: string, alt: string) => {
    if (!url) {
      return (
        <div className='h-16 w-16 rounded-md border border-[#004643]/10 bg-[#f0f7f6] flex items-center justify-center text-[10px] text-[#004643]/70'>
          No image
        </div>
      )
    }

    return (
      <Image
        src={url}
        alt={alt}
        width={64}
        height={64}
        className='h-16 w-16 rounded-md object-cover border border-[#004643]/10'
        unoptimized
      />
    )
  }

  const renderReviewMedia = (images: string[], video?: string | null) => {
    const mediaItems = [
      ...images.map((url) => ({ type: 'image' as const, url })),
      ...(video ? [{ type: 'video' as const, url: video }] : []),
    ]

    if (mediaItems.length === 0) return null

    return (
      <div className='flex flex-wrap gap-2 mt-2'>
        {mediaItems.map((item, index) => (
          <button
            key={`${item.type}-${item.url}-${index}`}
            type='button'
            onClick={() => openMediaViewer(item.url, item.type, 'review-media')}
            className='relative h-14 w-14 rounded-md border border-[#004643]/10 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004643]/40'
          >
            {item.type === 'image' ? (
              <Image
                src={item.url}
                alt='review-image'
                width={56}
                height={56}
                className='h-full w-full object-cover'
                unoptimized
              />
            ) : (
              <>
                <video
                  src={item.url}
                  className='h-full w-full object-cover'
                  muted
                  playsInline
                />
                <span className='absolute inset-0 flex items-center justify-center bg-black/20 text-white text-xs font-semibold'>
                  Video
                </span>
              </>
            )}
          </button>
        ))}
      </div>
    )
  }

  const renderReviewTable = () => {
    if (loading) return renderTableSkeleton()

    return (
      <div className='rounded-md border border-[#004643]/10'>
        <Table>
          <TableHeader className='bg-[#f8fbfa]'>
            <TableRow>
              <TableHead className='text-[#004643] font-semibold'>Thông tin sản phẩm</TableHead>
              <TableHead className='text-[#004643] font-semibold'>Đánh giá của người mua</TableHead>
              <TableHead className='text-[#004643] font-semibold'>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <TableRow key={review.id} className='hover:bg-[#f8fbfa] align-top'>
                  <TableCell className='align-top'>
                    <div className='space-y-6'>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-10 w-10'>
                          <AvatarImage src={review.buyerAvatar ?? ''} alt={review.buyerUsername} />
                          <AvatarFallback className='text-xs'>
                            {review.buyerUsername.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='font-semibold text-[#004643]'>{review.buyerUsername}</p>
                          <p className='text-xs text-muted-foreground'>ID đơn hàng {review.orderId}</p>
                        </div>
                      </div>
                      <div className='flex gap-3 mt-2'>
                        {renderProductImage(review.productImage, review.productName)}
                        <div>
                          <p className='font-semibold text-[#004643] line-clamp-2'>{review.productName}</p>
                          <div className='flex flex-wrap items-center gap-2 mt-2'>
                            <Badge className='bg-[#004643]/10 text-[#004643] border border-[#004643]/20'>
                              SKU: {review.sku}
                            </Badge>
                            {review.isHidden && (
                              <Badge className='bg-red-50 text-red-700 border border-red-200'>
                                Đã ẩn
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='align-top'>
                    {renderStars(review.rating)}
                    <p className='text-sm text-muted-foreground mt-2'>
                      {review.content || 'Người mua chưa để lại nội dung đánh giá.'}
                    </p>
                    <div className='flex items-center gap-2 mt-2'>
                      {review.images.length > 0 && (
                        <Badge className='bg-amber-50 text-amber-700 border border-amber-200'>
                          {review.images.length} ảnh
                        </Badge>
                      )}
                      {review.video && (
                        <Badge className='bg-blue-50 text-blue-700 border border-blue-200'>
                          1 video
                        </Badge>
                      )}
                    </div>
                    {renderReviewMedia(review.images, review.video)}
                    {review.reply && (
                      <div className='mt-4 rounded-md border border-[#004643]/10 bg-[#f8fbfa] p-3'>
                        <p className='text-xs text-muted-foreground'>Phản hồi từ shop</p>
                        <p className='text-sm text-[#004643] font-medium mt-1'>
                          {review.reply.content}
                        </p>
                        <p className='text-xs text-muted-foreground mt-2'>
                          {formatDateTime(review.reply.createdAt)}
                        </p>
                      </div>
                    )}
                    <p className='text-xs text-muted-foreground mt-3'>
                      {formatDateTime(review.createdAt)}
                    </p>
                  </TableCell>
                  <TableCell className='align-top'>
                    <Button
                      variant='outline'
                      className='border-[#004643]/20 text-[#004643] hover:bg-[#004643]/5'
                      onClick={() => openReply(review)}
                    >
                      Trả lời
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className='h-24 text-center text-muted-foreground'>
                  Không có đánh giá nào phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {renderPagination()}
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-8 p-8 bg-[#f7fbfa] min-h-screen'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-[#004643]'>Quản lý đánh giá</h1>
          <p className='text-[#004643]/70 mt-1 font-semibold'>
            Theo dõi và phản hồi các đánh giá từ người mua.
          </p>
        </div>
      </div>

      <Card className='bg-white shadow-sm border border-[#004643]/10'>
        <CardHeader className='pb-4'>
          <CardTitle className='text-xl text-[#004643]'>Bộ lọc đánh giá</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex flex-wrap items-center gap-4'>
            <div className='relative w-full md:w-[320px]'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={searchValue}
                onChange={(event) => {
                  setSearchValue(event.target.value)
                  setCurrentPage(1)
                }}
                placeholder='Tìm theo mã đơn, tên sản phẩm, username'
                className='pl-9 border-[#004643]/20 bg-white'
              />
            </div>
            <div className='flex flex-wrap items-center gap-3'>
              {ratingOptions.map((rating) => (
                <label key={rating} className='flex items-center gap-2 text-sm text-[#004643]'>
                  <Checkbox
                    checked={selectedRatings.includes(rating)}
                    onCheckedChange={() => toggleRating(rating)}
                  />
                  {rating} sao
                </label>
              ))}
            </div>
          </div>

          <div className='flex flex-wrap items-end gap-3'>
            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleQuickRange('week')}
                className='border-[#004643]/20 text-[#004643] hover:bg-[#004643]/5'
              >
                Tuần này
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => handleQuickRange('month')}
                className='border-[#004643]/20 text-[#004643] hover:bg-[#004643]/5'
              >
                Tháng này
              </Button>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-xs text-muted-foreground'>Từ ngày</span>
              <DatePicker
                value={parseDateInput(dateInput.startDate)}
                onChange={(date) => {
                  if (!date) return
                  setDateInput({ ...dateInput, startDate: formatDateInput(date) })
                }}
              />
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-xs text-muted-foreground'>Đến ngày</span>
              <DatePicker
                value={parseDateInput(dateInput.endDate)}
                onChange={(date) => {
                  if (!date) return
                  setDateInput({ ...dateInput, endDate: formatDateInput(date) })
                }}
              />
            </div>
            <Button
              onClick={handleApplyDate}
              className='bg-[#004643] hover:bg-[#003330] text-white'
            >
              Áp dụng
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className='bg-white shadow-sm border border-[#004643]/10'>
        <CardHeader>
          <CardTitle className='text-xl text-[#004643]'>Danh sách đánh giá</CardTitle>
        </CardHeader>
        <CardContent>
          {renderReviewTable()}
        </CardContent>
      </Card>

      <Dialog open={replyOpen} onOpenChange={(open) => (open ? setReplyOpen(true) : closeReply())}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>Trả lời đánh giá</DialogTitle>
          </DialogHeader>
          <div className='space-y-3'>
            <div className='rounded-md border border-[#004643]/10 bg-[#f8fbfa] p-3 text-sm text-[#004643]'>
              {activeReview ? (
                <div className='space-y-1'>
                  <p className='font-semibold'>{activeReview.productName}</p>
                  <p className='text-xs text-muted-foreground'>ID đơn hàng {activeReview.orderId}</p>
                </div>
              ) : (
                'Chọn một đánh giá để trả lời'
              )}
            </div>
            <Textarea
              value={replyContent}
              onChange={(event) => setReplyContent(event.target.value)}
              maxLength={500}
              placeholder='Nhập phản hồi của shop (tối đa 500 ký tự)'
              className='min-h-[140px]'
            />
            <div className='flex justify-between text-xs text-muted-foreground'>
              <span>Tối đa 500 ký tự</span>
              <span>{replyContent.length}/500</span>
            </div>
          </div>
          <DialogFooter className='gap-2'>
            <Button type='button' variant='outline' onClick={closeReply}>
              Hủy
            </Button>
            <Button
              type='button'
              className='bg-[#004643] hover:bg-[#003330] text-white'
              onClick={handleSendReply}
            >
              Gửi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={mediaViewer.open}
        onOpenChange={(open) => {
          if (!open) closeMediaViewer()
        }}
      >
        <DialogContent className='max-w-3xl bg-black p-0 border-none'>
          <DialogHeader className='sr-only'>
            <DialogTitle>Media xem trước</DialogTitle>
            <DialogDescription>
              Xem ảnh hoặc video đánh giá ở kích thước lớn.
            </DialogDescription>
          </DialogHeader>
          <div className='relative w-full'>
            {mediaViewer.type === 'image' ? (
              <Image
                src={mediaViewer.url}
                alt={mediaViewer.alt || 'review-media'}
                width={1200}
                height={900}
                className='w-full h-auto object-contain'
                unoptimized
              />
            ) : (
              <video
                src={mediaViewer.url}
                controls
                className='w-full h-auto max-h-[80vh] object-contain'
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


