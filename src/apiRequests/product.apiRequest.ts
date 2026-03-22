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
  ProductToSold,
  ProductReviewsPaginatedResponse,
  ShopReviewsPaginatedResponse,
  ReportedReviewsPaginatedResponse,
} from '~/zodSchema/product.schema'
import { TodayRecommendationsResponse } from '~/zodSchema/search.schema'

// Upload áº£nh cho sáº£n pháº©m, áº£nh gÃ¬ cÅ©ng dÃ¹ng api nÃ y, cÅ©ng chá»‰ lÃ  gá»­i áº£nh lÃªn Ä‘á»ƒ láº¥y vá» url thÃ´i
export const uploadImageAPI = async (file: File) => {
  const formData = new FormData()
  formData.append('product-image', file)

  const response = await http.post<ApiResponse<UploadMediaResponse>>(
    '/api/v1/products/upload-image',
    formData
  )
  return response.data
}

// Upload video cho sáº£n pháº©m
export const uploadVideoAPI = async (file: File) => {
  const formData = new FormData()
  formData.append('product-video', file)

  const response = await http.post<ApiResponse<UploadMediaResponse>>(
    '/api/v1/products/upload-video',
    formData
  )
  return response.data
}

// Táº¡o sáº£n pháº©m má»›i
export const createProductAPI = async (data: CreateProductBody) => {
  const response = await http.post<ApiResponse<Product>>(
    '/api/v1/products',
    data
  )
  return response.data
}

// ========== APIs cho trang Quáº£n lÃ½ sáº£n pháº©m ==========

export type GetProductsPaginatedParams = {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  approveStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  shopId: string
}

// Láº¥y danh sÃ¡ch sáº£n pháº©m vá»›i pagination vÃ  filter
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

// Láº¥y chi tiáº¿t sáº£n pháº©m theo ID
export const getProductByIdAPI = async (productId: string) => {
  const response = await http.get<ApiResponse<ProductDetail>>(
    `/api/v1/products/${productId}`
  )
  return response.data
}

// áº¨n sáº£n pháº©m
export const hideProductAPI = async (productId: string) => {
  const response = await http.patch<ApiResponse<Product>>(
    `/api/v1/products/${productId}/hide`
  )
  return response.data
}

// Hiá»ƒn thá»‹ sáº£n pháº©m
export const unhideProductAPI = async (productId: string) => {
  const response = await http.patch<ApiResponse<Product>>(
    `/api/v1/products/${productId}/unhide`
  )
  return response.data
}

// Cáº­p nháº­t sáº£n pháº©m
export const updateProductAPI = async (productId: string, data: UpdateProductInput) => {
  const response = await http.put<ApiResponse<void>>(
    `/api/v1/products/${productId}`,
    data
  )
  return response.data
}

// XÃ³a má»m sáº£n pháº©m
export const softDeleteProductAPI = async (productId: string) => {
  const response = await http.delete<ApiResponse<void>>(
    `/api/v1/products/${productId}/soft-delete`
  )
  return response.data
}

// ========== APIs cho Admin duyá»‡t sáº£n pháº©m ==========

export type GetAdminProductsPaginatedParams = {
  page?: number
  limit?: number
  search?: string
  approveStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
}

// Láº¥y danh sÃ¡ch sáº£n pháº©m cho admin (khÃ´ng cáº§n shopId)
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

// Duyá»‡t sáº£n pháº©m
export const approveProductAPI = async (productId: string) => {
  const response = await http.patch<ApiResponse<void>>(
    `/api/v1/products/${productId}/approve`
  )
  return response
}

// Tá»« chá»‘i sáº£n pháº©m
export const rejectProductAPI = async (productId: string, rejectReason: string) => {
  const response = await http.patch<ApiResponse<void>>(
    `/api/v1/products/${productId}/reject`,
    { rejectReason }
  )
  return response
}

// ========== APIs cho trang Chi tiáº¿t sáº£n pháº©m (Public) ==========

// Láº¥y thÃ´ng tin sáº£n pháº©m Ä‘á»ƒ bÃ¡n (public)
export const getProductToSoldAPI = async (productId: string) => {
  const response = await http.get<ApiResponse<ProductToSold>>(
    `/api/v1/products/${productId}/to-sold`
  )
  return response.data
}

// Ghi nhận user vừa xem sản phẩm
export const trackProductViewAPI = async (productId: string) => {
  const response = await http.post<ApiResponse<void>>(
    '/api/v1/recommendations/views',
    { productId }
  )
  return response.data
}

