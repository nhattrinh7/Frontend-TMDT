'use client'

import { useState, useRef } from 'react'
import { VideoIcon, X, Loader2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

type VideoUploaderProps = {
  value: string | null
  onChange: (url: string | null) => void
  onUpload: (file: File) => Promise<string>
  disabled?: boolean
  className?: string
}

export default function VideoUploader({
  value,
  onChange,
  onUpload,
  disabled = false,
  className,
}: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Vui lòng chọn file video')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Kích thước video tối đa 10MB')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      const url = await onUpload(file)
      onChange(url)
    } catch (err) {
      setError('Upload video thất bại. Vui lòng thử lại.')
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    onChange(null)
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className={cn('space-y-2', className)}>
      <input
        ref={inputRef}
        type='file'
        accept='video/*'
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className='hidden'
      />

      {value ? (
        // Preview video đã upload
        <div className='relative w-64 group'>
          <video
            src={value}
            controls
            className='w-full rounded-lg border'
            style={{ maxHeight: '200px' }}
          />
          {!disabled && (
            <Button
              type='button'
              variant='destructive'
              size='icon'
              className='absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity'
              onClick={handleRemove}
            >
              <X className='h-4 w-4' />
            </Button>
          )}
        </div>
      ) : (
        // Upload button
        <button
          type='button'
          onClick={handleClick}
          disabled={disabled || isUploading}
          className={cn(
            'w-64 h-32 border-2 border-dashed rounded-lg',
            'flex flex-col items-center justify-center gap-2',
            'text-muted-foreground hover:text-foreground',
            'hover:border-primary hover:bg-muted/50',
            'transition-colors cursor-pointer',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isUploading ? (
            <>
              <Loader2 className='h-8 w-8 animate-spin' />
              <span className='text-sm'>Đang upload...</span>
            </>
          ) : (
            <>
              <VideoIcon className='h-8 w-8' />
              <span className='text-sm'>Thêm video (tùy chọn)</span>
              <span className='text-xs'>Tối đa 10MB</span>
            </>
          )}
        </button>
      )}

      {error && <p className='text-sm text-destructive'>{error}</p>}
    </div>
  )
}
