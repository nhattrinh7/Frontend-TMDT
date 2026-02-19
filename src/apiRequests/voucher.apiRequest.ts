import http from '~/config/http'
import { ApiResponse } from '~/interface/response.interface'
import { CreateVoucherBodyType, Voucher } from '~/zodSchema/voucher.schema'

export const createVoucherAPI = async (data: CreateVoucherBodyType) => {
  await http.post<ApiResponse<Voucher>>('/api/v1/vouchers', data)
}

export const getShopVouchersAPI = async (shopId: string) => {
  const url = `/api/v1/vouchers?shopId=${shopId}`
  const response = await http.get<ApiResponse<Voucher[]>>(url)
  return response.data
}

export const softDeleteVoucherAPI = async (id: string) => {
  await http.delete<ApiResponse<void>>(`/api/v1/vouchers/${id}`)
}

// Szone Vouchers APIs
export interface SzoneVouchersPaginatedResponse {
  vouchers: Voucher[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface GetSzoneVouchersParams {
  page?: number
  limit?: number
  search?: string
  status: 'UPCOMING' | 'ACTIVE' | 'EXPIRED'
}

export const getSzoneVouchersPaginatedAPI = async (params: GetSzoneVouchersParams) => {
  const { page = 1, limit = 10, search, status } = params
  const searchParams = new URLSearchParams()
  searchParams.set('page', page.toString())
  searchParams.set('limit', limit.toString())
  searchParams.set('status', status)
  if (search) searchParams.set('search', search)
  
  const response = await http.get<ApiResponse<SzoneVouchersPaginatedResponse>>(
    `/api/v1/vouchers/szone?${searchParams.toString()}`
  )
  return response.data
}

export interface CreateSzoneVoucherBody {
  code: string
  name: string
  description: string
  discountType: 'FIXED' | 'PERCENT'
  discountValue: number
  startDate: string
  endDate: string
  usageLimit: number
  perUserLimit: number
  scope: 'ALL' | 'CATEGORY'
  selectedCategories?: string[]
}

export const createSzoneVoucherAPI = async (data: CreateSzoneVoucherBody) => {
  await http.post<ApiResponse<Voucher>>('/api/v1/admin/vouchers', data)
}

// Get Voucher Detail API
export interface VoucherDetailResponse {
  id: string
  shopId: string | null
  code: string
  name: string
  description: string
  discountType: 'FIXED' | 'PERCENT'
  discountValue: number
  minOrderValue: number
  maxDiscountValue: number | null
  startDate: string
  endDate: string
  usageLimit: number
  perUserLimit: number
  scope: 'ALL' | 'CATEGORY' | 'PRODUCT'
  isDeleted: boolean
  deletedBy: string | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  usedCount: number
  productIds: string[]
  categoryIds: string[]
}

export const getVoucherDetailAPI = async (id: string) => {
  const response = await http.get<ApiResponse<VoucherDetailResponse>>(`/api/v1/vouchers/${id}`)
  return response.data
}

// Delete Szone Voucher API
export const deleteSzoneVoucherAPI = async (id: string) => {
  await http.delete<ApiResponse<void>>(`/api/v1/admin/vouchers/${id}`)
}

// Update Szone Voucher API
export interface UpdateSzoneVoucherBody {
  code?: string
  name?: string
  description?: string
  discountType?: 'FIXED' | 'PERCENT'
  discountValue?: number
  startDate?: string
  endDate?: string
  usageLimit?: number
  perUserLimit?: number
  scope?: 'ALL' | 'CATEGORY'
  selectedCategories?: string[]
}

export const updateSzoneVoucherAPI = async (id: string, data: UpdateSzoneVoucherBody) => {
  await http.put<ApiResponse<Voucher>>(`/api/v1/admin/vouchers/${id}`, data)
}

// Update Shop Voucher API
export interface UpdateShopVoucherBody {
  code?: string
  name?: string
  description?: string
  discountType?: 'FIXED' | 'PERCENT'
  discountValue?: number
  startDate?: string
  endDate?: string
  usageLimit?: number
  perUserLimit?: number
  scope?: 'ALL' | 'PRODUCT'
  selectedProducts?: string[]
}

export const updateShopVoucherAPI = async (id: string, data: UpdateShopVoucherBody) => {
  await http.put<ApiResponse<Voucher>>(`/api/v1/vouchers/${id}`, data)
}