// Gợi ý hôm nay
export const getTodayRecommendationsAPI = async (limit = 25) => {
  const searchParams = new URLSearchParams()
  if (limit) searchParams.append('limit', limit.toString())

  const queryString = searchParams.toString()
  const url = `/api/v1/recommendations${queryString ? `?${queryString}` : ''}`

  const response = await http.get<ApiResponse<TodayRecommendationsResponse>>(url)
  return response.data
}

// Láº¥y reviews cá»§a sáº£n pháº©m vá»›i pagination
export type GetProductReviewsParams = {
  productId: string
  page?: number
  limit?: number
  rating?: 1 | 2 | 3 | 4 | 5
  hasMedia?: boolean
}

export const getProductReviewsPaginatedAPI = async (params: GetProductReviewsParams) => {
  const searchParams = new URLSearchParams()
  
  if (params.page) searchParams.append('page', params.page.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())
  if (params.rating) searchParams.append('rating', params.rating.toString())
  if (params.hasMedia !== undefined) searchParams.append('hasMedia', params.hasMedia.toString())
  
  const queryString = searchParams.toString()
  const url = `/api/v1/products/${params.productId}/reviews${queryString ? `?${queryString}` : ''}`
  
  const response = await http.get<ApiResponse<ProductReviewsPaginatedResponse>>(url)
  return response.data
}

// BÃ¡o cÃ¡o review vi pháº¡m
export type ReportReviewBody = {
  reason: string
  description?: string
  reporterUsername: string
  reporterAvatar?: string | null
}

export const reportReviewAPI = async (reviewId: string, body: ReportReviewBody) => {
  const response = await http.post<ApiResponse<void>>(
    `/api/v1/reviews/${reviewId}/report`,
    body
  )
  return response.data
}

export type CreateReviewReplyBody = {
  shopId: string
  content: string
}

export const createReviewReplyAPI = async (reviewId: string, body: CreateReviewReplyBody) => {
  const response = await http.post<ApiResponse<void>>(
    `/api/v1/reviews/${reviewId}/reply`,
    body
  )
  return response.data
}

// T?o review cho s?n ph?m
export type CreateProductReviewBody = {
  orderId: string
  buyerUsername: string
  buyerAvatar?: string | null
  productName: string
  sku: string
  rating: 1 | 2 | 3 | 4 | 5
  content?: string
  images?: string[]
  video?: string
}

export const createProductReviewAPI = async (productId: string, body: CreateProductReviewBody) => {
  const response = await http.post<ApiResponse<void>>(
    `/api/v1/products/${productId}/reviews`,
    body
  )
  return response.data
}


// ========== Shop review APIs ==========
export type GetShopReviewsParams = {
  shopId: string
  page?: number
  limit?: number
  ratings?: number[]
  search?: string
  startDate?: string
  endDate?: string
}

export const getShopReviewsPaginatedAPI = async (params: GetShopReviewsParams) => {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.append('page', params.page.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())
  if (params.search) searchParams.append('search', params.search)
  if (params.ratings && params.ratings.length > 0) searchParams.append('ratings', params.ratings.join(','))
  if (params.startDate) searchParams.append('startDate', params.startDate)
  if (params.endDate) searchParams.append('endDate', params.endDate)

  const queryString = searchParams.toString()
  const url = `/api/v1/products/shop/${params.shopId}/reviews${queryString ? `?${queryString}` : ''}`

  const response = await http.get<ApiResponse<ShopReviewsPaginatedResponse>>(url)
  return response.data
}

export type GetReportedReviewsParams = {
  page?: number
  limit?: number
  isHidden?: boolean
}

export const getReportedReviewsPaginatedAPI = async (params: GetReportedReviewsParams) => {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.append('page', params.page.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())
  if (params.isHidden !== undefined) searchParams.append('isHidden', params.isHidden.toString())

  const queryString = searchParams.toString()
  const url = `/api/v1/products/reviews/reported${queryString ? `?${queryString}` : ''}`

  const response = await http.get<ApiResponse<ReportedReviewsPaginatedResponse>>(url)
  return response.data
}

export const hideReviewAPI = async (reviewId: string) => {
  const response = await http.patch<ApiResponse<void>>(
    `/api/v1/products/reviews/${reviewId}/hide`
  )
  return response.data
}






