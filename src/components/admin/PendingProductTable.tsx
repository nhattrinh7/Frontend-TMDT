'use client'

import Image from 'next/image'
import { Fragment, useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Package,
  Store,
  Tag,
  Check,
  X,
  ImageIcon,
  Layers,
  Info,
  Play,
} from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Badge } from '~/components/ui/badge'
import { AdminProduct } from '~/zodSchema/product.schema'
import RejectProductDialog from './RejectProductDialog'

type PendingProductTableProps = {
  products: AdminProduct[]
  onApprove: (productId: string) => void
  onReject: (productId: string, rejectReason: string) => void
  isLoading?: boolean
  actioningProductId?: string
}

export default function PendingProductTable({
  products,
  onApprove,
  onReject,
  isLoading = false,
  actioningProductId,
}: PendingProductTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [approveDialog, setApproveDialog] = useState<{
    open: boolean
    productId: string
    productName: string
  }>({
    open: false,
    productId: '',
    productName: '',
  })
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean
    productId: string
    productName: string
  }>({
    open: false,
    productId: '',
    productName: '',
  })
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  const toggleRow = (productId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const handleApproveConfirm = () => {
    onApprove(approveDialog.productId)
    setApproveDialog({ open: false, productId: '', productName: '' })
  }

  const handleRejectConfirm = (rejectReason: string) => {
    onReject(rejectDialog.productId, rejectReason)
    setRejectDialog({ open: false, productId: '', productName: '' })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2">
        <Package className="size-12 text-muted-foreground" />
        <div className="text-muted-foreground">Không có sản phẩm nào cần duyệt</div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-10"></TableHead>
              <TableHead className="w-20">Ảnh</TableHead>
              <TableHead className="min-w-[200px]">Tên sản phẩm</TableHead>
              <TableHead className="min-w-[150px]">Shop</TableHead>
              <TableHead className="min-w-[120px]">Danh mục</TableHead>
              <TableHead className="min-w-[100px]">Giá</TableHead>
              <TableHead className="min-w-[140px]">Ngày tạo</TableHead>
              <TableHead className="w-48 text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <Fragment key={product.id}>
                <TableRow
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => toggleRow(product.id)}
                >
                  {/* Expand Icon */}
                  <TableCell>
                    {expandedRows.has(product.id) ? (
                      <ChevronUp className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    )}
                  </TableCell>

                  {/* Main Image */}
                  <TableCell>
                    {product.mainImage ? (
                      <div className="relative size-14 overflow-hidden rounded-lg border shadow-sm">
                        <Image
                          src={product.mainImage}
                          alt={product.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex size-14 items-center justify-center rounded-lg border bg-muted">
                        <Package className="size-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>

                  {/* Product Name */}
                  <TableCell>
                    <div className="font-semibold text-[#004643] line-clamp-2">{product.name}</div>
                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px] mt-1">
                      {product.descriptions}
                    </p>
                  </TableCell>

                  {/* Shop */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {product.shop.logo ? (
                        <div className="relative size-8 overflow-hidden rounded-full border">
                          <Image
                            src={product.shop.logo}
                            alt={product.shop.name}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex size-8 items-center justify-center rounded-full border bg-muted">
                          <Store className="size-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-sm font-medium">{product.shop.name}</span>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Badge variant="secondary" className="gap-1">
                      <Tag className="size-3" />
                      {product.category.name}
                    </Badge>
                  </TableCell>

                  {/* Price Range */}
                  <TableCell>
                    {product.variants && product.variants.length > 0 ? (
                      <div className="text-sm font-medium">
                        {product.variants.length === 1 ? (
                          formatCurrency(product.variants[0].price)
                        ) : (
                          <>
                            {formatCurrency(Math.min(...product.variants.map(v => v.price)))}
                            {Math.min(...product.variants.map(v => v.price)) !== Math.max(...product.variants.map(v => v.price)) && (
                              <span className="text-muted-foreground"> - {formatCurrency(Math.max(...product.variants.map(v => v.price)))}</span>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </TableCell>

                  {/* Created At */}
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(product.createdAt)}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        className="gap-1 bg-green-600 hover:bg-green-700"
                        onClick={() =>
                          setApproveDialog({
                            open: true,
                            productId: product.id,
                            productName: product.name,
                          })
                        }
                        disabled={actioningProductId === product.id}
                      >
                        <Check className="size-4" />
                        {actioningProductId === product.id ? 'Đang...' : 'Duyệt'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1"
                        onClick={() =>
                          setRejectDialog({
                            open: true,
                            productId: product.id,
                            productName: product.name,
                          })
                        }
                        disabled={actioningProductId === product.id}
                      >
                        <X className="size-4" />
                        Không duyệt
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>

                {/* Expanded Content */}
                {expandedRows.has(product.id) && (
                  <TableRow className="bg-muted/20 hover:bg-muted/20">
                    <TableCell colSpan={8}>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
                        {/* Attributes */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-[#004643]">
                            <Info className="size-4" />
                            Thuộc tính sản phẩm
                          </div>
                          <div className="space-y-2">
                            {product.attributes && Object.entries(product.attributes).length > 0 ? (
                              Object.entries(product.attributes).map(([key, value]) => (
                                <div key={key} className="flex text-sm">
                                  <span className="text-muted-foreground w-32 shrink-0">{key}:</span>
                                  <span className="font-medium">{value}</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">Không có thuộc tính</span>
                            )}
                          </div>
                        </div>

                        {/* Variants */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-[#004643]">
                            <Layers className="size-4" />
                            Phân loại ({product.variants?.length || 0})
                          </div>
                          <div 
                            className="space-y-2 max-h-48 overflow-y-auto rounded-md p-2"
                            style={{
                              scrollbarWidth: 'thin',
                              scrollbarColor: '#9ca3af #ffffff',
                            }}
                          >
                            {product.variants && product.variants.length > 0 ? (
                              product.variants.map((variant) => (
                                <div
                                  key={variant.id}
                                  className="flex items-center gap-3 p-2 rounded-md border bg-background"
                                >
                                  {variant.image ? (
                                    <div className="relative size-10 overflow-hidden rounded border">
                                      <Image
                                        src={variant.image}
                                        alt={variant.sku}
                                        fill
                                        sizes="40px"
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex size-10 items-center justify-center rounded border bg-muted">
                                      <Package className="size-4 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">{variant.sku}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {formatCurrency(variant.price)}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">Không có phân loại</span>
                            )}
                          </div>
                        </div>

                        {/* Gallery Images & Video */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-[#004643]">
                            <ImageIcon className="size-4" />
                            Ảnh sản phẩm ({1 + (product.galleryImage?.length || 0)})
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {/* Main Image */}
                            <div className="relative size-20 overflow-hidden rounded-lg border-2 border-primary shadow-sm">
                              <Image
                                src={product.mainImage}
                                alt="Ảnh chính"
                                fill
                                sizes="80px"
                                className="object-cover"
                              />
                              <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-[10px] text-primary-foreground text-center py-0.5">
                                Ảnh chính
                              </span>
                            </div>
                            {/* Gallery Images */}
                            {product.galleryImage && product.galleryImage.length > 0 && (
                              product.galleryImage.map((img, index) => (
                                <div key={index} className="relative size-20 overflow-hidden rounded-lg border shadow-sm">
                                  <Image
                                    src={img}
                                    alt={`Ảnh ${index + 1}`}
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                  />
                                </div>
                              ))
                            )}
                          </div>
                          
                          {/* Video Thumbnail */}
                          {product.video && (
                            <div className="mt-3">
                              <div className="text-xs text-muted-foreground mb-2">Video sản phẩm:</div>
                              <div 
                                className="relative size-20 rounded-lg border shadow-sm overflow-hidden cursor-pointer group"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setPlayingVideo(product.video!)
                                }}
                              >
                                <video
                                  src={product.video}
                                  className="w-full h-full object-cover"
                                  preload="metadata"
                                  muted
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                                  <Play className="size-8 text-white fill-white" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Approve Confirm Dialog */}
      <AlertDialog
        open={approveDialog.open}
        onOpenChange={(open) => setApproveDialog((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duyệt sản phẩm này?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn duyệt sản phẩm{' '}
              <span className="font-semibold">{approveDialog.productName}</span>?
              Sản phẩm sẽ được hiển thị trên hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveConfirm}
              className="bg-green-600 hover:bg-green-700"
            >
              Duyệt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <RejectProductDialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog((prev) => ({ ...prev, open }))}
        productName={rejectDialog.productName}
        onConfirm={handleRejectConfirm}
        isLoading={actioningProductId === rejectDialog.productId}
      />

      {/* Fullscreen Video Modal */}
      {playingVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setPlayingVideo(null)}
        >
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] p-4 animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-0 right-0 z-10 p-2 text-white/70 hover:text-white transition-colors"
              onClick={() => setPlayingVideo(null)}
            >
              <X className="size-8" />
            </button>
            <div className="relative rounded-lg overflow-hidden bg-black shadow-2xl">
              <video
                src={playingVideo}
                controls
                autoPlay
                className="w-full h-full max-h-[80vh]"
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
