'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Trash2, Pencil, ImageIcon } from 'lucide-react'
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
import { Brand } from '~/zodSchema/admin.schema'

type BrandTableProps = {
  brands: Brand[]
  onEdit: (brand: Brand) => void
  onDelete: (brandId: string) => void
  isLoading?: boolean
}

export default function BrandTable({
  brands,
  onEdit,
  onDelete,
  isLoading = false,
}: BrandTableProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    brandId: string
    brandName: string
  }>({
    open: false,
    brandId: '',
    brandName: '',
  })

  const handleConfirmDelete = () => {
    onDelete(deleteDialog.brandId)
    setDeleteDialog({ open: false, brandId: '', brandName: '' })
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    )
  }

  if (brands.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Không có thương hiệu nào</div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-20">Logo</TableHead>
              <TableHead className="min-w-[150px]">Tên</TableHead>
              <TableHead className="min-w-[250px]">Mô tả</TableHead>
              <TableHead className="min-w-[120px]">Quốc gia</TableHead>
              <TableHead className="w-28">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id} className="hover:bg-muted/30">
                <TableCell>
                  {brand.logo ? (
                    <div className="relative size-12 overflow-hidden rounded-md border">
                      <Image
                        src={brand.logo}
                        alt={brand.name}
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
                <TableCell>
                  <div className="font-medium">{brand.name}</div>
                </TableCell>
                <TableCell>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {brand.description}
                  </p>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{brand.country}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Cập nhật"
                      onClick={() => onEdit(brand)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Xóa"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          brandId: brand.id,
                          brandName: brand.name,
                        })
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa thương hiệu?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thương hiệu{' '}
              <span className="font-semibold">{deleteDialog.brandName}</span>? Hành động
              này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
