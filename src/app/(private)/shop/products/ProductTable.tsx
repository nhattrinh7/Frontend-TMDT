'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Fragment, useState } from 'react'
import { ChevronDown, ChevronRight, Eye, EyeOff, Pencil, ExternalLink, Trash2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { ProductWithVariants } from '~/zodSchema/product.schema'
import { formatPrice } from '~/lib/utils'
import DeleteProductDialog from '~/app/(private)/shop/products/DeleteProductDialog'

type TabType = 'active' | 'rejected' | 'pending' | 'hidden'

type ProductTableProps = {
  products: ProductWithVariants[]
  activeTab: TabType
  onHide?: (productId: string) => void
  onUnhide?: (productId: string) => void
  onDelete?: (productId: string) => void
  isLoading?: boolean
}

export default function ProductTable({
  products,
  activeTab,
  onHide,
  onUnhide,
  onDelete,
  isLoading = false,
}: ProductTableProps) {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null)

  const toggleExpand = (productId: string) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }

  // Calculate product level info
  const getProductSummary = (product: ProductWithVariants) => {
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
      skuCount: variants.length,
    }
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

  // Handle delete button click
  const handleDeleteClick = (productId: string, productName: string) => {
    setProductToDelete({ id: productId, name: productName })
    setDeleteDialogOpen(true)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (productToDelete && onDelete) {
      onDelete(productToDelete.id)
    }
    setDeleteDialogOpen(false)
    setProductToDelete(null)
  }

  // Render actions based on tab
  const renderActions = (product: ProductWithVariants) => {
    switch (activeTab) {
    case 'active':
      return (
        <div className='flex items-center gap-1'>
          <Link href={`/shop/products/update?id=${product.id}`}>
            <Button variant='ghost' size='icon' title='Cập nhật'>
              <Pencil className='size-4' />
            </Button>
          </Link>
          {onHide && (
            <Button
              variant='ghost'
              size='icon'
              title='Ẩn sản phẩm'
              onClick={() => onHide(product.id)}
            >
              <EyeOff className='size-4' />
            </Button>
          )}
          <Link href={`/shop/products/view?id=${product.id}`}>
            <Button variant='ghost' size='icon' title='Xem chi tiết'>
              <ExternalLink className='size-4' />
            </Button>
          </Link>
          {onDelete && (
            <Button
              variant='ghost'
              size='icon'
              title='Xóa sản phẩm'
              onClick={() => handleDeleteClick(product.id, product.name)}
            >
              <Trash2 className='size-4 text-destructive' />
            </Button>
          )}
        </div>
      )
    case 'rejected':
    case 'pending':
      return (
        <div className='flex items-center gap-1'>
          <Link href={`/shop/products/view?id=${product.id}`}>
            <Button variant='ghost' size='icon' title='Xem chi tiết'>
              <ExternalLink className='size-4' />
            </Button>
          </Link>
          {onDelete && (
            <Button
              variant='ghost'
              size='icon'
              title='Xóa sản phẩm'
              onClick={() => handleDeleteClick(product.id, product.name)}
            >
              <Trash2 className='size-4 text-destructive' />
            </Button>
          )}
        </div>
      )
    case 'hidden':
      return (
        <div className='flex items-center gap-1'>
          <Link href={`/shop/products/view?id=${product.id}`}>
            <Button variant='ghost' size='icon' title='Xem chi tiết'>
              <ExternalLink className='size-4' />
            </Button>
          </Link>
          {onUnhide && (
            <Button
              variant='ghost'
              size='icon'
              title='Hiển thị đến người dùng'
              onClick={() => onUnhide(product.id)}
            >
              <Eye className='size-4' />
            </Button>
          )}
          {onDelete && (
            <Button
              variant='ghost'
              size='icon'
              title='Xóa sản phẩm'
              onClick={() => handleDeleteClick(product.id, product.name)}
            >
              <Trash2 className='size-4 text-destructive' />
            </Button>
          )}
        </div>
      )
    default:
      return null
    }
  }

  // Render table header based on tab
  const renderTableHeader = () => {
    switch (activeTab) {
    case 'active':
      return (
        <TableRow className='bg-muted/50'>
          <TableHead className='w-12'></TableHead>
          <TableHead className='w-20'>Ảnh</TableHead>
          <TableHead className='min-w-[200px]'>Tên sản phẩm</TableHead>
          <TableHead>Doanh số</TableHead>
          <TableHead>Giá</TableHead>
          <TableHead>Kho hàng</TableHead>
          <TableHead className='w-32'>Thao tác</TableHead>
        </TableRow>
      )
    case 'rejected':
      return (
        <TableRow className='bg-muted/50'>
          <TableHead className='w-12'></TableHead>
          <TableHead className='w-20'>Ảnh</TableHead>
          <TableHead className='min-w-[200px]'>Tên sản phẩm</TableHead>
          <TableHead>Thời gian cập nhật</TableHead>
          <TableHead className='min-w-[200px]'>Lý do vi phạm</TableHead>
          <TableHead className='w-24'>Thao tác</TableHead>
        </TableRow>
      )
    case 'pending':
      return (
        <TableRow className='bg-muted/50'>
          <TableHead className='w-12'></TableHead>
          <TableHead className='w-20'>Ảnh</TableHead>
          <TableHead className='min-w-[200px]'>Tên sản phẩm</TableHead>
          <TableHead>Thời gian cập nhật</TableHead>
          <TableHead>Giá</TableHead>
          <TableHead>Kho hàng</TableHead>
          <TableHead className='w-24'>Thao tác</TableHead>
        </TableRow>
      )
    case 'hidden':
      return (
        <TableRow className='bg-muted/50'>
          <TableHead className='w-12'></TableHead>
          <TableHead className='w-20'>Ảnh</TableHead>
          <TableHead className='min-w-[200px]'>Tên sản phẩm</TableHead>
          <TableHead>Doanh số</TableHead>
          <TableHead>Giá</TableHead>
          <TableHead>Kho hàng</TableHead>
          <TableHead className='w-32'>Thao tác</TableHead>
        </TableRow>
      )
    default:
      return null
    }
  }

  // Render product row based on tab
  const renderProductRow = (product: ProductWithVariants, summary: ReturnType<typeof getProductSummary>) => {
    const hasVariants = (product.variants?.length || 0) > 0
    const isExpanded = expandedProducts.has(product.id)

    switch (activeTab) {
    case 'active':
      return (
        <>
          <TableCell>
            {hasVariants && (
              <Button
                variant='ghost'
                size='icon'
                className='size-6'
                onClick={() => toggleExpand(product.id)}
              >
                {isExpanded ? (
                  <ChevronDown className='size-4' />
                ) : (
                  <ChevronRight className='size-4' />
                )}
              </Button>
            )}
          </TableCell>
          <TableCell>
            <div className='relative size-14 overflow-hidden rounded-md border'>
              <Image
                src={product.mainImage}
                alt={product.name}
                fill
                className='object-cover'
              />
            </div>
          </TableCell>
          <TableCell>
            <div className='space-y-1'>
              <p className='line-clamp-2 font-medium'>{product.name}</p>
              <p className='text-sm text-muted-foreground'>
                {summary.skuCount} SKU
              </p>
            </div>
          </TableCell>
          <TableCell className='font-medium'>{summary.totalSold}</TableCell>
          <TableCell className='font-medium'>{summary.priceRange}</TableCell>
          <TableCell>{summary.totalStock}</TableCell>
          <TableCell>{renderActions(product)}</TableCell>
        </>
      )
    case 'rejected':
      return (
        <>
          <TableCell>
            {hasVariants && (
              <Button
                variant='ghost'
                size='icon'
                className='size-6'
                onClick={() => toggleExpand(product.id)}
              >
                {isExpanded ? (
                  <ChevronDown className='size-4' />
                ) : (
                  <ChevronRight className='size-4' />
                )}
              </Button>
            )}
          </TableCell>
          <TableCell>
            <div className='relative size-14 overflow-hidden rounded-md border'>
              <Image
                src={product.mainImage}
                alt={product.name}
                fill
                className='object-cover'
              />
            </div>
          </TableCell>
          <TableCell>
            <div className='space-y-1'>
              <p className='line-clamp-2 font-medium'>{product.name}</p>
              <p className='text-sm text-muted-foreground'>
                {summary.skuCount} SKU
              </p>
            </div>
          </TableCell>
          <TableCell className='text-sm text-muted-foreground'>
            {formatDate(product.updatedAt)}
          </TableCell>
          <TableCell>
            <p className='text-sm text-destructive'>
              {product.rejectReason || 'Không có lý do'}
            </p>
          </TableCell>
          <TableCell>{renderActions(product)}</TableCell>
        </>
      )
    case 'pending':
      return (
        <>
          <TableCell>
            {hasVariants && (
              <Button
                variant='ghost'
                size='icon'
                className='size-6'
                onClick={() => toggleExpand(product.id)}
              >
                {isExpanded ? (
                  <ChevronDown className='size-4' />
                ) : (
                  <ChevronRight className='size-4' />
                )}
              </Button>
            )}
          </TableCell>
          <TableCell>
            <div className='relative size-14 overflow-hidden rounded-md border'>
              <Image
                src={product.mainImage}
                alt={product.name}
                fill
                className='object-cover'
              />
            </div>
          </TableCell>
          <TableCell>
            <div className='space-y-1'>
              <p className='line-clamp-2 font-medium'>{product.name}</p>
              <p className='text-sm text-muted-foreground'>
                {summary.skuCount} SKU
              </p>
            </div>
          </TableCell>
          <TableCell className='text-sm text-muted-foreground'>
            {formatDate(product.updatedAt)}
          </TableCell>
          <TableCell className='font-medium'>{summary.priceRange}</TableCell>
          <TableCell>{summary.totalStock}</TableCell>
          <TableCell>{renderActions(product)}</TableCell>
        </>
      )
    case 'hidden':
      return (
        <>
          <TableCell>
            {hasVariants && (
              <Button
                variant='ghost'
                size='icon'
                className='size-6'
                onClick={() => toggleExpand(product.id)}
              >
                {isExpanded ? (
                  <ChevronDown className='size-4' />
                ) : (
                  <ChevronRight className='size-4' />
                )}
              </Button>
            )}
          </TableCell>
          <TableCell>
            <div className='relative size-14 overflow-hidden rounded-md border'>
              <Image
                src={product.mainImage}
                alt={product.name}
                fill
                className='object-cover'
              />
            </div>
          </TableCell>
          <TableCell>
            <div className='space-y-1'>
              <p className='line-clamp-2 font-medium'>{product.name}</p>
              <p className='text-sm text-muted-foreground'>
                {summary.skuCount} SKU
              </p>
            </div>
          </TableCell>
          <TableCell className='font-medium'>{summary.totalSold}</TableCell>
          <TableCell className='font-medium'>{summary.priceRange}</TableCell>
          <TableCell>{summary.totalStock}</TableCell>
          <TableCell>{renderActions(product)}</TableCell>
        </>
      )
    default:
      return null
    }
  }

  // Render variant row based on tab
  const renderVariantRow = (variant: ProductWithVariants['variants'][0]) => {
    switch (activeTab) {
    case 'active':
    case 'hidden':
      return (
        <>
          <TableCell></TableCell>
          <TableCell>
            {variant.image ? (
              <div className='relative size-10 overflow-hidden rounded-md border'>
                <Image
                  src={variant.image}
                  alt={variant.sku}
                  fill
                  className='object-cover'
                />
              </div>
            ) : (
              <div className='flex size-10 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground'>
                N/A
              </div>
            )}
          </TableCell>
          <TableCell>
            <p className='text-sm text-muted-foreground'>
              SKU: {variant.sku}
            </p>
          </TableCell>
          <TableCell className='font-medium'>{variant.soldQuantity || 0}</TableCell>
          <TableCell className='font-medium'>
            {formatPrice(variant.price)}
          </TableCell>
          <TableCell>{variant.stock || 0}</TableCell>
          <TableCell></TableCell>
        </>
      )
    case 'rejected':
      return (
        <>
          <TableCell></TableCell>
          <TableCell>
            {variant.image ? (
              <div className='relative size-10 overflow-hidden rounded-md border'>
                <Image
                  src={variant.image}
                  alt={variant.sku}
                  fill
                  className='object-cover'
                />
              </div>
            ) : (
              <div className='flex size-10 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground'>
                N/A
              </div>
            )}
          </TableCell>
          <TableCell>
            <p className='text-sm text-muted-foreground'>
              SKU: {variant.sku}
            </p>
          </TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
        </>
      )
    case 'pending':
      return (
        <>
          <TableCell></TableCell>
          <TableCell>
            {variant.image ? (
              <div className='relative size-10 overflow-hidden rounded-md border'>
                <Image
                  src={variant.image}
                  alt={variant.sku}
                  fill
                  className='object-cover'
                />
              </div>
            ) : (
              <div className='flex size-10 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground'>
                N/A
              </div>
            )}
          </TableCell>
          <TableCell>
            <p className='text-sm text-muted-foreground'>
              SKU: {variant.sku}
            </p>
          </TableCell>
          <TableCell></TableCell>
          <TableCell className='font-medium'>
            {formatPrice(variant.price)}
          </TableCell>
          <TableCell>{variant.stock || 0}</TableCell>
          <TableCell></TableCell>
        </>
      )
    default:
      return null
    }
  }

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-muted-foreground'>Đang tải...</div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-muted-foreground'>Không có sản phẩm nào</div>
      </div>
    )
  }

  return (
    <>
      <div className='rounded-lg border'>
        <Table>
          <TableHeader>
            {renderTableHeader()}
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const isExpanded = expandedProducts.has(product.id)
              const summary = getProductSummary(product)

              return (
                <Fragment key={product.id}>
                  {/* Product Row */}
                  <TableRow className='hover:bg-muted/30'>
                    {renderProductRow(product, summary)}
                  </TableRow>

                  {/* Variant Rows */}
                  {isExpanded &&
                    product.variants?.map((variant) => (
                      <TableRow
                        key={variant.id}
                        className='bg-muted/20 hover:bg-muted/40'
                      >
                        {renderVariantRow(variant)}
                      </TableRow>
                    ))}
                </Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        productName={productToDelete?.name || ''}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}
