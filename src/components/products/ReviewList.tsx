'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { ProductReview } from '~/zodSchema/product.schema'

interface ReviewListProps {
  reviews: ProductReview[]
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

interface ReviewItemProps {
  review: ProductReview
  onMediaClick: (media: { type: 'image' | 'video'; url: string }) => void
}

function ReviewItem({ review, onMediaClick }: ReviewItemProps) {
  const reviewTime = format(new Date(review.createdAt), 'yyyy-MM-dd HH:mm')

  return (
    <div className="border-b border-gray-200 py-6 last:border-0">
      <div className="flex gap-3">
        {/* Avatar and Info... (keep existing) */}
        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-200">
          {review.user.avatar ? (
            <Image src={review.user.avatar} alt={review.user.username} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-gray-500">
              {review.user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="font-medium">{review.user.username}</div>
          <div className="mt-1 flex items-center gap-2">
            <StarRating rating={review.rating} />
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <span>{reviewTime}</span>
            <span className="mx-1">|</span>
            <span>Phân loại: {review.sku}</span>
          </div>
          <p className="mt-3 text-gray-700">{review.content}</p>

          {/* Media */}
          {(review.images.length > 0 || review.video) && (
            <div className="mt-3 flex gap-2">
              {review.images.map((image, index) => (
                <div
                  key={index}
                  className="relative h-20 w-20 cursor-pointer overflow-hidden rounded-md border border-gray-200"
                  onClick={() => onMediaClick({ type: 'image', url: image })}
                >
                  <Image src={image} alt={`Review image ${index + 1}`} fill className="object-cover" />
                </div>
              ))}
              {review.video && (
                <div
                  className="relative h-20 w-20 cursor-pointer overflow-hidden rounded-md border border-gray-200"
                  onClick={() => onMediaClick({ type: 'video', url: review.video! })}
                >
                  <video src={review.video} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ReviewList({ reviews }: ReviewListProps) {
  const [zoomedMedia, setZoomedMedia] = useState<{ type: 'image' | 'video'; url: string } | null>(null)
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
      <div className="py-12 text-center text-gray-500">
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
        />
      ))}

      {/* Zoom Modal */}
      {zoomedMedia && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={() => setZoomedMedia(null)}
        >
          <div className="relative h-full w-full max-w-5xl" onClick={(e) => zoomedMedia.type === 'video' && e.stopPropagation()}>
            <button 
              className="absolute -right-4 -top-4 z-50 rounded-full bg-white p-2 text-black opacity-75 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                setZoomedMedia(null)
              }}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {zoomedMedia.type === 'video' ? (
              <div className="flex h-full items-center justify-center" onClick={handleZoomClick}>
                <video
                  ref={videoRef}
                  src={zoomedMedia.url}
                  className="max-h-full max-w-full"
                  autoPlay
                  controls={false}
                />
              </div>
            ) : (
              <div className="relative h-full w-full" onClick={(e) => { e.stopPropagation(); setZoomedMedia(null) }}>
                <Image
                  src={zoomedMedia.url}
                  alt="Zoomed review media"
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
