'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  Star,
  Calendar,
  Package,
  Tag,
  AlertCircle,
  ImageIcon,
  Play,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Separator } from '~/components/ui/separator'
import { toast } from 'sonner'
import { ProductDetail } from '~/zodSchema/product.schema'
import { getProductByIdAPI } from '~/apiRequests/product.apiRequest'
import { formatPrice, formatRating } from '~/lib/utils'

function ProductViewLoading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function ProductViewPage() {
  return (
    <Suspense fallback={<ProductViewLoading />}>
      <ProductViewContent />
    </Suspense>
  )
}

function ProductViewContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const productId = searchParams.get('id')

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string>('')

  // Fetch product data
  useEffect(() => {
    const fetchData = async () => {
      if (!productId) {
        toast.error('Không tìm thấy ID sản phẩm')
        router.push('/shop/products')
        return
      }

      try {
        setIsLoading(true)
        const productData = await getProductByIdAPI(productId)
        if (!productData) {
          toast.error('Không tìm thấy sản phẩm')
          router.push('/shop/products')
          return
        }

        setProduct(productData)
        setSelectedImage(productData.mainImage)
      } catch (error) {
        console.error('Failed to fetch product:', error)
        toast.error('Không thể tải thông tin sản phẩm')
        router.push('/shop/products')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [productId, router])

  // Get status badge based on product state
  const getStatusBadge = () => {
    if (!product) return null

    if (product.approveStatus === 'REJECTED') {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="size-3" />
          Không được duyệt
        </Badge>
      )
    }
    if (product.approveStatus === 'PENDING') {
      return (
        <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700">
          <Loader2 className="size-3" />
          Chờ duyệt
        </Badge>
      )
    }
    if (!product.isActive) {
      return (
        <Badge variant="outline" className="gap-1">
          <Package className="size-3" />
          Đang ẩn
        </Badge>
      )
    }
    return (
      <Badge className="gap-1 bg-emerald-500 hover:bg-emerald-600">
        <Package className="size-3" />
        Đang hoạt động
      </Badge>
    )
  }

  // Format date for display
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Calculate summary
  const getSummary = () => {
    if (!product) return { totalStock: 0, totalSold: 0, priceRange: 'N/A' }

    const variants = product.variants || []
    const prices = variants.map((v) => v.price)
    const stocks = variants.map((v) => v.stock || 0)
    const soldQuantities = variants.map((v) => v.soldQuantity || 0)

    return {
      priceRange:
        prices.length > 0
          ? prices.length === 1
            ? formatPrice(prices[0])
            : `${formatPrice(Math.min(...prices))} - ${formatPrice(Math.max(...prices))}`
          : 'N/A',
      totalStock: stocks.reduce((sum, s) => sum + s, 0),
      totalSold: soldQuantities.reduce((sum, s) => sum + s, 0),
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="text-muted-foreground">Đang tải thông tin sản phẩm...</span>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Không tìm thấy sản phẩm</div>
      </div>
    )
  }

  const summary = getSummary()
  const allImages = [product.mainImage, ...(product.galleryImage || [])]

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/shop/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#004643]">Chi tiết sản phẩm</h1>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground">
              Xem thông tin chi tiết của sản phẩm
            </p>
          </div>
        </div>
        <Link href={`/shop/products/update?id=${product.id}`}>
          <Button className="gap-2 bg-[#004643] hover:bg-[#004643]/90">
            Chỉnh sửa sản phẩm
          </Button>
        </Link>
      </div>

      {/* Reject Reason Alert */}
      {product.approveStatus === 'REJECTED' && product.rejectReason && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div>
            <p className="font-medium text-destructive">Lý do không được duyệt</p>
            <p className="mt-1 text-sm text-destructive/80">{product.rejectReason}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Product Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Package className="size-5 text-[#004643]" />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tên sản phẩm
                </label>
                <p className="mt-1 text-lg font-semibold">{product.name}</p>
              </div>

              <Separator />

              <div>
                <label className="text-sm font-medium text-muted-foreground">Mô tả</label>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                  {product.descriptions}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Đơn vị tính
                  </label>
                  <p className="mt-1 font-medium">{product.unit}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ngành hàng
                  </label>
                  <p className="mt-1 font-medium">
                    {product.category?.name || 'Chưa phân loại'}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-sm text-muted-foreground">Khoảng giá</p>
                  <p className="mt-1 font-semibold text-[#004643]">{summary.priceRange}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-sm text-muted-foreground">Tổng tồn kho</p>
                  <p className="mt-1 font-semibold text-[#004643]">{summary.totalStock}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-center">
                  <p className="text-sm text-muted-foreground">Đã bán</p>
                  <p className="mt-1 font-semibold text-[#004643]">{summary.totalSold}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attributes Card */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Tag className="size-5 text-[#004643]" />
                  Thuộc tính sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(product.attributes as Record<string, string>).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
                      >
                        <span className="text-sm font-medium text-muted-foreground">
                          {key}
                        </span>
                        <span className="font-medium">{value}</span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Variants Table Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Package className="size-5 text-[#004643]" />
                Danh sách phân loại hàng ({product.variants?.length || 0} SKU)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-16">Ảnh</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Giá</TableHead>
                      <TableHead className="text-right">Tồn kho</TableHead>
                      <TableHead className="text-right">Đã bán</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.variants?.map((variant) => (
                      <TableRow key={variant.id}>
                        <TableCell>
                          {variant.image ? (
                            <div className="relative size-12 overflow-hidden rounded-md border">
                              <Image
                                src={variant.image}
                                alt={variant.sku}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex size-12 items-center justify-center rounded-md border bg-muted">
                              <ImageIcon className="size-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{variant.sku}</TableCell>
                        <TableCell className="text-right font-semibold text-[#004643]">
                          {formatPrice(variant.price)}
                        </TableCell>
                        <TableCell className="text-right">{variant.stock || 0}</TableCell>
                        <TableCell className="text-right">
                          {variant.soldQuantity || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5 text-[#004643]" />
                Thông tin bổ sung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Star className="size-4" />
                    <span className="text-sm">Đánh giá</span>
                  </div>
                  <p className="mt-1 font-semibold">
                    {formatRating(product.ratingAvg)} / 5{' '}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({product.ratingCount} lượt)
                    </span>
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="size-4" />
                    <span className="text-sm">Ngày tạo</span>
                  </div>
                  <p className="mt-1 font-medium">{formatDate(product.createdAt)}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="size-4" />
                    <span className="text-sm">Cập nhật lần cuối</span>
                  </div>
                  <p className="mt-1 font-medium">{formatDate(product.updatedAt)}</p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="size-4" />
                    <span className="text-sm">Trạng thái hiển thị</span>
                  </div>
                  <p className="mt-1 font-medium">
                    {product.isActive ? 'Hiển thị' : 'Đang ẩn'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Media */}
        <div className="space-y-6">
          {/* Main Image Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="size-5 text-[#004643]" />
                Hình ảnh sản phẩm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected Image */}
              <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      className={`relative size-16 overflow-hidden rounded-md border-2 transition-all ${
                        selectedImage === img
                          ? 'border-[#004643] ring-2 ring-[#004643]/20'
                          : 'border-transparent hover:border-muted-foreground/50'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} - ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Video Card */}
          {product.video && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Play className="size-5 text-[#004643]" />
                  Video sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
                  <video
                    src={product.video}
                    controls
                    className="size-full object-cover"
                    poster={product.mainImage}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
