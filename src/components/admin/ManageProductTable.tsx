'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { ChevronDown, ChevronUp, Star } from 'lucide-react'
import { AdminProduct } from '~/zodSchema/product.schema'
import { formatPrice } from '~/lib/utils'

type ManageProductTableProps = {
  products: AdminProduct[]
  isLoading: boolean
}

export default function ManageProductTable({
  products,
  isLoading,
}: ManageProductTableProps) {
  const [expandedProductIds, setExpandedProductIds] = useState<Set<string>>(
    new Set()
  )

  const toggleExpand = (productId: string) => {
    const newExpanded = new Set(expandedProductIds)
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId)
    } else {
      newExpanded.add(productId)
    }
    setExpandedProductIds(newExpanded)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="text-muted-foreground">Đang tải danh sách sản phẩm...</div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-card text-card-foreground shadow-sm">
        <p className="text-muted-foreground">Không tìm thấy sản phẩm nào</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>Shop</TableHead>
            <TableHead>Danh mục</TableHead>
            <TableHead>Đánh giá</TableHead>
            <TableHead>Trạng thái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <>
              <TableRow key={product.id}>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(product.id)}
                  >
                    {expandedProductIds.has(product.id) ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 overflow-hidden rounded-md border">
                      <Image
                        src={product.mainImage}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium line-clamp-1 max-w-[200px]" title={product.name}>
                        {product.name}
                      </div>
                      {/* Show price range if multiple variants or single price */}
                      <div className="text-sm text-muted-foreground">
                        {product.variants && product.variants.length > 0
                          ? (() => {
                            const prices = product.variants.map((v) => v.price)
                            const minPrice = Math.min(...prices)
                            const maxPrice = Math.max(...prices)
                            return minPrice === maxPrice
                              ? formatPrice(minPrice)
                              : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
                          })()
                          : 'Chưa có giá'}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {product.shop.logo && (
                      <div className="relative size-6 overflow-hidden rounded-full border">
                        <Image
                          src={product.shop.logo}
                          alt={product.shop.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <span className="text-sm font-medium">{product.shop.name}</span>
                  </div>
                </TableCell>
                <TableCell>{product.category.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="size-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">
                      {product.ratingAvg.toFixed(1)} ({product.ratingCount})
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product.approveStatus === 'ACCEPTED'
                        ? 'default'
                        : product.approveStatus === 'REJECTED'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {product.approveStatus === 'ACCEPTED'
                      ? 'Đã duyệt'
                      : product.approveStatus === 'REJECTED'
                        ? 'Đã từ chối'
                        : 'Chờ duyệt'}
                  </Badge>
                </TableCell>
              </TableRow>

              {expandedProductIds.has(product.id) && (
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={6} className="p-4">
                    <div className="grid grid-cols-2 gap-8">
                      {/* Left Column: Additional Info */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Thông tin chi tiết</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <span className="text-muted-foreground">Đơn vị:</span>
                            <span>{product.unit}</span>
                            <span className="text-muted-foreground">Ngày tạo:</span>
                            <span>{new Date(product.createdAt).toLocaleDateString('vi-VN')}</span>
                            <span className="text-muted-foreground">Cập nhật cuối:</span>
                            <span>{new Date(product.updatedAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>

                        {product.rejectReason && product.approveStatus === 'REJECTED' && (
                          <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
                            <h4 className="font-semibold text-destructive mb-1 text-sm">Lí do từ chối:</h4>
                            <p className="text-sm text-destructive">{product.rejectReason}</p>
                          </div>
                        )}

                        <div>
                          <h4 className="font-semibold mb-2">Thuộc tính</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm bg-background p-3 rounded border">
                            {Object.entries(product.attributes).map(([key, value]) => (
                              <div key={key} className="contents">
                                <span className="text-muted-foreground">{key}:</span>
                                <span>{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Images, Video, Bio */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Mô tả</h4>
                          <p className="text-sm text-muted-foreground line-clamp-4">{product.descriptions}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Thư viện ảnh ({product.galleryImage.length})</h4>
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {product.galleryImage.map((img, idx) => (
                              <div key={idx} className="relative size-20 shrink-0 border rounded overflow-hidden">
                                <Image src={img} alt="" fill className="object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {product.video && (
                          <div>
                            <h4 className="font-semibold mb-2">Video</h4>
                            <video src={product.video} controls className="w-full max-h-[200px] rounded border bg-black/5" />
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
