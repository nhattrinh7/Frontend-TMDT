import http from '~/config/http'
import { ApiResponse } from '~/interface/response.interface'
import { SearchParams, SearchResponse } from '~/zodSchema/search.schema'

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

  const queryString = searchParams.toString()
  const url = `/api/v1/search${queryString ? `?${queryString}` : ''}`

  const response = await http.get<ApiResponse<SearchResponse>>(url)
  return response.data
}
