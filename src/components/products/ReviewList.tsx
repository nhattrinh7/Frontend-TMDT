'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { ProductReview } from '~/zodSchema/product.schema'
import { ReportReviewModal } from '~/components/products/ReportReviewModal'

interface ReviewListProps {
  reviews: ProductReview[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className='flex text-emerald-600 mt-0.5 mb-2'>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-[14px] w-[14px] ${star <= rating ? 'text-emerald-600' : 'text-slate-300'}`}
          fill='currentColor'
          viewBox='0 0 20 20'
        >
          <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
        </svg>
      ))}
    </div>
  )
}

interface ReviewItemProps {
  review: ProductReview;
  onMediaClick: (media: { type: 'image' | 'video'; url: string }) => void;
  onReport: (reviewId: string) => void;
}

function ReviewItem({ review, onMediaClick, onReport }: ReviewItemProps) {
  const reviewTime = format(new Date(review.createdAt), 'yyyy-MM-dd HH:mm')
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Đóng menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  return (
    <div className='pt-6 first:pt-0 border-t border-slate-100 first:border-0 mt-6 first:mt-0'>
      <div className='flex gap-4'>
        {/* Avatar */}
        <div className='w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 relative flex items-center justify-center'>
          {review.user.avatar ? (
            <Image
              src={review.user.avatar}
              alt={review.user.username}
              fill
              unoptimized
              className='object-cover'
            />
          ) : (
            <span className='text-lg font-semibold text-slate-500'>
              {review.user.username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className='flex-1'>
          <div className='flex items-center justify-between'>
            <div className='text-xs font-medium text-slate-900'>
              {review.user.username}
            </div>

            {/* Nút ba chấm */}
            <div className='relative' ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className='rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              >
                <svg
                  className='h-5 w-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path d='M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z' />
                </svg>
              </button>

              {showMenu && (
                <div className='absolute right-0 z-10 mt-1 w-32 rounded-md border border-slate-200 bg-white py-1 shadow-lg'>
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onReport(review.id)
                    }}
                    className='flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-slate-50'
                  >
                    <svg
                      className='h-4 w-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9'
                      />
                    </svg>
                    Báo cáo
                  </button>
                </div>
              )}
            </div>
          </div>

          <StarRating rating={review.rating} />
          <div className='text-xs text-slate-400 mb-3'>
            Phân loại: {review.sku} | {reviewTime}
          </div>
          <p className='text-sm text-slate-700 leading-relaxed'>
            {review.content}
          </p>

          {/* Media */}
          {((review.images && review.images.length > 0) || review.video) && (
            <div className='flex gap-2 mt-4'>
              {review.images?.map((image, index) => (
                <div
                  key={index}
                  className='relative w-20 h-20 cursor-pointer overflow-hidden rounded border border-slate-200 hover:border-emerald-600 transition-colors'
                  onClick={() => onMediaClick({ type: 'image', url: image })}
                >
                  <Image
                    src={image}
                    alt={`Review image ${index + 1}`}
                    fill
                    unoptimized
                    className='object-cover'
                  />
                </div>
              ))}
              {review.video && (
                <div
                  className='relative w-20 h-20 cursor-pointer overflow-hidden rounded border border-slate-200 hover:border-emerald-600 transition-colors'
                  onClick={() =>
                    onMediaClick({ type: 'video', url: review.video! })
                  }
                >
                  <video
                    src={review.video}
                    className='h-full w-full object-cover'
                  />
                  <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-30'>
                    <svg
                      className='h-8 w-8 text-white'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z' />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )}

          {review.reply && (
            <div className='mt-4 rounded-lg border border-emerald-100 bg-emerald-50/70 p-4'>
              <div className='text-xs font-semibold text-emerald-700 uppercase tracking-wide'>
                Phản hồi từ shop
              </div>
              <p className='text-sm text-slate-700 mt-2 leading-relaxed'>
                {review.reply.content}
              </p>
              <p className='text-xs text-slate-500 mt-3'>
                {format(new Date(review.reply.createdAt), 'yyyy-MM-dd HH:mm')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ReviewList({ reviews }: ReviewListProps) {
  const [zoomedMedia, setZoomedMedia] = useState<{
    type: 'image' | 'video';
    url: string;
  } | null>(null)
  const [reportReviewId, setReportReviewId] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleZoomClick = (e: React.MouseEvent) => {
    if (zoomedMedia?.type === 'video') {
      e.stopPropagation()
      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play()
        } else {
          videoRef.current.pause()
        }
      }
    } else {
      setZoomedMedia(null)
    }
  }

  if (reviews.length === 0) {
    return (
      <div className='py-12 text-center text-gray-500'>
        Chưa có đánh giá nào
      </div>
    )
  }

  return (
    <div>
      {reviews.map((review) => (
        <ReviewItem
          key={review.id}
          review={review}
          onMediaClick={setZoomedMedia}
          onReport={setReportReviewId}
        />
      ))}

      {/* Report Modal */}
      {reportReviewId && (
        <ReportReviewModal
          reviewId={reportReviewId}
          onClose={() => setReportReviewId(null)}
        />
      )}

      {/* Zoom Modal */}
      {zoomedMedia && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4'
          onClick={() => setZoomedMedia(null)}
        >
          <div
            className='relative h-full w-full max-w-5xl'
            onClick={(e) => zoomedMedia.type === 'video' && e.stopPropagation()}
          >
            <button
              className='absolute -right-4 -top-4 z-50 rounded-full bg-white p-2 text-black opacity-75 hover:opacity-100'
              onClick={(e) => {
                e.stopPropagation()
                setZoomedMedia(null)
              }}
            >
              <svg
                className='h-6 w-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>

            {zoomedMedia.type === 'video' ? (
              <div
                className='flex h-full items-center justify-center'
                onClick={handleZoomClick}
              >
                <video
                  ref={videoRef}
                  src={zoomedMedia.url}
                  className='max-h-full max-w-full'
                  autoPlay
                  controls={false}
                />
              </div>
            ) : (
              <div
                className='relative h-full w-full'
                onClick={(e) => {
                  e.stopPropagation()
                  setZoomedMedia(null)
                }}
              >
                <Image
                  src={zoomedMedia.url}
                  alt='Zoomed review media'
                  fill
                  className='object-contain'
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
