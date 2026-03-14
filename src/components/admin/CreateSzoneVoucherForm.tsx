'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Tag, X } from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'
import {
  szoneVoucherSchema,
  type SzoneVoucherFormValues,
} from '~/zodSchema/szone-voucher.schema'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { DateTimePicker } from '~/components/DateTimePicker'
import { Checkbox } from '~/components/ui/checkbox'
import { createSzoneVoucherAPI } from '~/apiRequests/voucher.apiRequest'
import { getRootCategoriesAPI } from '~/apiRequests/category.apiRequest'
import { toast } from 'sonner'



interface Category {
  id: string
  name: string
}

interface CreateSzoneVoucherFormProps {
  onClose: () => void
  onSuccess?: () => void
}



export function CreateSzoneVoucherForm({
  onClose,
  onSuccess,
}: CreateSzoneVoucherFormProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)

  const form = useForm<SzoneVoucherFormValues>({
    resolver: zodResolver(szoneVoucherSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      discountType: 'PERCENT',
      discountValue: 0,
      minOrderValue: 0,
      maxDiscountValue: undefined,
      usageLimit: 100,
      perUserLimit: 1,
      scope: 'ALL',
      selectedCategories: [],
    },
  })

  const watchScope = form.watch('scope')
  const watchDiscountType = form.watch('discountType')

  // Fetch categories when scope changes to CATEGORY
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true)
    try {
      const response = await getRootCategoriesAPI()
      setCategories(response.data)
    } catch {
      toast.error('Không thể tải danh sách ngành hàng')
    } finally {
      setCategoriesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (watchScope === 'CATEGORY' && categories.length === 0) {
      fetchCategories()
    }
  }, [watchScope, categories.length, fetchCategories])

  // Toggle category selection
  const toggleCategorySelection = useCallback(
    (categoryId: string) => {
      setSelectedCategories((prev) => {
        const newSelection = prev.includes(categoryId)
          ? prev.filter((id) => id !== categoryId)
          : [...prev, categoryId]
        // Use setTimeout to defer form.setValue to avoid setState during render
        setTimeout(() => form.setValue('selectedCategories', newSelection), 0)
        return newSelection
      })
    },
    [form],
  )

  // Remove category from selection
  const removeCategory = (categoryId: string) => {
    const newSelected = selectedCategories.filter((id) => id !== categoryId)
    setSelectedCategories(newSelected)
    form.setValue('selectedCategories', newSelected)
  }

  const onSubmit = async (data: SzoneVoucherFormValues) => {
    try {
      const dataToCreate = {
        code: data.code,
        name: data.name,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue,
        maxDiscountValue:
          data.discountType === 'PERCENT' ? data.maxDiscountValue : undefined,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        usageLimit: data.usageLimit,
        perUserLimit: data.perUserLimit,
        scope: data.scope,
        selectedCategories:
          data.scope === 'CATEGORY' ? data.selectedCategories : undefined,
      }

      await createSzoneVoucherAPI(dataToCreate)
      toast.success('Tạo Szone voucher thành công!')
      onSuccess?.()
      onClose()
    } catch {
      toast.error('Không thể tạo Szone voucher')
    }
  }

  return (
    <Card className='max-w-4xl mx-auto border-[#004643]/20 shadow-lg bg-white'>
      <CardHeader className='bg-[#f0f7f6] border-b border-[#004643]/10'>
        <CardTitle className='text-2xl font-bold text-[#004643]'>
          Tạo Szone Voucher Mới
        </CardTitle>
        <CardDescription className='text-[#004643]/70 font-semibold'>
          Điền thông tin để tạo voucher giảm giá toàn sàn
        </CardDescription>
      </CardHeader>
      <CardContent className='pt-6 bg-white'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Mã voucher và Tên */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <FormField
                control={form.control}
                name='code'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-[#004643] font-semibold'>
                      Mã Voucher <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='VD: SZONE2024'
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                        className='border-[#004643]/20 focus:border-[#004643] bg-white text-gray-900'
                      />
                    </FormControl>
                    <FormDescription className='text-xs'>
                      Chỉ sử dụng chữ in hoa và số
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-[#004643] font-semibold'>
                      Tên Voucher <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='VD: Giảm giá toàn sàn'
                        {...field}
                        className='border-[#004643]/20 focus:border-[#004643] bg-white text-gray-900'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Mô tả */}
            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-[#004643] font-semibold'>
                    Mô Tả <span className='text-red-500'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Nhập mô tả chi tiết về voucher...'
                      className='min-h-[100px] border-[#004643]/20 focus:border-[#004643] bg-white text-gray-900'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kiểu giảm giá và Giá trị */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <FormField
                control={form.control}
                name='discountType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-[#004643] font-semibold'>
                      Kiểu Giảm Giá <span className='text-red-500'>*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className='border-[#004643]/20 focus:border-[#004643] bg-white text-gray-900'>
                          <SelectValue placeholder='Chọn kiểu giảm giá' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className='bg-white'>
                        <SelectItem value='PERCENT' className='text-gray-900'>
                          Phần trăm (%)
                        </SelectItem>
                        <SelectItem value='FIXED' className='text-gray-900'>
                          Số tiền cố định (VNĐ)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='discountValue'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-[#004643] font-semibold'>
                      Giá Trị Giảm <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type='number'
                          placeholder={
                            watchDiscountType === 'PERCENT'
                              ? 'VD: 10'
                              : 'VD: 50000'
                          }
                          {...field}
                          className='border-[#004643]/20 focus:border-[#004643] pr-12 bg-white text-gray-900'
                        />
                        <span className='absolute right-3 top-1/2 -translate-y-1/2 text-[#004643]/70 font-semibold'>
                          {watchDiscountType === 'PERCENT' ? '%' : 'VNĐ'}
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Ngày bắt đầu và kết thúc */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <FormField
                control={form.control}
                name='startDate'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel className='text-[#004643] font-semibold'>
                      Ngày Bắt Đầu <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        placeholder='Chọn ngày và giờ bắt đầu'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='endDate'
                render={({ field }) => (
                  <FormItem className='flex flex-col'>
                    <FormLabel className='text-[#004643] font-semibold'>
                      Ngày Kết Thúc <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <DateTimePicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        placeholder='Chọn ngày và giờ kết thúc'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Giới hạn sử dụng */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <FormField
                control={form.control}
                name='usageLimit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-[#004643] font-semibold'>
                      Tổng Số Lượt Sử Dụng{' '}
                      <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='VD: 100'
                        {...field}
                        className='border-[#004643]/20 focus:border-[#004643] bg-white text-gray-900'
                      />
                    </FormControl>
                    <FormDescription className='text-xs'>
                      Tổng số lần voucher có thể được sử dụng
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='perUserLimit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-[#004643] font-semibold'>
                      Giới Hạn Mỗi Người <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='VD: 1'
                        {...field}
                        className='border-[#004643]/20 focus:border-[#004643] bg-white text-gray-900'
                      />
                    </FormControl>
                    <FormDescription className='text-xs'>
                      Số lần mỗi người có thể sử dụng voucher
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Giá trị đơn hàng tối thiểu và Mức giảm tối đa */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <FormField
                control={form.control}
                name='minOrderValue'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-[#004643] font-semibold'>
                      Giá Trị Đơn Hàng Tối Thiểu{' '}
                      <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <div className='relative'>
                        <Input
                          type='number'
                          placeholder='VD: 100000'
                          {...field}
                          className='border-[#004643]/20 focus:border-[#004643] pr-12 bg-white text-gray-900'
                        />
                        <span className='absolute right-3 top-1/2 -translate-y-1/2 text-[#004643]/70 font-semibold'>
                          VNĐ
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription className='text-xs'>
                      Giá trị đơn hàng tối thiểu để áp dụng voucher
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchDiscountType === 'PERCENT' && (
                <FormField
                  control={form.control}
                  name='maxDiscountValue'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-[#004643] font-semibold'>
                        Mức Giảm Tối Đa
                      </FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input
                            type='number'
                            placeholder='VD: 100000'
                            {...field}
                            className='border-[#004643]/20 focus:border-[#004643] pr-12 bg-white text-gray-900'
                          />
                          <span className='absolute right-3 top-1/2 -translate-y-1/2 text-[#004643]/70 font-semibold'>
                            VNĐ
                          </span>
                        </div>
                      </FormControl>
                      <FormDescription className='text-xs'>
                        Số tiền giảm tối đa khi áp dụng voucher phần trăm
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Phạm vi áp dụng */}
            <FormField
              control={form.control}
              name='scope'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-[#004643] font-semibold'>
                    Phạm Vi Áp Dụng <span className='text-red-500'>*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='border-[#004643]/20 focus:border-[#004643] bg-white text-gray-900'>
                        <SelectValue placeholder='Chọn phạm vi áp dụng' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className='bg-white'>
                      <SelectItem value='ALL' className='text-gray-900'>
                        Toàn sàn
                      </SelectItem>
                      <SelectItem value='CATEGORY' className='text-gray-900'>
                        Ngành hàng cụ thể
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className='text-xs'>
                    Voucher sẽ áp dụng cho toàn sàn hoặc chỉ một số ngành hàng
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Chọn ngành hàng */}
            {watchScope === 'CATEGORY' && (
              <FormField
                control={form.control}
                name='selectedCategories'
                render={() => (
                  <FormItem>
                    <FormLabel className='text-[#004643] font-semibold'>
                      Ngành Hàng Áp Dụng <span className='text-red-500'>*</span>
                    </FormLabel>
                    <FormControl>
                      <div className='space-y-3 text-gray-700'>
                        {/* Danh sách ngành hàng đã chọn */}
                        {selectedCategories.length > 0 && (
                          <div className='flex flex-wrap gap-2 p-3 border border-[#004643]/20 rounded-md bg-[#f0f7f6]'>
                            {selectedCategories.map((categoryId) => {
                              const category = categories.find(
                                (c) => c.id === categoryId,
                              )
                              return category ? (
                                <div
                                  key={categoryId}
                                  className='flex items-center gap-1 px-2 py-1 bg-[#004643] text-white rounded-md text-sm'
                                >
                                  <Tag className='h-3 w-3' />
                                  <span>{category.name}</span>
                                  <button
                                    type='button'
                                    onClick={() => removeCategory(categoryId)}
                                    className='ml-1 hover:opacity-70'
                                  >
                                    <X className='h-3 w-3' />
                                  </button>
                                </div>
                              ) : null
                            })}
                          </div>
                        )}

                        {/* Danh sách tất cả ngành hàng */}
                        {categoriesLoading ? (
                          <div className='flex items-center justify-center p-4'>
                            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-[#004643]'></div>
                          </div>
                        ) : (
                          <div className='border border-[#004643]/20 rounded-md divide-y divide-[#004643]/10 max-h-[300px] overflow-y-auto'>
                            {categories.map((category) => (
                              <label
                                key={category.id}
                                className='flex items-center gap-3 p-3 hover:bg-[#f0f7f6] cursor-pointer'
                              >
                                <Checkbox
                                  checked={selectedCategories.includes(
                                    category.id,
                                  )}
                                  onCheckedChange={() =>
                                    toggleCategorySelection(category.id)
                                  }
                                  className='border-[#004643]/30 data-[state=checked]:bg-[#004643] data-[state=checked]:border-[#004643]'
                                />
                                <Tag className='h-4 w-4 text-[#004643]' />
                                <span className='text-sm font-medium text-gray-900'>
                                  {category.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Buttons */}
            <div className='flex gap-4 pt-4 border-t border-[#004643]/10'>
              <Button
                type='button'
                variant='outline'
                onClick={onClose}
                className='flex-1 border-[#004643]/20 text-[#004643] hover:bg-[#004643]/5'
              >
                Hủy
              </Button>
              <Button
                type='submit'
                className='flex-1 bg-[#004643] hover:bg-[#003330] text-white'
              >
                Tạo Szone Voucher
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
