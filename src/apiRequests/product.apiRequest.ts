import http from '~/config/http'
import { ApiResponse } from '~/interface/response.interface'
import {
  UploadMediaResponse,
  CreateProductBody,
  Product,
  ProductsPaginatedResponse,
  UpdateProductInput,
  ProductDetail,
  AdminProductsPaginatedResponse,
} from '~/zodSchema/product.schema'

// Upload ảnh cho sản phẩm, ảnh gì cũng dùng api này, cũng chỉ là gửi ảnh lên để lấy về url thôi
export const uploadImageAPI = async (file: File) => {
  const formData = new FormData()
  formData.append('product-image', file)

  const response = await http.post<ApiResponse<UploadMediaResponse>>(
    '/api/v1/products/upload-image',
    formData
  )
  return response.data
}

// Upload video cho sản phẩm
export const uploadVideoAPI = async (file: File) => {
  const formData = new FormData()
  formData.append('product-video', file)

  const response = await http.post<ApiResponse<UploadMediaResponse>>(
    '/api/v1/products/upload-video',
    formData
  )
  return response.data
}

// Tạo sản phẩm mới
export const createProductAPI = async (data: CreateProductBody) => {
  const response = await http.post<ApiResponse<Product>>(
    '/api/v1/products',
    data
  )
  return response.data
}

// ========== APIs cho trang Quản lý sản phẩm ==========

export type GetProductsPaginatedParams = {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  approveStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  shopId: string
}

// Lấy danh sách sản phẩm với pagination và filter
export const getShopProductsPaginatedAPI = async (params: GetProductsPaginatedParams) => {
  const searchParams = new URLSearchParams()
  
  if (params.page) searchParams.append('page', params.page.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())
  if (params.search) searchParams.append('search', params.search)
  if (params.isActive !== undefined) searchParams.append('isActive', params.isActive.toString())
  if (params.approveStatus) searchParams.append('approveStatus', params.approveStatus)
  
  const queryString = searchParams.toString()
  const url = `/api/v1/products/shop/${params.shopId}${queryString ? `?${queryString}` : ''}`
  
  const response = await http.get<ApiResponse<ProductsPaginatedResponse>>(url)
  return response.data
}

// Lấy chi tiết sản phẩm theo ID
export const getProductByIdAPI = async (productId: string) => {
  const response = await http.get<ApiResponse<ProductDetail>>(
    `/api/v1/products/${productId}`
  )
  return response.data
}

// Ẩn sản phẩm
export const hideProductAPI = async (productId: string) => {
  const response = await http.patch<ApiResponse<Product>>(
    `/api/v1/products/${productId}/hide`
  )
  return response.data
}

// Hiển thị sản phẩm
export const unhideProductAPI = async (productId: string) => {
  const response = await http.patch<ApiResponse<Product>>(
    `/api/v1/products/${productId}/unhide`
  )
  return response.data
}

// Cập nhật sản phẩm
export const updateProductAPI = async (productId: string, data: UpdateProductInput) => {
  const response = await http.put<ApiResponse<void>>(
    `/api/v1/products/${productId}`,
    data
  )
  return response.data
}

// ========== APIs cho Admin duyệt sản phẩm ==========

export type GetAdminProductsPaginatedParams = {
  page?: number
  limit?: number
  search?: string
  approveStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
}

// Lấy danh sách sản phẩm cho admin (không cần shopId)
export const getProductsPaginatedAPI = async (params: GetAdminProductsPaginatedParams) => {
  const searchParams = new URLSearchParams()
  
  if (params.page) searchParams.append('page', params.page.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())
  if (params.search) searchParams.append('search', params.search)
  if (params.approveStatus) searchParams.append('approveStatus', params.approveStatus)
  
  const queryString = searchParams.toString()
  const url = `/api/v1/products${queryString ? `?${queryString}` : ''}`
  
  const response = await http.get<ApiResponse<AdminProductsPaginatedResponse>>(url)
  return response.data
}

// Duyệt sản phẩm
export const approveProductAPI = async (productId: string) => {
  const response = await http.patch<ApiResponse<void>>(
    `/api/v1/products/${productId}/approve`
  )
  return response
}

// Từ chối sản phẩm
export const rejectProductAPI = async (productId: string, rejectReason: string) => {
  const response = await http.patch<ApiResponse<void>>(
    `/api/v1/products/${productId}/reject`,
    { rejectReason }
  )
  return response
}

