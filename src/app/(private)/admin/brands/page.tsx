'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { toast } from 'sonner'
import BrandTable from '~/app/(private)/admin/brands/BrandTable'
import BrandSearch from '~/app/(private)/admin/brands/BrandSearch'
import BrandPagination from '~/app/(private)/admin/brands/BrandPagination'
import BrandFormDialog from '~/app/(private)/admin/brands/BrandFormDialog'
import {
  getBrandsPaginatedAPI,
  createBrandAPI,
  updateBrandAPI,
  deleteBrandAPI,
} from '~/apiRequests/admin.apiRequest'
import { Brand, BrandFormInput, AdminPaginationMeta } from '~/zodSchema/admin.schema'

const DEFAULT_LIMIT = 10

export default function ManageBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [meta, setMeta] = useState<AdminPaginationMeta>({
    total: 0,
    page: 1,
    limit: DEFAULT_LIMIT,
    totalPages: 0,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Dialog state
  const [formDialog, setFormDialog] = useState<{
    open: boolean
    brand: Brand | null
  }>({
    open: false,
    brand: null,
  })

  const fetchBrands = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await getBrandsPaginatedAPI({
        page: meta.page,
        limit: meta.limit,
        search: searchQuery || undefined,
      })

      if (response) {
        setBrands(response.brands)
        setMeta(response.meta)
      }
    } catch {
      toast.error('Không thể tải danh sách thương hiệu')
    } finally {
      setIsLoading(false)
    }
  }, [meta.page, meta.limit, searchQuery])

  useEffect(() => {
    fetchBrands()
  }, [fetchBrands])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setMeta((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setMeta((prev) => ({ ...prev, page }))
  }

  const handleCreateClick = () => {
    setFormDialog({ open: true, brand: null })
  }

  const handleEditClick = (brand: Brand) => {
    setFormDialog({ open: true, brand })
  }

  const handleFormSubmit = async (data: BrandFormInput) => {
    setIsSubmitting(true)
    try {
      if (formDialog.brand) {
        // Update
        await updateBrandAPI(formDialog.brand.id, data)
        toast.success('Đã cập nhật thương hiệu thành công')
      } else {
        // Create
        await createBrandAPI(data)
        toast.success('Đã tạo thương hiệu mới thành công')
      }
      setFormDialog({ open: false, brand: null })
      fetchBrands()
    } catch {
      toast.error(
        formDialog.brand
          ? 'Không thể cập nhật thương hiệu'
          : 'Không thể tạo thương hiệu'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (brandId: string) => {
    try {
      await deleteBrandAPI(brandId)
      toast.success('Đã xóa thương hiệu thành công')
      fetchBrands()
    } catch {
      toast.error('Không thể xóa thương hiệu')
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#004643]">Quản lý thương hiệu</h1>
        <Button
          className="gap-2 bg-[#004643] hover:bg-[#004643]/90"
          onClick={handleCreateClick}
        >
          <Plus className="size-4" />
          Tạo thương hiệu mới
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-4">
        <BrandSearch onSearch={handleSearch} />
        <div className="text-sm text-muted-foreground">
          Tổng: {meta.total} thương hiệu
        </div>
      </div>

      {/* Table */}
      <BrandTable
        brands={brands}
        onEdit={handleEditClick}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* Pagination */}
      <div className="flex justify-center">
        <BrandPagination meta={meta} onPageChange={handlePageChange} />
      </div>

      {/* Form Dialog */}
      <BrandFormDialog
        open={formDialog.open}
        onOpenChange={(open) => setFormDialog((prev) => ({ ...prev, open }))}
        brand={formDialog.brand}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}