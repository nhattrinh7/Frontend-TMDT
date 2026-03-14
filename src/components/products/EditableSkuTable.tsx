'use client'

import { useFieldArray, UseFormReturn } from 'react-hook-form'
import Image from 'next/image'
import { ImagePlus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Input } from '~/components/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '~/components/ui/form'
import { UpdateProductInput } from '~/zodSchema/product.schema'
import { uploadImageAPI } from '~/apiRequests/product.apiRequest'
import { toast } from 'sonner'
import { useState } from 'react'

type EditableSkuTableProps = {
  form: UseFormReturn<UpdateProductInput>
}

export default function EditableSkuTable({ form }: EditableSkuTableProps) {
  const { fields } = useFieldArray({
    control: form.control,
    name: 'variants',
  })
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)

  const handleImageUpload = async (index: number, file: File) => {
    try {
      setUploadingIndex(index)
      const response = await uploadImageAPI(file)
      if (response?.url) {
        form.setValue(`variants.${index}.image`, response.url)
        toast.success('Đã tải ảnh lên thành công')
      }
    } catch {
      toast.error('Không thể tải ảnh lên')
    } finally {
      setUploadingIndex(null)
    }
  }

  if (fields.length === 0) {
    return (
      <div className='flex h-32 items-center justify-center rounded-lg border text-muted-foreground'>
        Không có SKU nào
      </div>
    )
  }

  return (
    <div className='rounded-lg border'>
      <Table>
        <TableHeader>
          <TableRow className='bg-muted/50'>
            <TableHead className='w-20'>Ảnh</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className='w-40'>Giá (VNĐ)</TableHead>
            <TableHead className='w-32'>Kho</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((field, index) => (
            <TableRow key={field.id}>
              {/* Image */}
              <TableCell>
                <label className='relative block size-14 cursor-pointer overflow-hidden rounded-md border hover:border-primary'>
                  {form.watch(`variants.${index}.image`) ? (
                    <Image
                      src={form.watch(`variants.${index}.image`) || ''}
                      alt={field.sku}
                      fill
                      className='object-cover'
                    />
                  ) : (
                    <div className='flex size-full items-center justify-center bg-muted'>
                      {uploadingIndex === index ? (
                        <span className='text-xs'>...</span>
                      ) : (
                        <ImagePlus className='size-4 text-muted-foreground' />
                      )}
                    </div>
                  )}
                  <input
                    type='file'
                    accept='image/*'
                    className='sr-only'
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(index, file)
                    }}
                    disabled={uploadingIndex !== null}
                  />
                </label>
              </TableCell>

              {/* SKU (readonly) */}
              <TableCell>
                <span className='font-mono text-sm'>{field.sku}</span>
              </TableCell>

              {/* Price */}
              <TableCell>
                <FormField
                  control={form.control}
                  name={`variants.${index}.price`}
                  render={({ field: priceField }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          value={priceField.value || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            priceField.onChange(val === '' ? 0 : parseInt(val, 10) || 0)
                          }}
                          onBlur={priceField.onBlur}
                          name={priceField.name}
                          ref={priceField.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TableCell>

              {/* Stock */}
              <TableCell>
                <FormField
                  control={form.control}
                  name={`variants.${index}.stock`}
                  render={({ field: stockField }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          value={stockField.value || ''}
                          onChange={(e) => {
                            const val = e.target.value
                            stockField.onChange(val === '' ? 0 : parseInt(val, 10) || 0)
                          }}
                          onBlur={stockField.onBlur}
                          name={stockField.name}
                          ref={stockField.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
