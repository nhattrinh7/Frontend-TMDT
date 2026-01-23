import http from '~/config/http'
import { ApiResponse } from '~/interface/response.interface'
import {
  UsersPaginatedResponse,
  GetUsersPaginatedParams,
  BrandsPaginatedResponse,
  GetBrandsPaginatedParams,
  BrandFormInput,
  Brand,
  ShopsPaginatedResponse,
  GetShopsPaginatedParams,
} from '~/zodSchema/admin.schema'

// ========== Admin Users Management APIs ==========

// Lấy danh sách users với pagination, search và filter theo status
export const getUsersPaginatedAPI = async (params: GetUsersPaginatedParams) => {
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.append('page', params.page.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())
  if (params.search) searchParams.append('search', params.search)
  searchParams.append('status', params.status)

  const queryString = searchParams.toString()
  const url = `/api/v1/admin/users${queryString ? `?${queryString}` : ''}`

  const response = await http.get<ApiResponse<UsersPaginatedResponse>>(url)
  return response.data
}

// Ban user
export const banUserAPI = async (userId: string) => {
  const response = await http.patch<ApiResponse<void>>(
    `/api/v1/admin/users/${userId}/ban`
  )
  return response.data
}

// Unban user
export const unbanUserAPI = async (userId: string) => {
  const response = await http.patch<ApiResponse<void>>(
    `/api/v1/admin/users/${userId}/unban`
  )
  return response.data
}

// ========== Admin Brands Management APIs ==========

// Lấy danh sách brands với pagination và search
export const getBrandsPaginatedAPI = async (params: GetBrandsPaginatedParams) => {
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.append('page', params.page.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())
  if (params.search) searchParams.append('search', params.search)

  const queryString = searchParams.toString()
  const url = `/api/v1/brands${queryString ? `?${queryString}` : ''}`

  const response = await http.get<ApiResponse<BrandsPaginatedResponse>>(url)
  return response.data
}

// Tạo brand mới
export const createBrandAPI = async (data: BrandFormInput) => {
  const response = await http.post<ApiResponse<Brand>>('/api/v1/brands', data)
  return response.data
}

// Cập nhật brand
export const updateBrandAPI = async (brandId: string, data: BrandFormInput) => {
  const response = await http.put<ApiResponse<Brand>>(
    `/api/v1/brands/${brandId}`,
    data
  )
  return response.data
}

// Xóa brand
export const deleteBrandAPI = async (brandId: string) => {
  const response = await http.delete<ApiResponse<void>>(`/api/v1/brands/${brandId}`)
  return response.data
}

// Upload brand logo
export const uploadBrandLogoAPI = async (file: File) => {
  const formData = new FormData()
  formData.append('brand-logo', file)

  const response = await http.post<ApiResponse<string>>(
    '/api/v1/brands/upload-logo',
    formData
  )
  return response.data
}

// ========== Admin Shops Management APIs ==========

// Lấy danh sách categoryIds cấp 1 mà role quản lý
export const getTopLevelCategoryIdsByRoleIdAPI = async (roleId: string) => {
  const response = await http.get<ApiResponse<string[]>>(
    `/api/v1/roles/${roleId}/category-ids/top-level`
  )
  return response.data
}

// Lấy danh sách shops với pagination, search và filter theo status
export const getShopsPaginatedAPI = async (params: GetShopsPaginatedParams) => {
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.append('page', params.page.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())
  searchParams.append('status', params.status)
  if (params.search) searchParams.append('search', params.search)
  if (params.categoryIds.length > 0) {
    searchParams.append('categoryIds', params.categoryIds.join(','))
  }

  const queryString = searchParams.toString()
  const url = `/api/v1/admin/shops${queryString ? `?${queryString}` : ''}`

  const response = await http.get<ApiResponse<ShopsPaginatedResponse>>(url)
  return response.data
}

// Duyệt shop
export const approveShopAPI = async (shopId: string) => {
  const response = await http.patch<ApiResponse<void>>(
    `/api/v1/admin/shops/${shopId}/approve`
  )
  return response.data
}

// Từ chối shop
export const rejectShopAPI = async (shopId: string, reason: string) => {
  const response = await http.patch<ApiResponse<void>>(
    `/api/v1/admin/shops/${shopId}/reject`,
    { reason }
  )
  return response.data
}

// Ban shop
export const banShopAPI = async (shopId: string) => {
  const response = await http.patch<ApiResponse<{ message: string }>>(
    `/api/v1/admin/shops/${shopId}/ban`
  )
  return response.data
}

// Unban shop
export const unbanShopAPI = async (shopId: string) => {
  const response = await http.patch<ApiResponse<{ message: string }>>(
    `/api/v1/admin/shops/${shopId}/unban`
  )
  return response.data
}
