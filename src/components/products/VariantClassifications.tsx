'use client'

import { useCallback } from 'react'
import { Plus, X, Trash2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Classification } from '~/zodSchema/product.schema'

type VariantClassificationsProps = {
  value: Classification[]
  onChange: (classifications: Classification[]) => void
  maxClassifications?: number
  disabled?: boolean
  editMode?: boolean // Khi true, kh\u00f4ng cho th\u00eam classification m\u1edbi nh\u01b0ng v\u1eabn cho x\u00f3a v\u00e0 th\u00eam/b\u1edbt option value
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 9)

export default function VariantClassifications({
  value = [],
  onChange,
  maxClassifications = 2,
  disabled = false,
  editMode = false,
}: VariantClassificationsProps) {
  // Thêm phân loại mới
  const handleAddClassification = useCallback(() => {
    if (value.length >= maxClassifications) return

    const newClassification: Classification = {
      id: generateId(),
      name: '',
      options: [],
    }
    onChange([...value, newClassification])
  }, [value, maxClassifications, onChange])

  // Xóa phân loại
  const handleRemoveClassification = useCallback(
    (classificationId: string) => {
      onChange(value.filter((c) => c.id !== classificationId))
    },
    [value, onChange],
  )

  // Cập nhật tên phân loại
  const handleUpdateClassificationName = useCallback(
    (classificationId: string, name: string) => {
      onChange(
        value.map((c) => (c.id === classificationId ? { ...c, name } : c)),
      )
    },
    [value, onChange],
  )

  // Thêm tùy chọn cho phân loại
  const handleAddOption = useCallback(
    (classificationId: string) => {
      onChange(
        value.map((c) => {
          if (c.id === classificationId) {
            return {
              ...c,
              options: [...c.options, { id: generateId(), value: '' }],
            }
          }
          return c
        }),
      )
    },
    [value, onChange],
  )

  // Xóa tùy chọn
  const handleRemoveOption = useCallback(
    (classificationId: string, optionId: string) => {
      onChange(
        value.map((c) => {
          if (c.id === classificationId) {
            return {
              ...c,
              options: c.options.filter((o) => o.id !== optionId),
            }
          }
          return c
        }),
      )
    },
    [value, onChange],
  )

  // Cập nhật giá trị tùy chọn
  const handleUpdateOptionValue = useCallback(
    (classificationId: string, optionId: string, newValue: string) => {
      onChange(
        value.map((c) => {
          if (c.id === classificationId) {
            return {
              ...c,
              options: c.options.map((o) =>
                o.id === optionId ? { ...o, value: newValue } : o,
              ),
            }
          }
          return c
        }),
      )
    },
    [value, onChange],
  )

  return (
    <div className='space-y-4'>
      {/* Danh sách phân loại */}
      {value.map((classification, index) => (
        <Card key={classification.id} className='relative'>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-base flex items-center gap-2'>
                <Badge variant='secondary'>Phân loại {index + 1}</Badge>
              </CardTitle>
              {!disabled && (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-8 w-8 p-0 text-muted-foreground hover:text-destructive'
                  onClick={() => handleRemoveClassification(classification.id)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className='space-y-4'>
            {/* Tên phân loại */}
            <div>
              <Label htmlFor={`classification-name-${classification.id}`}>
                Tên phân loại
              </Label>
              <Input
                id={`classification-name-${classification.id}`}
                placeholder='Ví dụ: Màu sắc, Kích cỡ...'
                value={classification.name}
                onChange={(e) =>
                  handleUpdateClassificationName(
                    classification.id,
                    e.target.value,
                  )
                }
                disabled={disabled}
                className='mt-1'
              />
            </div>

            {/* Danh sách tùy chọn */}
            <div>
              <Label>Các tùy chọn</Label>
              <div className='flex flex-wrap gap-2 mt-2'>
                {classification.options.map((option) => (
                  <div
                    key={option.id}
                    className='flex items-center gap-1 bg-muted rounded-lg pr-1'
                  >
                    <Input
                      placeholder='Giá trị'
                      value={option.value}
                      onChange={(e) =>
                        handleUpdateOptionValue(
                          classification.id,
                          option.id,
                          e.target.value,
                        )
                      }
                      disabled={disabled}
                      className='h-8 w-24 border-0 bg-transparent focus-visible:ring-0'
                    />
                    {!disabled && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive'
                        onClick={() =>
                          handleRemoveOption(classification.id, option.id)
                        }
                      >
                        <X className='h-3 w-3' />
                      </Button>
                    )}
                  </div>
                ))}

                {/* Nút thêm tùy chọn */}
                {!disabled && (
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='h-8'
                    onClick={() => handleAddOption(classification.id)}
                  >
                    <Plus className='h-3 w-3 mr-1' />
                    Thêm
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Nút thêm phân loại - ẩn trong editMode */}
      {!disabled && !editMode && value.length < maxClassifications && (
        <Button
          type='button'
          variant='outline'
          className='w-full border-dashed'
          onClick={handleAddClassification}
        >
          <Plus className='h-4 w-4 mr-2' />
          Thêm phân loại hàng ({value.length}/{maxClassifications})
        </Button>
      )}

      {value.length === 0 && (
        <p className='text-sm text-muted-foreground text-center py-2'>
          Thêm phân loại để tạo các biến thể sản phẩm (ví dụ: màu sắc, kích cỡ)
        </p>
      )}
    </div>
  )
}
