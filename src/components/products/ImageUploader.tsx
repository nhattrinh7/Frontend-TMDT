'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { ImagePlus, X, Loader2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

type ImageUploaderProps = {
  value: string | null
  onChange: (url: string | null) => void
  onUpload: (file: File) => Promise<string>
  disabled?: boolean
  className?: string
}

export default function ImageUploader({
  value,
  onChange,
  onUpload,
  disabled = false,
  className,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Vui lòng chọn file ảnh')
        return
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Kích thước ảnh tối đa 2MB')
        return
      }

      setError(null)
      setIsUploading(true)

      try {
        const url = await onUpload(file)
        onChange(url)
      } catch (err) {
        setError('Upload ảnh thất bại. Vui lòng thử lại.')
        console.error('Upload error:', err)
      } finally {
        setIsUploading(false)
        // Reset input
        if (inputRef.current) {
          inputRef.current.value = ''
        }
      }
    },
    [onUpload, onChange]
  )

  const handleRemove = useCallback(() => {
    onChange(null)
  }, [onChange])

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {value ? (
        // Preview ảnh đã upload
        <div className="relative w-40 h-40 group">
          <Image
            src={value}
            alt="Ảnh sản phẩm"
            fill
            className="object-cover rounded-lg border"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        // Upload button
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || isUploading}
          className={cn(
            'w-40 h-40 border-2 border-dashed rounded-lg',
            'flex flex-col items-center justify-center gap-2',
            'text-muted-foreground hover:text-foreground',
            'hover:border-primary hover:bg-muted/50',
            'transition-colors cursor-pointer',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">Đang upload...</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-8 w-8" />
              <span className="text-sm">Thêm ảnh chính</span>
            </>
          )}
        </button>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
