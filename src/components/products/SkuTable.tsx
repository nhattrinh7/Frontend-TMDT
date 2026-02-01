'use client'

import { useMemo, useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { ImagePlus, Loader2, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'
import {
  Classification,
  ProductVariantInput,
} from '~/zodSchema/product.schema'

type SkuTableProps = {
  classifications: Classification[]
  value: ProductVariantInput[]
  onChange: (variants: ProductVariantInput[]) => void
  onUploadImage: (file: File) => Promise<string>
  disabled?: boolean
}

// Generate cartesian product of options
function generateSkuCombinations(
  classifications: Classification[]
): { sku: string; labels: string[] }[] {
  if (classifications.length === 0) return []

  // Filter out classifications with empty options
  const validClassifications = classifications.filter(
    (c) => c.name && c.options.length > 0 && c.options.some((o) => o.value)
  )

  if (validClassifications.length === 0) return []

  const optionArrays = validClassifications.map((c) =>
    c.options.filter((o) => o.value).map((o) => o.value)
  )

  // Cartesian product
  const cartesian = (arr: string[][]): string[][] => {
    if (arr.length === 0) return [[]]
    const [first, ...rest] = arr
    const restProduct = cartesian(rest)
    return first.flatMap((x) => restProduct.map((r) => [x, ...r]))
  }

  const combinations = cartesian(optionArrays)

  return combinations.map((combo) => ({
    sku: combo.join('-'),
    labels: combo,
  }))
}

export default function SkuTable({
  classifications,
  value = [],
  onChange,
  onUploadImage,
  disabled = false,
}: SkuTableProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const inputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({})

  // Generate SKU combinations từ classifications
  const skuCombinations = useMemo(
    () => generateSkuCombinations(classifications),
    [classifications]
  )

  // Sync variants với combinations
  const variants: ProductVariantInput[] = useMemo(() => {
    if (skuCombinations.length === 0) return []

    return skuCombinations.map((combo) => {
      // 1. Tìm variant đã có (Exact match)
      const existing = value.find((v) => v.sku === combo.sku)
      if (existing) return existing

      // 2. Tìm variant "gần đúng" nhất bằng cách đếm số tokens trùng khớp
      // Ví dụ: Có "Đỏ-M", thêm "L" -> "Đỏ-L" sẽ kế thừa từ "Đỏ-M" (1 token match)
      const newTokens = combo.sku.split('-')
      
      let bestMatch: ProductVariantInput | undefined
      let bestMatchCount = 0
      
      for (const v of value) {
        const oldTokens = v.sku.split('-')
        const matchCount = newTokens.filter((t) => oldTokens.includes(t)).length
        if (matchCount > bestMatchCount) {
          bestMatchCount = matchCount
          bestMatch = v
        }
      }

      if (bestMatch) {
        // Kế thừa dữ liệu từ variant cũ, nhưng dùng SKU mới và bỏ ID (để backend tạo mới nếu cần)
        return {
          sku: combo.sku,
          price: bestMatch.price,
          stock: bestMatch.stock,
          image: bestMatch.image,
          id: undefined, // Reset ID để tránh trùng lặp variant ID khi tách 1 variant thành nhiều
        }
      }

      // Tạo mới hoàn toàn nếu không tìm thấy liên quan
      return {
        sku: combo.sku,
        price: 0,
        stock: 0,
        image: null,
      }
    })
  }, [skuCombinations, value])

  // Sync variants ra ngoài khi structure thay đổi
  useEffect(() => {
    // Kiểm tra xem variants tính toán được có khác với value hiện tại không
    // So sánh độ dài trước
    if (variants.length !== value.length) {
      onChange(variants)
      return
    }

    // So sánh từng phần tử (chỉ cần so sánh SKU vì variants được derived từ skuCombinations)
    const isDifferent = variants.some((v, i) => v.sku !== value[i]?.sku)
    
    if (isDifferent) {
      onChange(variants)
    }
  }, [variants, value, onChange])

  // Update variant tại index
  const updateVariant = useCallback(
    (index: number, updates: Partial<ProductVariantInput>) => {
      const newVariants = [...variants]
      newVariants[index] = { ...newVariants[index], ...updates }
      onChange(newVariants)
    },
    [variants, onChange]
  )

  // Handle image upload
  const handleImageUpload = useCallback(
    async (index: number, file: File) => {
      // Validate
      if (!file.type.startsWith('image/')) return
      if (file.size > 5 * 1024 * 1024) return

      setUploadingIndex(index)

      try {
        const url = await onUploadImage(file)
        updateVariant(index, { image: url })
      } catch {
        // console.error('Upload SKU image error:', err)
      } finally {
        setUploadingIndex(null)
        // Reset input
        if (inputRefs.current[index]) {
          inputRefs.current[index]!.value = ''
        }
      }
    },
    [onUploadImage, updateVariant]
  )

  // Handle remove image
  const handleRemoveImage = useCallback(
    (index: number) => {
      updateVariant(index, { image: null })
    },
    [updateVariant]
  )

  if (skuCombinations.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-6 text-center border rounded-lg bg-muted/30">
        Thêm phân loại hàng để tạo danh sách SKU
      </div>
    )
  }

  // Get classification names for headers
  const classificationNames = classifications
    .filter((c) => c.name && c.options.length > 0)
    .map((c) => c.name)

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {classificationNames.map((name) => (
              <TableHead key={name} className="font-medium">
                {name}
              </TableHead>
            ))}
            <TableHead className="font-medium">Giá (VNĐ)</TableHead>
            <TableHead className="font-medium">Số lượng</TableHead>
            <TableHead className="font-medium w-24">Ảnh</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((variant, index) => (
            <TableRow key={variant.sku}>
              {/* Labels từ combination */}
              {skuCombinations[index]?.labels.map((label, i) => (
                <TableCell key={i} className="font-medium">
                  {label}
                </TableCell>
              ))}

              {/* Giá */}
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={variant.price || ''}
                  onChange={(e) =>
                    updateVariant(index, {
                      price: parseInt(e.target.value) || 0,
                    })
                  }
                  disabled={disabled}
                  className="w-28"
                />
              </TableCell>

              {/* Số lượng */}
              <TableCell>
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={variant.stock || ''}
                  onChange={(e) =>
                    updateVariant(index, {
                      stock: parseInt(e.target.value) || 0,
                    })
                  }
                  disabled={disabled}
                  className="w-24"
                />
              </TableCell>

              {/* Ảnh SKU */}
              <TableCell>
                <input
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(index, file)
                  }}
                  className="hidden"
                  disabled={disabled || uploadingIndex === index}
                />

                {variant.image ? (
                  <div className="relative w-14 h-14 group">
                    <Image
                      src={variant.image}
                      alt={variant.sku}
                      fill
                      className="object-cover rounded border"
                    />
                    {!disabled && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-1 -right-1 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    )}
                  </div>
                ) : uploadingIndex === index ? (
                  <div className="w-14 h-14 border rounded flex items-center justify-center bg-muted/30">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => inputRefs.current[index]?.click()}
                    disabled={disabled}
                    className={cn(
                      'w-14 h-14 border-2 border-dashed rounded',
                      'flex items-center justify-center',
                      'text-muted-foreground hover:text-foreground',
                      'hover:border-primary transition-colors',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    <ImagePlus className="h-4 w-4" />
                  </button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
