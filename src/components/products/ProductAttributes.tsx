'use client'

import { useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { CategoryWithChildren, normalizeAttributes, NormalizedAttribute } from '~/zodSchema/category.schema'
import { CreateProductInput } from '~/zodSchema/product.schema'

type ProductAttributesProps = {
  category: CategoryWithChildren | null
  form: UseFormReturn<CreateProductInput>
}

export default function ProductAttributes({
  category,
  form,
}: ProductAttributesProps) {
  // Chuẩn hóa attributes từ cả 2 format (string[] hoặc object[])
  const attributes: NormalizedAttribute[] = normalizeAttributes(category?.attributes)

  // Reset attributes khi category thay đổi
  const categoryId = category?.id
  useEffect(() => {
    if (categoryId) {
      // Clear all current attributes
      form.setValue('attributes', {})
    }
  }, [categoryId, form])

  if (!category || attributes.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center border rounded-lg bg-muted/30">
        {category
          ? 'Ngành hàng này không có thuộc tính đặc biệt'
          : 'Vui lòng chọn ngành hàng để hiển thị các thuộc tính'}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm">Thuộc tính ngành hàng</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {attributes.map((attr, index) => (
          <FormField
            key={`${attr.name}-${index}`}
            control={form.control}
            name={`attributes.${attr.name}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {attr.name}
                  {attr.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={`Nhập ${attr.name.toLowerCase()}`}
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  )
}
