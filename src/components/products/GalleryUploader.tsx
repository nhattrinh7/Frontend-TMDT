'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

type GalleryUploaderProps = {
  value: string[]
  onChange: (urls: string[]) => void
  onUpload: (file: File) => Promise<string>
  maxImages?: number
  disabled?: boolean
  className?: string
}

export default function GalleryUploader({
  value = [],
  onChange,
  onUpload,
  maxImages = 5,
  disabled = false,
  className,
}: GalleryUploaderProps) {
  const [uploadingCount, setUploadingCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const canAddMore = value.length < maxImages && !disabled

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Kiểm tra số lượng
    const remainingSlots = maxImages - value.length
    if (files.length > remainingSlots) {
      setError(`Chỉ có thể thêm ${remainingSlots} ảnh nữa`)
      return
    }

    setError(null)

    // Upload từng file
    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file ảnh')
        continue
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Kích thước mỗi ảnh tối đa 2MB')
        continue
      }

      setUploadingCount((prev) => prev + 1)

      try {
        const url = await onUpload(file)
        onChange([...value, url])
      } catch (err) {
        setError('Upload ảnh thất bại. Vui lòng thử lại.')
        // eslint-disable-next-line no-console
        console.error('Upload error:', err)
      } finally {
        setUploadingCount((prev) => prev - 1)
      }
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index)
    onChange(newUrls)
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type='file'
        accept='image/*'
        multiple
        onChange={handleFileChange}
        disabled={!canAddMore || uploadingCount > 0}
        className='hidden'
      />

      <div className='flex flex-wrap gap-3'>
        {/* Preview ảnh đã upload */}
        {value.map((url, index) => (
          <div key={index} className='relative w-24 h-24 group'>
            <Image
              src={url}
              alt={`Ảnh phụ ${index + 1}`}
              fill
              className='object-cover rounded-lg border'
            />
            {!disabled && (
              <Button
                type='button'
                variant='destructive'
                size='icon'
                className='absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity'
                onClick={() => handleRemove(index)}
              >
                <X className='h-3 w-3' />
              </Button>
            )}
          </div>
        ))}

        {/* Loading placeholders */}
        {Array.from({ length: uploadingCount }).map((_, index) => (
          <div
            key={`loading-${index}`}
            className='w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/30'
          >
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ))}

        {/* Add button */}
        {canAddMore && uploadingCount === 0 && (
          <button
            type='button'
            onClick={handleClick}
            className={cn(
              'w-24 h-24 border-2 border-dashed rounded-lg',
              'flex flex-col items-center justify-center gap-1',
              'text-muted-foreground hover:text-foreground',
              'hover:border-primary hover:bg-muted/50',
              'transition-colors cursor-pointer',
            )}
          >
            <ImagePlus className='h-6 w-6' />
            <span className='text-xs'>
              {value.length}/{maxImages}
            </span>
          </button>
        )}
      </div>

      {error && <p className='text-sm text-destructive'>{error}</p>}

      <p className='text-xs text-muted-foreground'>
        Tối đa {maxImages} ảnh, mỗi ảnh không quá 2MB
      </p>
    </div>
  )
}
