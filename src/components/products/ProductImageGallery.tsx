'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface ProductImageGalleryProps {
  mainImage: string
  galleryImages: string[]
  video: string | null
  productName: string
}

export function ProductImageGallery({
  mainImage,
  galleryImages,
  video,
  productName,
}: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string>(mainImage)
  const [isVideo, setIsVideo] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Tạo danh sách thumbnails: mainImage + galleryImages + video
  const allMedia = [
    { type: 'image', url: mainImage },
    ...galleryImages.map((url) => ({ type: 'image', url })),
    ...(video ? [{ type: 'video', url: video }] : []),
  ]

  const handleThumbnailClick = (media: { type: string; url: string }) => {
    if (media.type === 'video') {
      setIsVideo(true)
      setSelectedImage(media.url)
    } else {
      setIsVideo(false)
      setSelectedImage(media.url)
    }
    setIsZoomed(false) // Reset zoom when switching
  }

  const handleMainMediaClick = () => {
    setIsZoomed(true)
  }

  const handleZoomClick = (e: React.MouseEvent) => {
    if (isVideo) {
      // Toggle play/pause for video
      e.stopPropagation()
      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play()
        } else {
          videoRef.current.pause()
        }
      }
    } else {
      // Close zoom for image
      setIsZoomed(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Ảnh chính hoặc video */}
      <div 
        className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white"
        onClick={handleMainMediaClick}
      >
        {isVideo ? (
          <video
            src={selectedImage}
            className="h-full w-full object-contain"
            muted // Muted by default in preview
          />
        ) : (
          <Image
            src={selectedImage}
            alt={productName}
            fill
            className="object-contain p-2"
            priority
          />
        )}
        {/* Zoom HINT Icon if needed, or just cursor-pointer is enough */}
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={() => setIsZoomed(false)} // Click outside/background to close
        >
          <div className="relative h-full w-full max-w-5xl" onClick={(e) => isVideo && e.stopPropagation()}>
            {/* Close button */}
            <button 
              className="absolute -right-4 -top-4 z-50 rounded-full bg-white p-2 text-black opacity-75 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                setIsZoomed(false)
              }}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {isVideo ? (
              <div className="flex h-full items-center justify-center" onClick={handleZoomClick}>
                <video
                  ref={videoRef}
                  src={selectedImage}
                  className="max-h-full max-w-full"
                  autoPlay
                  controls={false} // Disable default controls to handle custom click
                />
              </div>
            ) : (
              <div className="relative h-full w-full" onClick={(e) => { e.stopPropagation(); setIsZoomed(false) }}>
                <Image
                  src={selectedImage}
                  alt={productName}
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Thumbnails */}
      {allMedia.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {allMedia.map((media, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(media)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                selectedImage === media.url
                  ? 'border-[#004643]'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {media.type === 'video' ? (
                <div className="flex h-full w-full items-center justify-center bg-gray-100">
                  <svg
                    className="h-6 w-6 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              ) : (
                <Image
                  src={media.url}
                  alt={`${productName} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
