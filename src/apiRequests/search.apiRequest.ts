import http from '~/config/http'
import { ApiResponse } from '~/interface/response.interface'
import { RootCategoryProductsResponse, SearchParams, SearchResponse } from '~/zodSchema/search.schema'

/**
 * Search API - Tìm kiếm sản phẩm và shop
 * @param params - Search parameters
 * @returns Search results with products and shops
 */
export const searchAPI = async (params: SearchParams) => {
  const searchParams = new URLSearchParams()

  // Thêm các params vào query string
  if (params.page) searchParams.append('page', params.page.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())
  if (params.search) searchParams.append('search', params.search)
  if (params.rootCategory) searchParams.append('rootCategory', params.rootCategory)
  if (params.minPrice !== undefined) searchParams.append('minPrice', params.minPrice.toString())
  if (params.maxPrice !== undefined) searchParams.append('maxPrice', params.maxPrice.toString())
  if (params.sort) searchParams.append('sort', params.sort)
  if (params.minRating !== undefined) searchParams.append('minRating', params.minRating.toString())
  if (params.maxRating !== undefined) searchParams.append('maxRating', params.maxRating.toString())
  if (params.shopId) searchParams.append('shopId', params.shopId)

  const queryString = searchParams.toString()
  const url = `/api/v1/searchs${queryString ? `?${queryString}` : ''}`

  const response = await http.get<ApiResponse<SearchResponse>>(url)
  return response.data
}

export type RootCategoryProductsParams = {
  rootCategory: string
  page?: number
  limit?: number
  sort?: 'asc' | 'desc'
  minPrice?: number
  maxPrice?: number
  minRating?: number
}

export const getRootCategoryProductsAPI = async (params: RootCategoryProductsParams) => {
  const searchParams = new URLSearchParams()

  searchParams.append('rootCategory', params.rootCategory)
  if (params.page) searchParams.append('page', params.page.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())
  if (params.sort) searchParams.append('sort', params.sort)
  if (params.minPrice !== undefined) searchParams.append('minPrice', params.minPrice.toString())
  if (params.maxPrice !== undefined) searchParams.append('maxPrice', params.maxPrice.toString())
  if (params.minRating !== undefined) searchParams.append('minRating', params.minRating.toString())

  const queryString = searchParams.toString()
  const url = `/api/v1/searchs/root-category-products${queryString ? `?${queryString}` : ''}`

  const response = await http.get<ApiResponse<RootCategoryProductsResponse>>(url)
  return response.data
}
