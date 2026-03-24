'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Loader2, Package, Save } from 'lucide-react'

// UI Components
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Separator } from '~/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '~/components/ui/form'

// Product Components
import CategorySelector from '~/app/(private)/shop/products/new/CategorySelector'
import ImageUploader from '~/app/(private)/shop/products/update/ImageUploader'
import GalleryUploader from '~/app/(private)/shop/products/update/GalleryUploader'
import VideoUploader from '~/app/(private)/shop/products/update/VideoUploader'
import ProductAttributes from '~/app/(private)/shop/products/new/ProductAttributes'
import VariantClassifications from '~/app/(private)/shop/products/update/VariantClassifications'
import SkuTable from '~/app/(private)/shop/products/update/SkuTable'

// API & Schema
import { getCategoriesAPI } from '~/apiRequests/category.apiRequest'
import {
  uploadImageAPI,
  uploadVideoAPI,
  createProductAPI,
} from '~/apiRequests/product.apiRequest'
import { CategoryWithChildren } from '~/zodSchema/category.schema'
import {
  CreateProductSchema,
  CreateProductInput,
  Classification,
  ProductVariantInput,
} from '~/zodSchema/product.schema'

// Zustand
import { useBoundStore } from '~/zustand/store'

export default function NewProductPage() {
  const { shop } = useBoundStore()

  // States
  const [categories, setCategories] = useState<CategoryWithChildren[]>([])
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithChildren | null>(null)
  const [classifications, setClassifications] = useState<Classification[]>([])
  const [variants, setVariants] = useState<ProductVariantInput[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form
  const form = useForm<CreateProductInput>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      name: '',
      descriptions: '',
      categoryId: '',
      mainImage: '',
      galleryImage: [],
      video: null,
      unit: '',
      attributes: {},
      variants: [],
    },
  })

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true)
      try {
        const data = await getCategoriesAPI()
        // getCategoriesAPI đã return response.data nên data là Category[] trực tiếp
        setCategories(data as CategoryWithChildren[])
      } catch {
        toast.error('Không thể tải danh sách ngành hàng')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Sync variants với form
  useEffect(() => {
    form.setValue('variants', variants)
  }, [variants, form])

  // Handle category select
  const handleCategorySelect = useCallback(
    (category: CategoryWithChildren) => {
      setSelectedCategory(category)
      form.setValue('categoryId', category.id)
      // Reset attributes khi đổi category
      form.setValue('attributes', {})
    },
    [form]
  )

  // Upload handlers
  const handleUploadImage = useCallback(async (file: File) => {
    const response = await uploadImageAPI(file)
    return response.url
  }, []) 

  const handleUploadVideo = useCallback(async (file: File) => {
    const response = await uploadVideoAPI(file)
    return response.url
  }, [])

  
  // Submit handler
  const onSubmit = async (data: CreateProductInput) => {
    if (!shop) {
      toast.error('Không tìm thấy thông tin cửa hàng')
      return
    }

    // Validate variants
    if (classifications.length > 0 && variants.length === 0) {
      toast.error('Vui lòng điền thông tin cho các phân loại hàng')
      return
    }

    // Validate variant data
    const invalidVariants = variants.filter(
      (v) => v.price <= 0 || v.stock < 0
    )
    if (invalidVariants.length > 0) {
      toast.error('Vui lòng điền đầy đủ giá và số lượng cho tất cả SKU')
      return
    }

    setIsSubmitting(true)

    try {
      // Chuyển đổi classifications sang format cho API
      const classificationsForAPI = classifications
        .filter(c => c.name && c.options.some(o => o.value))
        .map(c => ({
          name: c.name,
          values: c.options.filter(o => o.value).map(o => o.value),
        }))

      // Chuyển đổi variants để bao gồm optionValues
      const variantsForAPI = variants.map(v => {
        // SKU format: 'Đỏ-S' -> optionValues: ['Đỏ', 'S']
        const optionValues = v.sku.split('-')
        return {
          sku: v.sku,
          price: v.price,
          stock: v.stock,
          image: v.image || null,
          optionValues: classificationsForAPI.length > 0 ? optionValues : undefined,
        }
      })

      const payload = {
        ...data,
        shopId: shop.id,
        classifications: classificationsForAPI.length > 0 ? classificationsForAPI : undefined,
        variants: variantsForAPI,
      }

      await createProductAPI(payload)
      toast.success('Tạo sản phẩm thành công!')

      // Reset form
      form.reset()
      setSelectedCategory(null)
      setClassifications([])
      setVariants([])
    } catch {
      toast.error('Tạo sản phẩm thất bại. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  return (
    <div className='container max-w-4xl py-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-3'>
        <div className='p-2 rounded-lg bg-primary/10'>
          <Package className='h-6 w-6 text-primary' />
        </div>
        <div>
          <h1 className='text-2xl font-bold'>Thêm sản phẩm mới</h1>
          <p className='text-muted-foreground text-sm'>
            Điền đầy đủ thông tin để tạo sản phẩm mới cho cửa hàng
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          {/* Thông tin cơ bản */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Tên sản phẩm */}
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Tên sản phẩm <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Nhập tên sản phẩm'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mô tả */}
              <FormField
                control={form.control}
                name='descriptions'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Mô tả sản phẩm <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Nhập mô tả chi tiết về sản phẩm'
                        className='min-h-[120px] resize-y'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Đơn vị */}
              <FormField
                control={form.control}
                name='unit'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Đơn vị <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Ví dụ: Cái, Chiếc, Bộ, Hộp...'
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Đơn vị tính của sản phẩm
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Hình ảnh & Video</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Ảnh chính */}
              <FormField
                control={form.control}
                name='mainImage'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Ảnh chính <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <ImageUploader
                        value={field.value || null}
                        onChange={field.onChange}
                        onUpload={handleUploadImage}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Ảnh phụ */}
              <FormField
                control={form.control}
                name='galleryImage'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ảnh phụ</FormLabel>
                    <FormControl>
                      <GalleryUploader
                        value={field.value || []}
                        onChange={field.onChange}
                        onUpload={handleUploadImage}
                        maxImages={5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Video */}
              <FormField
                control={form.control}
                name='video'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video sản phẩm</FormLabel>
                    <FormControl>
                      <VideoUploader
                        value={field.value || null}
                        onChange={field.onChange}
                        onUpload={handleUploadVideo}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Ngành hàng */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Ngành hàng</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <FormField
                control={form.control}
                name='categoryId'
                render={() => (
                  <FormItem>
                    <FormLabel>
                      Chọn ngành hàng <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <CategorySelector
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelect={handleCategorySelect}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Thuộc tính ngành hàng */}
              {selectedCategory && (
                <>
                  <Separator />
                  <ProductAttributes
                    category={selectedCategory}
                    form={form}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Phân loại hàng */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Phân loại hàng</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <VariantClassifications
                value={classifications}
                onChange={setClassifications}
                maxClassifications={5}
              />
            </CardContent>
          </Card>

          {/* Bảng SKU */}
          {classifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Danh sách phân loại hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <SkuTable
                  classifications={classifications}
                  value={variants}
                  onChange={setVariants}
                  onUploadImage={handleUploadImage}
                />
              </CardContent>
            </Card>
          )}

          {/* Submit button */}
          <div className='flex justify-end gap-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                form.reset()
                setSelectedCategory(null)
                setClassifications([])
                setVariants([])
              }}
            >
              Hủy
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Save className='h-4 w-4 mr-2' />
                  Tạo sản phẩm
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
