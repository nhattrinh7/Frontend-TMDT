'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { getReportedReviewsPaginatedAPI, hideReviewAPI } from '~/apiRequests/product.apiRequest'
import { type PaginationMeta, type ReportedReview } from '~/zodSchema/product.schema'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { cn } from '~/lib/utils'

const REPORT_REASON_LABELS: Record<string, string> = {
  VULGAR: 'Đánh giá thô tục phản cảm',
  ADULT_CONTENT: 'Chứa hình ảnh phản cảm',
  SPAM: 'Đánh giá trùng lặp (spam)',
  PERSONAL_INFO: 'Chứa thông tin cá nhân',
  ILLEGAL_ADVERTISING: 'Quảng cáo trái phép',
  FALSE_INFORMATION: 'Đánh giá không chính xác',
  OTHER: 'Vi phạm khác',
}

const getInitials = (name: string) => {
  if (!name) return 'U'
  return name.charAt(0).toUpperCase()
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

export default function ManageReviewsPage() {
  const [reviews, setReviews] = useState<ReportedReview[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(10)
  const [activeTab, setActiveTab] = useState<'reported' | 'hidden'>('reported')
  const [confirmReviewId, setConfirmReviewId] = useState<string | null>(null)
  const [isHiding, setIsHiding] = useState(false)

  const activeReview = useMemo(
    () => reviews.find((item) => item.id === confirmReviewId) ?? null,
    [reviews, confirmReviewId]
  )

  useEffect(() => {
    const fetchReportedReviews = async () => {
      try {
        setLoading(true)
        const data = await getReportedReviewsPaginatedAPI({
          page: currentPage,
          limit,
          isHidden: activeTab === 'hidden',
        })
        setReviews(data.items)
        setMeta(data.meta)
      } catch {
        toast.error('Không thể tải danh sách đánh giá bị báo cáo')
      } finally {
        setLoading(false)
      }
    }

    fetchReportedReviews()
  }, [currentPage, limit, activeTab])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleTabChange = (value: string) => {
    const nextTab = value === 'hidden' ? 'hidden' : 'reported'
    setActiveTab(nextTab)
    setCurrentPage(1)
  }

  const handleHideReview = async () => {
    if (!confirmReviewId) return

    setIsHiding(true)
    try {
      await hideReviewAPI(confirmReviewId)
      toast.success('Đã ẩn đánh giá')
      setReviews((prev) => prev.filter((item) => item.id !== confirmReviewId))
      setConfirmReviewId(null)
    } catch {
      toast.error('Ẩn đánh giá thất bại')
    } finally {
      setIsHiding(false)
    }
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

  return (
    <div className='flex flex-col gap-6 p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-[#004643]'>Quản lý đánh giá bị báo cáo</h1>
      </div>

      <Card className='bg-white shadow-sm border border-[#004643]/10'>
        <CardHeader>
          <CardTitle className='text-xl text-[#004643]'>Danh sách đánh giá</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className='bg-[#f8fbfa] border border-[#004643]/10'>
              <TabsTrigger value='reported'>Đánh giá bị report</TabsTrigger>
              <TabsTrigger value='hidden'>Đánh giá đã bị ẩn</TabsTrigger>
            </TabsList>
            <TabsContent value='reported' className='mt-4'>
              <div className='rounded-md border border-[#004643]/10'>
                <Table>
                  <TableHeader className='bg-[#f8fbfa]'>
                    <TableRow>
                      <TableHead className='text-[#004643] font-semibold'>Đánh giá</TableHead>
                      <TableHead className='text-[#004643] font-semibold'>Báo cáo</TableHead>
                      <TableHead className='text-[#004643] font-semibold'>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={3} className='h-24 text-center text-muted-foreground'>
                          Đang tải dữ liệu...
                        </TableCell>
                      </TableRow>
                    ) : reviews.length > 0 ? (
                      reviews.map((review) => (
                        <TableRow key={review.id} className='align-top'>
                          <TableCell className='align-top'>
                            <div className='space-y-4'>
                              <div className='flex items-center gap-3'>
                                <Avatar className='h-9 w-9'>
                                  <AvatarImage src={review.buyerAvatar ?? ''} alt={review.buyerUsername} />
                                  <AvatarFallback className='text-xs'>
                                    {getInitials(review.buyerUsername)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className='font-semibold text-[#004643]'>{review.buyerUsername}</p>
                                  <p className='text-xs text-muted-foreground'>Mã đánh giá {review.id}</p>
                                </div>
                              </div>

                              <div className='flex gap-3'>
                                <Image
                                  src={review.productImage}
                                  alt={review.productName}
                                  width={64}
                                  height={64}
                                  className='h-16 w-16 rounded-md object-cover border border-[#004643]/10'
                                  unoptimized
                                />
                                <div className='space-y-2'>
                                  <p className='font-semibold text-[#004643] line-clamp-2'>
                                    {review.productName}
                                  </p>
                                  <Badge className='bg-[#004643]/10 text-[#004643] border border-[#004643]/20'>
                                    SKU: {review.sku}
                                  </Badge>
                                  {renderStars(review.rating)}
                                </div>
                              </div>

                              <div className='flex flex-wrap gap-2'>
                                {review.images.map((url, index) => (
                                  <Image
                                    key={`${review.id}-image-${index}`}
                                    src={url}
                                    alt='review-image'
                                    width={56}
                                    height={56}
                                    className='h-14 w-14 rounded-md object-cover border border-[#004643]/10'
                                    unoptimized
                                  />
                                ))}
                                {review.video && (
                                  <video
                                    src={review.video}
                                    className='h-14 w-20 rounded-md border border-[#004643]/10 object-cover'
                                    muted
                                  />
                                )}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className='align-top'>
                            <div className='space-y-3'>
                              <div className='flex items-center gap-3'>
                                <Avatar className='h-9 w-9'>
                                  <AvatarImage src={review.report.reporterAvatar ?? ''} alt={review.report.reporterUsername} />
                                  <AvatarFallback className='text-xs'>
                                    {getInitials(review.report.reporterUsername)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className='font-semibold text-[#004643]'>{review.report.reporterUsername}</p>
                                </div>
                              </div>
                              <p className='text-sm font-semibold text-red-600'>
                                {REPORT_REASON_LABELS[review.report.reason] ?? review.report.reason}
                              </p>
                              {review.report.description && (
                                <p className='text-sm text-gray-700'>
                                  {review.report.description}
                                </p>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className='align-top'>
                            <Button
                              variant='outline'
                              className='border-[#004643]/20 text-[#004643] hover:bg-[#004643]/5'
                              onClick={() => setConfirmReviewId(review.id)}
                            >
                              Ẩn
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className='h-24 text-center text-muted-foreground'>
                          Không có đánh giá bị báo cáo.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {renderPagination()}
              </div>
            </TabsContent>
            <TabsContent value='hidden' className='mt-4'>
              <div className='rounded-md border border-[#004643]/10'>
                <Table>
                  <TableHeader className='bg-[#f8fbfa]'>
                    <TableRow>
                      <TableHead className='text-[#004643] font-semibold'>Đánh giá</TableHead>
                      <TableHead className='text-[#004643] font-semibold'>Báo cáo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={2} className='h-24 text-center text-muted-foreground'>
                          Đang tải dữ liệu...
                        </TableCell>
                      </TableRow>
                    ) : reviews.length > 0 ? (
                      reviews.map((review) => (
                        <TableRow key={review.id} className='align-top'>
                          <TableCell className='align-top'>
                            <div className='space-y-4'>
                              <div className='flex items-center gap-3'>
                                <Avatar className='h-9 w-9'>
                                  <AvatarImage src={review.buyerAvatar ?? ''} alt={review.buyerUsername} />
                                  <AvatarFallback className='text-xs'>
                                    {getInitials(review.buyerUsername)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className='font-semibold text-[#004643]'>{review.buyerUsername}</p>
                                  <p className='text-xs text-muted-foreground'>Mã đánh giá {review.id}</p>
                                </div>
                              </div>

                              <div className='flex gap-3'>
                                <Image
                                  src={review.productImage}
                                  alt={review.productName}
                                  width={64}
                                  height={64}
                                  className='h-16 w-16 rounded-md object-cover border border-[#004643]/10'
                                  unoptimized
                                />
                                <div className='space-y-2'>
                                  <p className='font-semibold text-[#004643] line-clamp-2'>
                                    {review.productName}
                                  </p>
                                  <Badge className='bg-[#004643]/10 text-[#004643] border border-[#004643]/20'>
                                    SKU: {review.sku}
                                  </Badge>
                                  {renderStars(review.rating)}
                                </div>
                              </div>

                              <div className='flex flex-wrap gap-2'>
                                {review.images.map((url, index) => (
                                  <Image
                                    key={`${review.id}-image-${index}`}
                                    src={url}
                                    alt='review-image'
                                    width={56}
                                    height={56}
                                    className='h-14 w-14 rounded-md object-cover border border-[#004643]/10'
                                    unoptimized
                                  />
                                ))}
                                {review.video && (
                                  <video
                                    src={review.video}
                                    className='h-14 w-20 rounded-md border border-[#004643]/10 object-cover'
                                    muted
                                  />
                                )}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className='align-top'>
                            <div className='space-y-3'>
                              <div className='flex items-center gap-3'>
                                <Avatar className='h-9 w-9'>
                                  <AvatarImage src={review.report.reporterAvatar ?? ''} alt={review.report.reporterUsername} />
                                  <AvatarFallback className='text-xs'>
                                    {getInitials(review.report.reporterUsername)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className='font-semibold text-[#004643]'>{review.report.reporterUsername}</p>
                                </div>
                              </div>
                              <p className='text-sm font-semibold text-red-600'>
                                {REPORT_REASON_LABELS[review.report.reason] ?? review.report.reason}
                              </p>
                              {review.report.description && (
                                <p className='text-sm text-gray-700'>
                                  {review.report.description}
                                </p>
                              )}
                            </div>
                          </TableCell>

                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className='h-24 text-center text-muted-foreground'>
                          Không có đánh giá bị ẩn.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {renderPagination()}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmReviewId} onOpenChange={(open) => !open && setConfirmReviewId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận ẩn đánh giá</AlertDialogTitle>
            <AlertDialogDescription>
              {activeReview
                ? `Bạn có chắc muốn ẩn đánh giá của ${activeReview.buyerUsername} cho sản phẩm ${activeReview.productName} không?`
                : 'Bạn có chắc muốn ẩn đánh giá này không?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isHiding}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleHideReview} disabled={isHiding}>
              {isHiding ? 'Đang ẩn...' : 'Xác nhận'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
