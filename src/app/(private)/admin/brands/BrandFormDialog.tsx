'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload, X, ImageIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { toast } from 'sonner'
import { BrandFormSchema, BrandFormInput, Brand } from '~/zodSchema/admin.schema'
import { uploadBrandLogoAPI } from '~/apiRequests/admin.apiRequest'

type BrandFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  brand?: Brand | null // null = create, Brand = update
  onSubmit: (data: BrandFormInput) => Promise<void>
  isSubmitting?: boolean
}

export default function BrandFormDialog({
  open,
  onOpenChange,
  brand,
  onSubmit,
  isSubmitting = false,
}: BrandFormDialogProps) {
  const isUpdate = !!brand
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  const form = useForm<BrandFormInput>({
    resolver: zodResolver(BrandFormSchema),
    defaultValues: {
      name: '',
      description: '',
      logo: '',
      country: '',
    },
  })

  // Sync form and preview when dialog opens or brand changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: brand?.name || '',
        description: brand?.description || '',
        logo: brand?.logo || '',
        country: brand?.country || '',
      })
      setPreviewUrl(brand?.logo || '')
    }
  }, [open, brand, form])

  // Reset form when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
      setPreviewUrl('')
    }
    onOpenChange(newOpen)
  }

  const handleSubmit = async (data: BrandFormInput) => {
    await onSubmit(data)
    form.reset()
    setPreviewUrl('')
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa 5MB')
      return
    }

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Upload file
    setIsUploading(true)
    try {
      const logoUrl = await uploadBrandLogoAPI(file)
      if (logoUrl) {
        form.setValue('logo', logoUrl, { shouldValidate: true })
        setPreviewUrl(logoUrl)
        toast.success('Đã tải ảnh lên thành công')
      }
    } catch {
      toast.error('Không thể tải ảnh lên')
      setPreviewUrl(form.getValues('logo') || '')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = () => {
    form.setValue('logo', '', { shouldValidate: true })
    setPreviewUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? 'Cập nhật thương hiệu' : 'Tạo thương hiệu mới'}
          </DialogTitle>
          <DialogDescription>
            {isUpdate
              ? 'Chỉnh sửa thông tin thương hiệu bên dưới.'
              : 'Điền thông tin để tạo thương hiệu mới.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tên thương hiệu <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='VD: Apple, Samsung...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mô tả <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Mô tả về thương hiệu...'
                      className='min-h-[80px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Logo Upload */}
            <FormField
              control={form.control}
              name='logo'
              render={() => (
                <FormItem>
                  <FormLabel>
                    Logo <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <div className='space-y-3'>
                      {/* Preview */}
                      {previewUrl ? (
                        <div className='relative inline-block'>
                          <div className='relative size-24 overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25'>
                            <Image
                              src={previewUrl}
                              alt='Logo preview'
                              fill
                              className='object-cover'
                            />
                            {isUploading && (
                              <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
                                <Loader2 className='size-6 animate-spin text-white' />
                              </div>
                            )}
                          </div>
                          <Button
                            type='button'
                            variant='destructive'
                            size='icon'
                            className='absolute -right-2 -top-2 size-6'
                            onClick={handleRemoveImage}
                            disabled={isUploading}
                          >
                            <X className='size-3' />
                          </Button>
                        </div>
                      ) : (
                        <button
                          type='button'
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className='flex size-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/25 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50'
                        >
                          {isUploading ? (
                            <Loader2 className='size-6 animate-spin text-muted-foreground' />
                          ) : (
                            <>
                              <ImageIcon className='size-6 text-muted-foreground' />
                              <span className='text-xs text-muted-foreground'>Chọn ảnh</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Upload Button */}
                      {previewUrl && !isUploading && (
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => fileInputRef.current?.click()}
                          className='gap-1.5'
                        >
                          <Upload className='size-3.5' />
                          Thay đổi ảnh
                        </Button>
                      )}

                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type='file'
                        accept='image/*'
                        onChange={handleFileSelect}
                        className='hidden'
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='country'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Quốc gia <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='VD: Mỹ, Hàn Quốc, Nhật Bản...' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting || isUploading}
              >
                Hủy
              </Button>
              <Button
                type='submit'
                className='gap-2 bg-[#004643] hover:bg-[#004643]/90'
                disabled={isSubmitting || isUploading}
              >
                {isSubmitting && <Loader2 className='size-4 animate-spin' />}
                {isUpdate ? 'Cập nhật' : 'Tạo'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
